/// Deterministic estimate arithmetic. Server authorization and catalog freshness
/// checks remain mandatory before any itinerary is committed.
enum CostUnit { perGroup, perPerson }

const maxMinorUnits = 999999999999; // PostgreSQL numeric(12,2), safe on web.

int parseKzt(String input) {
  if (!RegExp(r'^\d+(?:\.\d{1,2})?$').hasMatch(input)) {
    throw FormatException('Use a nonnegative decimal with at most two places');
  }
  final parts = input.split('.');
  final whole = int.tryParse(parts[0]);
  if (whole == null || whole > maxMinorUnits ~/ 100) {
    throw RangeError('KZT amount exceeds numeric(12,2)');
  }
  final value =
      whole * 100 +
      (parts.length == 1 ? 0 : int.parse(parts[1].padRight(2, '0')));
  if (value > maxMinorUnits) throw RangeError('KZT amount too large');
  return value;
}

DateTime _date(DateTime d) {
  if (d.hour != 0 ||
      d.minute != 0 ||
      d.second != 0 ||
      d.millisecond != 0 ||
      d.microsecond != 0) {
    throw ArgumentError('Use calendar dates without time components');
  }
  return DateTime.utc(d.year, d.month, d.day);
}

String _key(DateTime d) => d.toIso8601String().substring(0, 10);

class TripBudget {
  final DateTime start;
  final DateTime end;
  final int travelers;
  final int limitMinor;
  final Set<String> requiredCategories;
  TripBudget({
    required DateTime start,
    required DateTime end,
    required this.travelers,
    required this.limitMinor,
    required Set<String> requiredCategories,
  }) : start = _date(start),
       end = _date(end),
       requiredCategories = Set.unmodifiable(requiredCategories) {
    if (this.end.isBefore(this.start) ||
        travelers <= 0 ||
        travelers > maxMinorUnits ||
        limitMinor <= 0 ||
        limitMinor > maxMinorUnits ||
        requiredCategories.isEmpty ||
        requiredCategories.any((x) => x.trim().isEmpty)) {
      throw ArgumentError(
        'Invalid trip dates, travelers, budget or categories',
      );
    }
  }
}

class BudgetLine {
  final String id;
  final String chargeKey;
  final String category;
  final DateTime day;
  final int? priceMinor;
  final CostUnit unit;
  final int quantity;
  final String currency;
  final String source;
  final DateTime? checkedAt;
  BudgetLine({
    required this.id,
    required this.chargeKey,
    required this.category,
    required DateTime day,
    required this.priceMinor,
    required this.unit,
    this.quantity = 1,
    this.currency = 'KZT',
    required this.source,
    required this.checkedAt,
  }) : day = _date(day) {
    if (id.trim().isEmpty ||
        chargeKey.trim().isEmpty ||
        category.trim().isEmpty ||
        quantity <= 0 ||
        quantity > maxMinorUnits ||
        (priceMinor != null &&
            (priceMinor! < 0 || priceMinor! > maxMinorUnits))) {
      throw ArgumentError('Invalid line identity, category, price or quantity');
    }
  }
}

class BudgetResult {
  final int knownTotalMinor;
  final int? totalMinor;
  final int? remainingMinor;
  final Map<String, int> knownByDay;
  final Map<String, int> knownByCategory;
  final List<String> issues;
  bool get isComplete => totalMinor != null;
  bool get isWithinBudget => isComplete && remainingMinor! >= 0;
  BudgetResult._(
    this.knownTotalMinor,
    this.totalMinor,
    this.remainingMinor,
    Map<String, int> days,
    Map<String, int> categories,
    List<String> issues,
  ) : knownByDay = Map.unmodifiable(days),
      knownByCategory = Map.unmodifiable(categories),
      issues = List.unmodifiable(issues);
}

BudgetResult calculateBudget(TripBudget trip, List<BudgetLine> lines) {
  final ids = <String>{};
  final charges = <String>{};
  final categories = <String>{};
  final days = <String, int>{};
  final totals = <String, int>{};
  final issues = <String>[];
  var known = 0;
  for (final line in lines) {
    if (!ids.add(line.id) || !charges.add(line.chargeKey)) {
      throw ArgumentError('Duplicate item or economic charge');
    }
    if (line.day.isBefore(trip.start) || line.day.isAfter(trip.end)) {
      throw ArgumentError('Line date is outside trip dates');
    }
    categories.add(line.category);
    if (line.priceMinor == null ||
        line.currency != 'KZT' ||
        line.source.trim().isEmpty ||
        line.checkedAt == null) {
      issues.add('${line.id}: unknown price, currency or provenance');
      continue;
    }
    var amount = line.priceMinor!;
    for (final factor in [
      line.quantity,
      if (line.unit == CostUnit.perPerson) trip.travelers,
    ]) {
      if (amount > maxMinorUnits ~/ factor) {
        throw RangeError(
          'Normalized line estimate exceeds supported precision',
        );
      }
      amount *= factor;
    }
    if (known > maxMinorUnits - amount) {
      throw RangeError('Trip estimate exceeds supported precision');
    }
    known += amount;
    days.update(_key(line.day), (x) => x + amount, ifAbsent: () => amount);
    totals.update(line.category, (x) => x + amount, ifAbsent: () => amount);
  }
  for (final category in trip.requiredCategories.difference(categories)) {
    issues.add('Missing required category: $category');
  }
  final complete = issues.isEmpty;
  return BudgetResult._(
    known,
    complete ? known : null,
    complete ? trip.limitMinor - known : null,
    days,
    totals,
    issues,
  );
}

/// Pure preview: no writes, mutation, authorization or AI call.
BudgetResult previewBudgetEdit(
  TripBudget trip,
  List<BudgetLine> saved, {
  Set<String> removeIds = const {},
  List<BudgetLine> additions = const [],
}) {
  final existing = saved.map((line) => line.id).toSet();
  if (!existing.containsAll(removeIds)) {
    throw ArgumentError('Cannot remove an unknown item');
  }
  return calculateBudget(trip, [
    ...saved.where((line) => !removeIds.contains(line.id)),
    ...additions,
  ]);
}
