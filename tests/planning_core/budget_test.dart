import '../../src/planning_core/budget.dart';

final day = DateTime.utc(2026, 11, 1);
TripBudget trip({
  int limit = 1000000,
  int travelers = 2,
  Set<String> required = const {'meals'},
}) => TripBudget(
  start: day,
  end: DateTime.utc(2026, 11, 3),
  travelers: travelers,
  limitMinor: limit,
  requiredCategories: required,
);
BudgetLine line({
  String id = 'a',
  String? charge,
  int? price = 100000,
  CostUnit unit = CostUnit.perGroup,
  int quantity = 1,
  String source = 'fixture',
  String currency = 'KZT',
  DateTime? date,
  bool checked = true,
  String category = 'meals',
}) => BudgetLine(
  id: id,
  chargeKey: charge ?? id,
  category: category,
  day: date ?? day,
  priceMinor: price,
  unit: unit,
  quantity: quantity,
  source: source,
  currency: currency,
  checkedAt: checked ? day : null,
);
void equal(Object? actual, Object? expected) {
  if (actual != expected) throw StateError('Expected $expected, got $actual');
}

void rejects(void Function() action) {
  try {
    action();
  } on ArgumentError {
    return;
  } on FormatException {
    return;
  }
  throw StateError('Expected input rejection');
}

void main() {
  final tests = <String, void Function()>{
    'decimal cents exact': () => equal(parseKzt('0.10') + parseKzt('0.20'), 30),
    'one fractional digit': () => equal(parseKzt('12.3'), 1230),
    'integer KZT': () => equal(parseKzt('123'), 12300),
    'precision boundary': () => equal(parseKzt('9999999999.99'), maxMinorUnits),
    'reject rounding silently': () => rejects(() => parseKzt('1.001')),
    'reject negative': () => rejects(() => parseKzt('-1')),
    'reject malformed': () => rejects(() => parseKzt('NaN')),
    'reject overflow money': () => rejects(() => parseKzt('10000000000')),
    'reject zero budget': () => rejects(() => trip(limit: 0)),
    'reject zero travelers': () => rejects(() => trip(travelers: 0)),
    'reject reversed dates': () => rejects(
      () => TripBudget(
        start: day,
        end: day.subtract(const Duration(days: 1)),
        travelers: 1,
        limitMinor: 100,
        requiredCategories: {'meals'},
      ),
    ),
    'reject timed date': () =>
        rejects(() => line(date: day.add(const Duration(hours: 1)))),
    'per person multiplies party': () => equal(
      calculateBudget(trip(), [line(unit: CostUnit.perPerson)]).totalMinor,
      200000,
    ),
    'group not multiplied': () =>
        equal(calculateBudget(trip(), [line()]).totalMinor, 100000),
    'quantity explicit': () => equal(
      calculateBudget(trip(), [
        line(quantity: 3, unit: CostUnit.perPerson),
      ]).totalMinor,
      600000,
    ),
    'exact budget accepted': () => equal(
      calculateBudget(trip(limit: 100000), [line()]).isWithinBudget,
      true,
    ),
    'one cent excess rejected': () => equal(
      calculateBudget(trip(limit: 99999), [line()]).isWithinBudget,
      false,
    ),
    'unknown not free': () =>
        equal(calculateBudget(trip(), [line(price: null)]).totalMinor, null),
    'zero with provenance allowed': () =>
        equal(calculateBudget(trip(), [line(price: 0)]).totalMinor, 0),
    'missing source incomplete': () =>
        equal(calculateBudget(trip(), [line(source: '')]).isComplete, false),
    'missing check date incomplete': () => equal(
      calculateBudget(trip(), [line(checked: false)]).isComplete,
      false,
    ),
    'mixed currency incomplete': () => equal(
      calculateBudget(trip(), [line(currency: 'USD')]).isWithinBudget,
      false,
    ),
    'missing cost category incomplete': () => equal(
      calculateBudget(trip(required: {'meals', 'transport'}), [
        line(),
      ]).isComplete,
      false,
    ),
    'duplicate ID rejected': () =>
        rejects(() => calculateBudget(trip(), [line(), line()])),
    'duplicate economic charge rejected': () => rejects(
      () => calculateBudget(trip(), [
        line(charge: 'hotel-night'),
        line(id: 'b', charge: 'hotel-night'),
      ]),
    ),
    'outside trip rejected': () => rejects(
      () => calculateBudget(trip(), [
        line(date: day.subtract(const Duration(days: 1))),
      ]),
    ),
    'normalization overflow rejected': () => rejects(
      () => calculateBudget(trip(), [line(price: maxMinorUnits, quantity: 2)]),
    ),
    'sum overflow rejected': () => rejects(
      () => calculateBudget(trip(), [
        line(price: maxMinorUnits),
        line(id: 'b', price: 1),
      ]),
    ),
    'daily and category sums': () {
      final r = calculateBudget(trip(required: {'meals', 'transport'}), [
        line(),
        line(
          id: 'b',
          price: 50000,
          category: 'transport',
          date: day.add(const Duration(days: 1)),
        ),
      ]);
      equal(r.knownByDay['2026-11-01'], 100000);
      equal(r.knownByDay['2026-11-02'], 50000);
      equal(r.knownByCategory['transport'], 50000);
      equal(r.remainingMinor, 850000);
    },
    'replacement preview no mutation': () {
      final saved = [line()];
      final r = previewBudgetEdit(
        trip(),
        saved,
        removeIds: {'a'},
        additions: [line(price: 200000)],
      );
      equal(r.totalMinor, 200000);
      equal(saved.single.priceMinor, 100000);
    },
    'removal preview rechecks completeness': () => equal(
      previewBudgetEdit(trip(), [line()], removeIds: {'a'}).isComplete,
      false,
    ),
    'unknown removal rejected': () => rejects(
      () => previewBudgetEdit(trip(), [line()], removeIds: {'unknown'}),
    ),
    'input required categories copied': () {
      final categories = {'meals'};
      final t = trip(required: categories);
      categories.add('hotel');
      equal(calculateBudget(t, [line()]).isComplete, true);
    },
    'immutable result': () {
      final r = calculateBudget(trip(), [line()]);
      try {
        r.knownByDay.clear();
      } on UnsupportedError {
        return;
      }
      throw StateError('Mutable result');
    },
  };
  for (final entry in tests.entries) {
    entry.value();
    print('PASS ${entry.key}');
  }
  print(
    '${tests.length}/${tests.length} deterministic budget checks passed. No backend or Flutter UI tested.',
  );
}
