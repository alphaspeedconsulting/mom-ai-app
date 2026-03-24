# Windows Workflow Contractor Access Indicator Enhancement Plan

## Goal

Add a visual element to the Windows workflow screen that displays whether the contractor needs:

- **Inside access** (customer approval needed)
- **Exterior access** (no inside access required)
- **Not yet determined** (default state)

The indicator should be prominently displayed in the **left panel** below the workflow milestones, taking advantage of the available space there.

---

## 1. Enhancement Breakdown

### What is Being Added

- **Visual indicator component** showing contractor access requirement status
- **Data field** to store access requirement (`contractor_access_required` or `inside_access_required`)
- **API updates** to return access requirement in work item responses
- **Frontend display** integrated into Windows workflow detail view **left panel** (below workflow milestones)

### Affected Components

**Backend:**

- `backend/routes/poc/projects/detail.py` - API endpoint returning work item data
- `backend/database.py` - `ProjectWorkItem` model (uses `meta_data` JSON column)
- `backend/services/work_item_service.py` - Work item service methods (if update functionality needed)

**Frontend:**

- `frontend/dashboard/poc/modules/work-delivery.html` - Windows workflow detail view
- `frontend/dashboard/poc/shared/project-modal.js` - Project/work item editing (already has `insideAccessRequired` handling)
- Potentially a new component file for the access indicator

### Why This Approach

**Architectural Justification:**

1. **Reuse existing infrastructure**: `ProjectWorkItem.meta_data` JSON column already exists and is used for extensible data storage
2. **Consistency with existing pattern**: Code already handles `inside_access_required` in `Project.meta_data` (project-modal.js line 784), but for Windows workflow, it should be work-item specific
3. **Minimal database changes**: No schema migration required - uses existing `meta_data` JSON column
4. **Frontend-first enhancement**: Primarily a UI/UX improvement with minimal backend logic changes

**Why Work Item Level (Not Project Level):**

- Windows workflow is work-item specific (one project can have multiple work items)
- Access requirement may differ per work item (e.g., different windows requiring different access)
- Aligns with existing work item metadata pattern

---

## 2. Reuse vs New Code Analysis

### What Can Be Reused As-Is

✅ **Database Schema:**

- `ProjectWorkItem.meta_data` JSON column - no changes needed
- Existing JSON structure supports nested fields

✅ **Backend API Pattern:**

- `/projects/{project_id}` endpoint already returns `meta_data` in work item responses
- No new endpoint needed - extend existing response

✅ **Frontend Editing:**

- `project-modal.js` already has `insideAccessRequired` handling (lines 783-797)
- Radio button UI for selecting access requirement already exists (lines 321-330)
- Save logic already persists to `project.meta_data.inside_access_required` (lines 1010, 1036)

### What Needs Extension

🔧 **Backend API Response:**

- Extract `contractor_access_required` from `work_item.meta_data` in detail endpoint
- Add to work item response dictionary (line ~371 in `detail.py`)
- Ensure backward compatibility (handle missing field gracefully)

🔧 **Frontend Display Component:**

- Create visual indicator (badge/icon/text) for access requirement
- Three states: "Inside Access", "Exterior Access", "Not Determined"
- Color coding: Orange/Red for inside access (requires approval), Green for exterior, Gray for undetermined

🔧 **Frontend Integration:**

- Add indicator to Windows workflow detail view **left panel**
- Position below workflow milestones section (takes advantage of available space)
- Ensure responsive design matches existing UI patterns

### What Must Be Net-New

🆕 **Visual Indicator Component:**

- New reusable component for displaying access requirement status
- Should follow design system patterns (use existing badge/indicator styles)
- Accessible (ARIA labels, color contrast)

**Justification for New Component:**

- Reusable across different views (workflow detail, project list, etc.)
- Encapsulates display logic and styling
- Easier to maintain and test independently

---

## 3. Workflow Impact Analysis

### Workflow Steps Affected

**None** - This is a **display-only enhancement**. No workflow steps are modified.

### State Transitions or Side Effects

**None** - The access requirement is metadata that:

- Does not affect workflow progression
- Does not trigger automated actions
- Is informational only (used for contractor communication)

### Regression Risk Level

**LOW** - Minimal risk because:

- ✅ No workflow logic changes
- ✅ No database schema changes
- ✅ Backward compatible (handles missing field)
- ✅ Additive only (new display, doesn't modify existing behavior)

### Mitigation Strategies

1. **Backward Compatibility:**

- API returns `null` or `"not_determined"` if `meta_data.contractor_access_required` is missing
- Frontend handles `null`/`undefined` gracefully (shows "Not Determined")

2. **Feature Flag (Optional):**

- If needed, add feature flag to enable/disable indicator display
- Allows gradual rollout or quick disable if issues arise

3. **Testing:**

- Unit tests for API response with/without access requirement
- Frontend tests for indicator display in all three states
- Integration tests for Windows workflow detail view

---

## 4. Implementation Phases

### Phase 1: Backend API Update (1 day)

**Tasks:**

1. Review current `ProjectWorkItem.meta_data` usage in `backend/routes/poc/projects/detail.py`
2. Extract `contractor_access_required` from `work_item.meta_data` (or `work_item.meta_data.inside_access_required`)
3. Add field to work item response dictionary (around line 371)
4. Handle backward compatibility (default to `null` if missing)
5. Update API response documentation/comments

**Dependencies:**

- None (can start immediately)

**Success Criteria:**

- ✅ API returns `contractor_access_required` field in work item responses
- ✅ Field is `null` for existing work items without the field (backward compatible)
- ✅ Field is correctly extracted from `meta_data` when present
- ✅ Verified by: API response inspection, unit tests

**Risk Level:** Low

---

### Phase 2: Frontend Display Component (1 day)

**Tasks:**

1. Create reusable access indicator component

- Location: `frontend/dashboard/poc/shared/access-indicator.js` or inline in work-delivery.html
- Three states: inside, exterior, not_determined
- Color coding and icons/badges

2. Follow design system patterns (use existing CSS variables, badge styles)
3. Add accessibility attributes (ARIA labels, semantic HTML)
4. Create unit tests for component rendering

**Dependencies:**

- Phase 1 (needs API field, but can mock for component development)

**Success Criteria:**

- ✅ Component renders correctly in all three states
- ✅ Matches design system styling (colors, typography, spacing)
- ✅ Accessible (screen reader friendly, color contrast compliant)
- ✅ Responsive (works on mobile/tablet)
- ✅ Verified by: Visual inspection, accessibility audit, unit tests

**Risk Level:** Low

---

### Phase 3: Frontend Integration (1 day)

**Tasks:**

1. Locate Windows workflow detail view rendering code

- Search for left panel with workflow milestones
- Identify insertion point below milestones list

2. Integrate access indicator component

- Pass `contractor_access_required` from API response
- Position in left panel below workflow milestones section

3. Ensure proper data binding

- Handle `null`/`undefined` values (show "Not Determined")
- Update when work item data changes

4. Test integration with real Windows workflow data

**Dependencies:**

- Phase 1 (API field available)
- Phase 2 (component ready)

**Success Criteria:**

- ✅ Indicator displays in Windows workflow detail view left panel
- ✅ Positioned correctly below workflow milestones section
- ✅ Updates when work item data refreshes
- ✅ Handles missing/null values gracefully
- ✅ Verified by: Manual testing, integration tests, visual regression tests

**Risk Level:** Medium (integration complexity)

---

### Phase 4: Edit Functionality (Optional - 0.5 days)

**Tasks:**

1. Verify if "Edit Details" button already supports editing access requirement

- Check `project-modal.js` edit functionality
- Confirm `insideAccessRequired` is saved to correct location

2. If not already supported:

- Add access requirement field to work item edit form
- Ensure save persists to `work_item.meta_data.contractor_access_required`

3. Test edit flow end-to-end

**Dependencies:**

- Phase 1-3 (display working)

**Success Criteria:**

- ✅ Users can edit access requirement from workflow detail view
- ✅ Changes persist to database correctly
- ✅ UI updates immediately after save
- ✅ Verified by: Manual testing, integration tests

**Risk Level:** Low (likely already supported via project-modal.js)

---

### Phase 5: Testing & Validation (1 day)

**Tasks:**

1. **Unit Tests:**

- Backend: API response includes `contractor_access_required` field
- Frontend: Component renders all three states correctly
- Frontend: Component handles null/undefined gracefully

2. **Integration Tests:**

- Windows workflow detail view displays indicator
- Indicator updates when work item data changes
- Edit functionality (if implemented) saves correctly

3. **Manual Testing:**

- Test with existing Windows work items (backward compatibility)
- Test with new Windows work items (with access requirement set)
- Test all three states (inside, exterior, not determined)
- Test responsive design (mobile/tablet)
- Test accessibility (keyboard navigation, screen reader)

**Dependencies:**

- All previous phases

**Success Criteria:**

- ✅ All unit tests pass
- ✅ All integration tests pass
- ✅ Manual testing confirms feature works as expected
- ✅ No regressions in existing functionality
- ✅ Verified by: Test suite execution, QA sign-off

**Risk Level:** Low

---

## 5. Testing Strategy

### Unit Tests Required

**Backend (`tests/unit/test_project_detail_api.py`):**

- Test API response includes `contractor_access_required` when present in `meta_data`
- Test API response returns `null` when field missing (backward compatibility)
- Test API response handles invalid `meta_data` gracefully

**Frontend (`tests/unit/test_access_indicator.js` or similar):**

- Test component renders "Inside Access" state correctly
- Test component renders "Exterior Access" state correctly
- Test component renders "Not Determined" state correctly
- Test component handles `null`/`undefined` input gracefully
- Test component accessibility attributes

### Integration Tests Required

**Workflow Detail View (`tests/integration/test_windows_workflow_detail.py` or similar):**

- Test Windows workflow detail view displays access indicator
- Test indicator shows correct state based on work item `meta_data`
- Test indicator updates when work item data refreshes
- Test indicator position in right panel (subcontractor section)

### E2E or Workflow Tests Required

**Optional (if time permits):**

- E2E test: Create Windows work item → Set access requirement → Verify indicator displays
- E2E test: Edit access requirement → Verify indicator updates

### Existing Tests to Update

**None** - This is additive only, no existing tests need modification.

### Test Data Requirements

- Windows work items with `meta_data.contractor_access_required = "inside"`
- Windows work items with `meta_data.contractor_access_required = "exterior"`
- Windows work items with `meta_data.contractor_access_required = null` (or missing field)
- Windows work items without `meta_data` (backward compatibility test)

---

## 6. Open Questions / Risks

### Assumptions Needing Validation

1. **Data Storage Location:**

- **Assumption**: Access requirement should be stored in `ProjectWorkItem.meta_data.contractor_access_required`
- **Validation Needed**: Confirm this is correct (vs `Project.meta_data.inside_access_required`)
- **Action**: Review existing code in `project-modal.js` to understand current storage pattern

2. **Field Name:**

- **Assumption**: Use `contractor_access_required` (work-item specific)
- **Alternative**: Reuse `inside_access_required` from project level
- **Action**: Decide on field name based on whether it's project-wide or work-item specific

3. **Visual Design:**

- **Assumption**: Badge/indicator style similar to existing status badges
- **Validation Needed**: Confirm design matches existing UI patterns
- **Action**: Review design system CSS for badge/indicator styles

### Unknowns Requiring Investigation

1. **Windows Workflow Detail View Location:**

- **Unknown**: Exact file/location where left panel with milestones is rendered
- **Investigation**: Search for "workflow milestones", "Not Started", "Mark Estimated" in frontend code
- **Risk**: May need to create new view if it doesn't exist

2. **Edit Functionality:**

- **Unknown**: Whether "Edit Details" button already supports editing access requirement
- **Investigation**: Review `project-modal.js` edit functionality
- **Risk**: May need to add edit support if not already present

### Architectural Risks

1. **Data Consistency:**

- **Risk**: If access requirement is stored in both `Project.meta_data` and `ProjectWorkItem.meta_data`, could get out of sync
- **Mitigation**: Choose one source of truth (work item level recommended)

2. **Backward Compatibility:**

- **Risk**: Existing Windows work items won't have access requirement field
- **Mitigation**: API returns `null`, frontend shows "Not Determined" (already planned)

### Deployment Considerations

**Migrations:**

- ✅ **No database migration needed** - uses existing `meta_data` JSON column

**Rollback Plan:**

- If issues arise, can disable indicator display via feature flag (if implemented) or CSS `display: none`
- No data changes required for rollback (additive feature only)

**Deployment Steps:**

1. Deploy backend API changes (Phase 1)
2. Deploy frontend component and integration (Phases 2-3)
3. Verify in staging environment
4. Deploy to production
5. Monitor for errors/issues

---

## 7. Success Metrics

- ✅ Visual indicator displays correctly in Windows workflow detail view
- ✅ All three states (inside, exterior, not determined) render correctly
- ✅ Indicator updates when work item data changes
- ✅ No regressions in existing functionality
- ✅ Backward compatible (handles missing field gracefully)
- ✅ Accessible (screen reader friendly, keyboard navigable)

---

## 8. Timeline Estimate

**Total Estimated Time: 3.5-4 days**

- Phase 1 (Backend API): 1 day
- Phase 2 (Display Component): 1 day
- Phase 3 (Integration): 1 day
- Phase 4 (Edit Functionality - Optional): 0.5 days
- Phase 5 (Testing): 1 day

**Buffer: 0.5-1 day** for unexpected issues or design refinements

---

## 9. Dependencies

**External Dependencies:**

- None

**Internal Dependencies:**

- Access to staging/production database for testing
- Design system CSS variables/styles (already exists)

---

## 10. Notes

- This enhancement is **display-only** - no workflow logic changes
- Uses existing infrastructure (`meta_data` JSON column)
- Low risk, high value (improves user experience)
- Can be implemented incrementally (phases can be deployed independently)
- Backward compatible by design