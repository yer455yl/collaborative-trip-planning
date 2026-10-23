import '../src/planning_core/budget.dart';

void main() {
  final day = DateTime.utc(2026, 11, 1);
  final trip = TripBudget(
    start: day,
    end: day,
    travelers: 3,
    limitMinor: parseKzt('10000'),
    requiredCategories: {'meals'},
  );
  final result = calculateBudget(trip, [
    BudgetLine(
      id: 'meal-1',
      chargeKey: 'fixture-meal-1',
      category: 'meals',
      day: day,
      priceMinor: parseKzt('2500'),
      unit: CostUnit.perPerson,
      source: 'Synthetic arithmetic example, not a real merchant price',
      checkedAt: day,
    ),
  ]);
  print('Estimated total: ${result.totalMinor! / 100} KZT');
  print('Remaining: ${result.remainingMinor! / 100} KZT');
  print('Within estimated budget: ${result.isWithinBudget}');
}
