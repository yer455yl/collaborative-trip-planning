# PR #10: Server Contract and Budget Review

Reviewer contribution: Aman Yerassyl (`yer455yl`). Reviewed 23 October 2026 against PR #10 head `5c18b07f964fd902138d2cf034dc3e75a5e759fd` and main `141f708`. This is a review record, **not an approval**. PR #10 remains a dependency; its changes and authorship are not duplicated as Yerassyl's work.

## Findings

1. **Group-normalized cost is correctly documented.** `planning-budget-module.md` explicitly says persisted `plan_items.estimated_cost` must use `perGroup`, quantity 1. The Dart implementation multiplies travelers only for raw `perPerson`. No double-multiplication defect was found in the reviewed core. Future adapters still need a regression check with changing party size.
2. **Integration contract is incomplete, not a demonstrated arithmetic defect.** There is no wire adapter/authorized save endpoint. Agree on canonical place UUIDs, strict calendar dates, decimal strings, raw unit vocabulary, checked-at timestamps, expected version and explicit confirmation before connecting it. Dart calendar construction can normalize an impossible incoming date before `_date` sees it; the wire parser must reject invalid civil dates.
3. **Price and completeness checks are intentionally limited.** The core checks non-null timestamp/source and caller-declared categories; it does not reject future/stale prices, establish source eligibility or prove that the caller supplied every necessary category. These must be server-owned policy checks, not a client guarantee. The new [contract proposal](../mvp-server-contract.md) makes the boundary explicit; freshness threshold/category rules need replies.
4. **No transaction/security evidence yet.** A valid preview must not bypass active membership, owner/editor rules, version compare-and-swap, independent price normalization or atomic save/confirmation. The 34 checks do not test Auth/RLS, invitation consumption, one-vote uniqueness, synchronization, scheduling or database rollback.
5. **Responsibility split is proposed.** DIP-30 and DIP-32 require owner/split acceptance. This review does not reassign teammate tasks or turn a deterministic core into a completed Flutter application. All three platforms remain planned.

## Reproduced checks

On macOS arm64, Dart SDK 3.11.3: analyzer reported no issues in `src`, `tests` and the budget example; `tests/planning_core/budget_test.dart` passed **34/34** deterministic checks. The direct SDK executable was used because the Flutter wrapper attempted to write a protected SDK cache. The analyzer completed successfully with permission for its SDK telemetry file; suppressing analytics through an environment variable alone did not prevent that write. Direct execution of the test file completed without the Flutter wrapper. These are local arithmetic checks, not product acceptance.

```sh
dart analyze src/planning_core tests/planning_core examples/budget_preview.dart
dart tests/planning_core/budget_test.dart
node --test tests/server/planning-guard.test.mjs
```

The new independent trusted-snapshot helper passed **27/27** Node v26.0.0 checks: outsider/removed/forged actor, owner/editor, stale version, double normalization, trusted raw calculation, missing/stale/future pricing, foreign/inactive places, impossible/out-of-trip dates, duplicate charges, mandatory category, currency/unit mismatch, exact budget/one-cent excess, overflow and no mutation. These tests establish helper behavior only. All **35 database/API cases** in the server plan remain **Not run**.

## Disposition

No automatic approval. Ask Zukhra and Sayakhat to review the proposed contract and ownership questions. Keep implementation tasks open until migrations, RLS, authenticated commands and integration evidence exist. Preserve PR #8/#9, all 15 logical tables, the existing `prob-period-1` tag and historical report artifacts. A rebuilt report needs a separately agreed revision and the final merged commit, which is not available while dependent PRs remain open.
