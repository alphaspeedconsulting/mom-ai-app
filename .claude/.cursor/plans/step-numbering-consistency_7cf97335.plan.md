---
name: step-numbering-consistency
overview: Update the Step Numbering Consistency plan to include the Windows workflow (subcontractor_windows_v1), which introduces non-integer step identifiers (e.g., "9a", "9b", "9c"). Standardize step identity around workflow_step_name as source of truth, persist a canonical step_id string alongside derived numeric ordering, and ensure all read/write paths use the unified mapping utilities already extended for Windows.
todos:
  - id: inventory-step-identity-callers
    content: Inventory all read/write sites using workflow_step/workflow_step_name (add Windows-specific conditional step cases) across routes, services, and engine.
    status: pending
  - id: define-canonical-step-contract
    content: Define canonical step identity contract (workflow_step_name source of truth; step_id_str as canonical; step_order_int for ordering) and document the equality vs ordering rule for Windows 9a/9b/9c.
    status: pending
  - id: resolver-standardization
    content: Standardize on a single step identity resolver built on backend/config/workflow_step_names.py unified maps; ensure workflow_step_utils routing explicitly supports Windows where needed.
    status: pending
  - id: normalize-write-paths
    content: Normalize write paths to persist meta_data.workflow_step_name + meta_data.workflow_step (canonical string step id) for gutters/roof/windows.
    status: pending
  - id: normalize-read-paths
    content: Migrate read paths to use direct string step-id equality first, then int-normalized ordering fallback (never lose Windows conditional step distinctions).
    status: pending
  - id: backfill-pending-items-metadata
    content: Add a safe backfill/repair script to populate missing workflow_step_name and normalize workflow_step values in pending_items meta_data, including Windows conditional steps.
    status: pending
  - id: tests-and-docs
    content: Update tests to cover Windows conditional steps (9a/9b/9c) and update documentation for the canonical step identity contract.
    status: pending
isProject: false
---

# Step Numbering Consistency (Gutters + Roof + Windows)

## Goal

Standardize workflow step identity across **all** supported workflows—`subcontractor_gutters_v2`, `subcontractor_roof_v1`, and **`subcontractor_windows_v1`**—by making **step name the source of truth**, deriving a canonical **step_id** consistently, and replacing ad-hoc step resolution logic in services/routes.

Windows adds a critical constraint: step identifiers can be **non-integer** (`"9a"`, `"9b"`, `"9c"`). This plan updates the step identity contract so Windows conditional steps remain distinguishable while still supporting safe ordering comparisons.

## Current State (already implemented in code)

- **Unified mapping includes Windows** in [`backend/config/workflow_step_names.py`](backend/config/workflow_step_names.py):
- `UNIFIED_STEP_NAME_TO_NUMBER` includes `"subcontractor_windows_v1"` and returns `Union[int, str]`.
- `UNIFIED_STEP_NUMBER_TO_NAME` includes Windows with `Union[int, str]` keys.
- **Windows is the canonical workflow id**: `subcontractor_windows_v1` (found across services/tests/docs).
- **Dashboard list read-path was hardened for Windows** in [`backend/routes/poc/projects/list.py`](backend/routes/poc/projects/list.py):
- Uses `get_unified_step_number(...)` instead of `workflow_step_order.index(...)`.
- Filters pending items via **direct string equality first**, then falls back to int-normalized comparison.
- **Step number normalization utility exists** in [`backend/utils/step_number_utils.py`](backend/utils/step_number_utils.py):
- `normalize_step_number_to_int("9a") -> 9` for safe ordering comparisons.

## Updated Canonical Step Identity Contract

- **Source of truth**: `workflow_step_name` (canonical step name string).
- **Canonical step_id**: `step_id_str = str(get_unified_step_number(normalized_step_name, workflow_id))`.
- Gutters/Roof: `"1"`, `"2"`, ...
- Windows: `"9a"`, `"9b"`, `"9c"` remain distinct.
- **Ordering-only integer**: `step_order_int = normalize_step_number_to_int(step_id_str)`.
- Use for `<`, `>`, range filters, sorting.
- **Do not** use as the primary equality match for Windows conditional steps.

## Resolver Standard (single shared helper)

Introduce/standardize a shared resolver API (location: either [`backend/utils/workflow_step_utils.py`](backend/utils/workflow_step_utils.py) or a small new `backend/utils/step_identity.py`):

- **Input**: `workflow_id`, and a step representation (step_name, step_id, legacy field)
- **Output**:
- `normalized_step_name: str`
- `step_id_str: str | None` (e.g., `"5"`, `"9a"`)
- `step_order_int: int | None` (e.g., `9` for `"9a"`)

The resolver must reuse existing utilities:

- `normalize_step_name_for_workflow(...)` (note: currently routes gutters/roof explicitly; Windows should be explicitly supported or safely handled)
- `unified_normalize_step_name(...)`, `get_unified_step_number(...)`, `get_unified_step_name(...)` from [`backend/config/workflow_step_names.py`](backend/config/workflow_step_names.py)

## Write-Path Normalization (what to enforce going forward)

Anywhere we **create or update** pending items/drafts/workflow metadata:

- Persist `meta_data.workflow_step_name` (canonical step name)
- Persist `meta_data.workflow_step` as **canonical step_id string** (e.g., `"3"`, `"9a"`)
- If callers need ordering, persist a separate `meta_data.workflow_step_int` (optional) or compute on read via `normalize_step_number_to_int`.

Key likely write locations to verify/normalize for Windows support:

- [`backend/engine/registry_workflow_engine.py`](backend/engine/registry_workflow_engine.py)
- [`backend/services/pending_item_service.py`](backend/services/pending_item_service.py)
- Draft-related: [`backend/services/draft_manager.py`](backend/services/draft_manager.py), [`backend/services/draft_sync.py`](backend/services/draft_sync.py), [`backend/workflows/core/draft_advancement.py`](backend/workflows/core/draft_advancement.py)

## Read-Path Normalization (what to standardize across endpoints/services)

Standardize all read paths to use:

- **Equality matching**: `str(item_step_id) == str(current_step_id)` first
- **Fallback ordering matching** (only when needed): compare `normalize_step_number_to_int(...)`

Key read locations to align with the hardened list endpoint pattern:

- [`backend/routes/poc/projects/helpers.py`](backend/routes/poc/projects/helpers.py)
- [`backend/services/pending_item_restoration_service.py`](backend/services/pending_item_restoration_service.py)
- Any endpoint/service that filters items “up to current step” should use `safe_step_comparison(...)` (ordering), but never rely on int-normalization for equality of Windows conditional steps.

## Data Backfill / Repair (meta_data-level)

Because `pending_items` does **not** have a dedicated `workflow_step` column (it’s carried in `meta_data`), backfill focuses on:

- Adding missing `meta_data.workflow_step_name`
- Converting legacy numeric/mixed-type `meta_data.workflow_step` into canonical `step_id_str` where possible
- Ensuring Windows conditional items keep `"9a"/"9b"/"9c"` when derivable from `workflow_step_name`

Deliverable options:

- A one-off script under `scripts/` that updates pending_items meta_data in place, with summary metrics.

## Type Contract Alignment (important consistency gap)

`PendingItemRequest` in [`backend/models/workflow_models.py`](backend/models/workflow_models.py) defines:

- `workflow_step: Optional[int]`

That type does not model Windows step IDs. The plan must include updating the contract to support:

- `Optional[str]` (preferred for canonical step_id), or
- `Optional[Union[int, str]]` if callers still emit ints.

## Testing Updates

Add/extend tests to cover Windows conditional steps end-to-end:

- Unit tests for resolver behavior:
- Gutters: `"1"`/`1`/legacy names
- Roof: `"2"`/`2`
- Windows: `"9a"`, `"9b"`, `"9c"` (must remain distinct)
- Integration tests:
- Ensure pending item filtering/restoration matches current step for Windows conditional steps
- Ensure dashboard list endpoint returns step_number as string for Windows when applicable

Relevant existing tests to anchor:

- [`tests/integration/test_windows_workflow_simulation.py`](tests/integration/test_windows_workflow_simulation.py)
- [`tests/unit/test_windows_workflow_steps.py`](tests/unit/test_windows_workflow_steps.py)

## Rollout Strategy

- Make resolver available and migrate call sites incrementally (no behavioral change first).
- Normalize write paths so new data is clean.
- Update read paths to avoid regressions with existing mixed legacy data.
- Run backfill in staging, verify sampling, then roll to production.