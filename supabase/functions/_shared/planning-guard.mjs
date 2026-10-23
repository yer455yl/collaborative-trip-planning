/** Pure trusted-input guard for a future Supabase command. No HTTP, JWT, SQL or deployment. */
export class PlanningError extends Error {
  constructor(code) { super(code); this.code = code; }
}
const fail = code => { throw new PlanningError(code); };
const MAX = 999999999999n;
export function moneyMinor(value) {
  if (typeof value !== 'string' || !/^\d+(?:\.\d{1,2})?$/.test(value) || value.length > 16) fail('INVALID_MONEY');
  const [whole, fraction = ''] = value.split('.');
  const result = BigInt(whole) * 100n + BigInt(fraction.padEnd(2, '0'));
  if (result > MAX) fail('MONEY_OVERFLOW');
  return result;
}
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail('INVALID_DATE');
  const ms = Date.parse(value + 'T00:00:00Z');
  if (!Number.isFinite(ms) || new Date(ms).toISOString().slice(0, 10) !== value) fail('INVALID_DATE');
  return value;
}
function integer(value, min) { if (!Number.isSafeInteger(value) || value < min) fail('INVALID_INTEGER'); }
function nonempty(value) { return typeof value === 'string' && value.trim().length > 0; }
/** All context/snapshot values MUST come from authenticated server reads, never request JSON.
 * Membership/version must still be checked under the database transaction lock before commit.
 * Lines are trusted, expanded economic charges, not arbitrary client plan-item costs.
 * This guard does not prove scheduling, category completeness or atomicity.
 */
export function validatePlanningSnapshot({ actorId, membership, trip, expectedVersion, lines, requiredCategories, now, maxPriceAgeMs }) {
  if (!nonempty(actorId) || !membership || membership.userId !== actorId || membership.tripId !== trip.id || membership.leftAt != null || !['owner', 'editor'].includes(membership.role)) fail('FORBIDDEN');
  integer(expectedVersion, 0); integer(trip.version, 0);
  if (expectedVersion !== trip.version) fail('VERSION_CONFLICT');
  integer(trip.travelers, 1); integer(maxPriceAgeMs, 1);
  if (!Number.isSafeInteger(now)) fail('INVALID_CLOCK');
  const start = date(trip.start), end = date(trip.end);
  if (end < start || trip.currency !== 'KZT') fail('INVALID_TRIP');
  const limit = moneyMinor(trip.budget);
  if (limit === 0n) fail('INVALID_TRIP');
  if (!Array.isArray(lines) || !Array.isArray(requiredCategories) || !requiredCategories.length || requiredCategories.some(x => !nonempty(x))) fail('INCOMPLETE_ESTIMATE');
  const ids = new Set(), charges = new Set(), categories = new Set();
  let total = 0n;
  for (const line of lines) {
    if (!nonempty(line.id) || !nonempty(line.chargeKey) || !nonempty(line.category)) fail('INVALID_LINE');
    if (ids.has(line.id) || charges.has(line.chargeKey)) fail('DUPLICATE_CHARGE');
    ids.add(line.id); charges.add(line.chargeKey);
    const day = date(line.day);
    if (day < start || day > end) fail('OUTSIDE_TRIP');
    integer(line.quantity, 1);
    if (line.tripId !== trip.id || !nonempty(line.placeId) || line.active !== true) fail('INVALID_PLACE');
    if (!nonempty(line.source) || line.currency !== 'KZT' || line.price == null) fail('INCOMPLETE_ESTIMATE');
    if (typeof line.checkedAt !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(line.checkedAt)) fail('STALE_PRICE');
    const checked = Date.parse(line.checkedAt);
    if (!Number.isFinite(checked) || new Date(checked).toISOString().slice(0, 19) !== line.checkedAt.slice(0, 19) || checked > now || now - checked > maxPriceAgeMs) fail('STALE_PRICE');
    if (!['per_group', 'per_person', 'normalized_group'].includes(line.unit)) fail('INVALID_UNIT');
    if (line.unit === 'normalized_group' && line.quantity !== 1) fail('DOUBLE_NORMALIZATION');
    const factor = BigInt(line.quantity) * (line.unit === 'per_person' ? BigInt(trip.travelers) : 1n);
    const amount = moneyMinor(line.price) * factor;
    if (amount > MAX || total + amount > MAX) fail('MONEY_OVERFLOW');
    total += amount; categories.add(line.category);
  }
  if (requiredCategories.some(x => !categories.has(x))) fail('INCOMPLETE_ESTIMATE');
  if (total > limit) fail('OVER_BUDGET');
  return Object.freeze({ totalMinor: total.toString(), remainingMinor: (limit - total).toString(), baseVersion: trip.version });
}
