# Submission Integration Review 24 October 2026

Prepared by Kabysheva Zukhra for DIP-24. This is a review and correction record, not supervisor approval or product completion.

## Integrated contributions

- PR #10: Zukhra's requirements, overall/use-case diagrams, evaluation and initial Dart budget core.
- PR #11 was merged into an intermediate branch. PR #12 carries Yerassyl's backend/schema corrections and pure trusted-snapshot guard into main, preserving his commits.
- PR #13 brings Sayakhat's revised proposal, topic, comparisons, AI design, UX and risks into main. Its author reports merging before review. This review is post-merge and cannot retroactively establish review-before-merge compliance. The branch/commits say DIP-50 while the PR cites DIP-43; retain history and cross-reference the actual task rather than rewriting authorship.
- [Zukhra's reply](https://github.com/yer455yl/collaborative-trip-planning/pull/10#issuecomment-6381297635) accepts her trip form/validation and client budget/edit-preview responsibilities and the documented server boundary.
- [Sayakhat's reply](https://github.com/yer455yl/collaborative-trip-planning/pull/10#issuecomment-6381384816) confirms his shell/generation/map responsibilities and the proposed DIP-30/DIP-32 split. It records additional adapter/category/charge-key proposals, not completed code.

## Post-merge findings and corrections

1. The comparison still described actual expense splitting and a conversational assistant as the project rationale. Corrected to the five-outcome MVP and deferred reference features.
2. Claims that no competitor combines all functions or lacks local data exceeded the cited evidence. Replaced with explicit verification gaps; no new competitor capabilities are asserted.
3. Proposal/topic/client-technology status omitted Yerassyl's 27-check helper. Added both executable increments while retaining the absence of Flutter UI, deployed API/RLS and product evaluation.
4. Earlier integration notes still said teammate source alignment was pending. Updated to PR #12/#13 and actual reply evidence. Supervisor acceptance and several future interface policies remain open.

## Client integration follow-up

Zukhra owns the future draft-to-budget-lines adapter as part of her client module. This ownership is recorded for implementation planning; no adapter code or schema acceptance by Yerassyl is implied. Normalized whole-party prices map to perGroup/quantity 1. AI output supplies IDs, not trusted prices; a trusted catalog adapter resolves and normalizes amounts.

Candidate categories (accommodation, meals, activities, local_transport) require a shared enum/mapping and server policy before use. Price freshness thresholds remain unapproved product policy. Proposed visit keys include a semantic slot; lodging keys must identify the trusted expanded economic charge (including room/booking distinction when needed), so UI order changes or model-chosen identifiers cannot bypass duplicate protection. The server remains authoritative.

Preserve YYYY-MM-DD day keys across list/map/budget and reject malformed civil dates before DateTime construction. Provider handling must reject exceptions and incomplete estimates; error types need an adapter contract before public API stability is promised. The current initial core's exception/issue behavior is documented, not a completed provider integration.

## Evidence and remaining gates

Observed local checks: 34 Dart budget checks and 27 trusted-snapshot helper checks pass. Database/API, live providers, Flutter/device/browser, end-to-end and SUS cases remain Not run. The 15-response survey is relevance evidence, not a usability study or an exemption from any committee requirement.

This correction branch requires another member's review before merge. Rebuild the report from its exact accepted commit, verify task evidence and committee access, and reconcile the required submission tag. Existing prob-period-1 identifies an older snapshot; this branch does not move it or submit the form.
