import { test } from 'node:test';
import assert from 'node:assert/strict';
import { moneyMinor, validatePlanningSnapshot as validate } from '../../supabase/functions/_shared/planning-guard.mjs';
const fixture = () => ({
  actorId: 'editor', membership: { userId: 'editor', tripId: 'trip-a', role: 'editor', leftAt: null },
  trip: { id: 'trip-a', version: 7, start: '2026-10-23', end: '2026-10-25', travelers: 3, budget: '10000.00', currency: 'KZT' },
  expectedVersion: 7, requiredCategories: ['visit'], now: Date.parse('2026-10-23T12:00:00Z'), maxPriceAgeMs: 86400000,
  lines: [{ id: 'item-a', tripId: 'trip-a', placeId: 'place-a', active: true, chargeKey: 'visit-a', category: 'visit', day: '2026-10-24', quantity: 1, price: '2500.00', unit: 'per_person', currency: 'KZT', source: 'synthetic fixture', checkedAt: '2026-10-23T10:00:00Z' }]
});
const reject = (code, change) => test(code + ': ' + change.name, () => {
  const input = fixture(); change(input);
  assert.throws(() => validate(input), e => e.code === code);
});
test('trusted per-person normalization, without input mutation', () => {
  const input = fixture(), before = structuredClone(input);
  assert.deepEqual(validate(input), { totalMinor: '750000', remainingMinor: '250000', baseVersion: 7 });
  assert.deepEqual(input, before);
});
test('normalized group amount stays constant for different party sizes', () => {
  for (const travelers of [1, 3, 100]) {
    const input = fixture(); input.trip.travelers = travelers;
    Object.assign(input.lines[0], { unit: 'normalized_group', price: '7500.00' });
    assert.equal(validate(input).totalMinor, '750000');
  }
});
test('owner is permitted', () => { const x = fixture(); x.membership.role = 'owner'; assert.equal(validate(x).totalMinor, '750000'); });
reject('FORBIDDEN', function outsider(x) { x.membership = null; });
reject('FORBIDDEN', function removed(x) { x.membership.leftAt = '2026-10-23T11:00:00Z'; });
reject('FORBIDDEN', function forgedIdentity(x) { x.actorId = 'someone-else'; });
reject('FORBIDDEN', function foreignTrip(x) { x.membership.tripId = 'trip-b'; });
reject('FORBIDDEN', function unsupportedRole(x) { x.membership.role = 'viewer'; });
reject('VERSION_CONFLICT', function stale(x) { x.expectedVersion = 6; });
reject('DOUBLE_NORMALIZATION', function quantityOnNormalized(x) { Object.assign(x.lines[0], { unit: 'normalized_group', quantity: 3 }); });
reject('INCOMPLETE_ESTIMATE', function missingPrice(x) { x.lines[0].price = null; });
reject('STALE_PRICE', function stalePrice(x) { x.lines[0].checkedAt = '2026-10-20T10:00:00Z'; });
reject('STALE_PRICE', function futurePrice(x) { x.lines[0].checkedAt = '2026-10-24T10:00:00Z'; });
test('missing or impossible quote timestamp rejected', () => {
  for (const checkedAt of [null, '2026-02-30T10:00:00Z', '2026-10-22T24:00:00Z']) {
    const x = fixture(); x.lines[0].checkedAt = checkedAt;
    assert.throws(() => validate(x), e => e.code === 'STALE_PRICE');
  }
});
reject('INVALID_PLACE', function inactivePlace(x) { x.lines[0].active = false; });
reject('INVALID_PLACE', function foreignLine(x) { x.lines[0].tripId = 'trip-b'; });
reject('INVALID_DATE', function impossibleDate(x) { x.lines[0].day = '2026-02-30'; });
reject('OUTSIDE_TRIP', function wrongDay(x) { x.lines[0].day = '2026-10-26'; });
reject('DUPLICATE_CHARGE', function doubleCharge(x) { x.lines.push({ ...x.lines[0], id: 'different' }); });
reject('INCOMPLETE_ESTIMATE', function missingCategory(x) { x.requiredCategories.push('lodging'); });
reject('INCOMPLETE_ESTIMATE', function currencyMismatch(x) { x.lines[0].currency = 'USD'; });
reject('INVALID_UNIT', function unknownUnit(x) { x.lines[0].unit = 'room_night'; });
reject('OVER_BUDGET', function centOver(x) { x.lines[0].unit = 'per_group'; x.lines[0].price = '10000.01'; });
reject('MONEY_OVERFLOW', function multipliedOverflow(x) { x.lines[0].price = '9999999999.99'; });
test('exact budget boundary including free sourced item', () => {
  const x = fixture(); x.trip.budget = '7500'; assert.equal(validate(x).remainingMinor, '0');
  x.lines[0].price = '0'; assert.equal(validate(x).totalMinor, '0');
});
test('decimal parsing is exact, rejects precision loss and negatives', () => {
  assert.equal(moneyMinor('0.01'), 1n); assert.equal(moneyMinor('9999999999.99'), 999999999999n);
  for (const value of ['1.001', '-1', 1.23, 'NaN', '1e3', '10000000000']) assert.throws(() => moneyMinor(value));
});
test('server ignores forged client totals and uses trusted prices', () => {
  const x = fixture(); x.clientTotal = '0'; assert.equal(validate(x).totalMinor, '750000');
});
