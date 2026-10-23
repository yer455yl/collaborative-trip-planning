# Zukhra Planning and Budget Module

Owner: Kabysheva Zukhra Yerzhankyzy, SE-2409. Initial technical task: [DIP-42](https://dip-trip-planner.youtrack.cloud/issue/DIP-42). Status: standalone deterministic Dart core; Flutter UI, backend integration and broader schedule/catalog validation remain planned.

## Contract

[budget.dart](../src/planning_core/budget.dart) has no package dependencies and can be imported into the future Flutter project. KZT decimal input is parsed into integer minor units (two decimal places). Amounts are bounded by the existing PostgreSQL `numeric(12,2)` design and remain exactly representable on web. Too many fractional digits, negative values and overflow are rejected, not silently rounded.

`TripBudget` declares inclusive calendar dates, traveler count, limit and required cost categories. `BudgetLine` declares item ID, stable economic charge key, category, charge date, nullable price, group/person unit, integer quantity, currency and provenance. A free item must explicitly have zero cost and provenance. Null is unknown. Supported normalization is price × quantity × travelers only for per-person units. For lodging, adapters should expand one dated charge per night with explicit room quantities/capacity; the calculator does not infer nights, room counts or prices. A charge key identifies one economic charge so separate item IDs cannot double-count it.

`calculateBudget` returns known subtotal/day/category totals, an optional complete total/remainder, completeness issues and an estimated-budget verdict. An incomplete estimate cannot receive a valid-budget verdict. Caller-declared required categories are checked, but the caller remains responsible for supplying every mandatory cost: passing an incomplete list as complete input cannot establish a whole-trip guarantee.

`previewBudgetEdit` applies removals/additions to a copied list and recalculates without writing or mutating the saved input. Replacement is remove old ID + add replacement; reorder of unchanged charges does not change the total. It does not authorize, persist, resolve version conflicts, optimize a route or call AI/maps.

The schema-alignment design normalizes `plan_items.estimated_cost` to a whole-party value. Do not multiply that amount by traveler count again. The adapter must use either raw sourced units for this calculator OR already-normalized amounts with `perGroup` and quantity 1. Yerassyl's trusted save/confirm command must independently revalidate membership, source eligibility/freshness, constraints and version; client results are untrusted input.

## Run the initial core

Dart SDK tested: 3.11.3 on macOS arm64. A Dart SDK is required; no Flutter app or pub package setup is required for these files. From the repository root:

```sh
dart analyze src/planning_core tests/planning_core examples/budget_preview.dart
dart run tests/planning_core/budget_test.dart
dart run examples/budget_preview.dart
```

Observed on 23 October 2026: analyzer reported no issues; 34/34 deterministic checks passed. The synthetic example totals 7,500 KZT for three people at 2,500 each and leaves 2,500 KZT from 10,000. These are arithmetic fixtures, not surveyed or merchant prices. The test runner throws on failures and does not depend on assertions being enabled.

Checks cover exact cents, precision boundaries, invalid inputs/dates, unit multiplication, budget boundary/overrun, unknown price/provenance/currency, category completeness, duplicate IDs/economic charges, overflow, daily/category sums, immutable results and edit previews. They establish only this core's checked behavior. No Flutter, browser, backend, map, model latency, SUS or product acceptance results are claimed.

## Remaining technical tasks

1. Trip form and field validation with explicit errors, connected to authorized trip creation.
2. Editor add/remove/replace/reorder with this budget preview and server version checks.
3. Catalog eligibility, opening windows, visit/travel-time feasibility, room-night expansion and freshness policies.
4. Owner/editor invitation and voting controls using backend idempotency/access rules.
5. API serialization/adapters, UI integration tests and actual device/browser checks.

These tasks are the planned module scope, not implemented capabilities of the initial calculator.
