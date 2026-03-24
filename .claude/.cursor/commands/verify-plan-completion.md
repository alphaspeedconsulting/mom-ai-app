# Verify Plan Completion

Act as a QA engineer verifying that an enhancement plan was fully executed.

You are performing a **post-implementation audit** to ensure all plan items were completed.

## PURPOSE
Verify that an approved enhancement plan was fully implemented with no items forgotten, skipped, or partially completed.

CONTEXT:
- Repo: {{repo}}
- Plan file: {{files}} (path to plan in docs/enhancement-plans/)
- Codebase: Review implementation files mentioned in plan

## VERIFICATION PROCESS (MANDATORY)

### 1. Load Original Plan
Read the enhancement plan completely. Extract:
- All phases and their tasks
- All success criteria
- All testing requirements
- All deployment artifacts

### 2. Systematic Verification

For EACH item in the plan:

#### Task Verification Table
| Phase | Task Description | Status | Evidence |
|-------|-----------------|--------|----------|
| 1 | [Task from plan] | ✅/❌/⚠️ | File:line or reason if incomplete |
| 2 | [Task from plan] | ✅/❌/⚠️ | File:line or reason if incomplete |

**Status Legend:**
- ✅ DONE - Fully implemented with evidence
- ❌ NOT DONE - Not implemented or missing
- ⚠️ PARTIAL - Partially implemented or differs from plan

#### Success Criteria Verification Table
| Phase | Criterion Description | Status | Evidence |
|-------|---------------------|--------|----------|
| 1 | [Criterion from plan] | ✅/❌ | Test or verification method |

#### Testing Verification Table
| Test Type | Required by Plan | Implemented | Passing | Evidence |
|-----------|-----------------|-------------|---------|----------|
| Unit tests | Yes/No | Yes/No | Yes/No | File:line or test run output |
| Integration | Yes/No | Yes/No | Yes/No | File:line or test run output |
| E2E/Workflow | Yes/No | Yes/No | Yes/No | File:line or test run output |

#### Deployment Artifacts Verification Table
| Artifact | Required by Plan | Created | Location |
|----------|-----------------|---------|----------|
| Database migration | Yes/No | Yes/No | Path or "N/A" |
| Template seeding | Yes/No | Yes/No | Path or "N/A" |
| Frontend updates | Yes/No | Yes/No | Path or "N/A" |
| Startup script updates | Yes/No | Yes/No | Path or "N/A" |

### 3. Gap Analysis

List ALL items that are:
- **Not implemented** - Items in plan that have no implementation
- **Partially implemented** - Items implemented differently than planned
- **Missing tests** - Tests specified in plan but not implemented
- **Missing artifacts** - Deployment artifacts specified but not created

For each gap:
- Exact item from plan
- Current status
- What's missing
- Impact if left incomplete

### 4. Completion Assessment

Provide overall completion score:

**Completion Metrics:**
- Tasks: X of Y complete (Z%)
- Success Criteria: X of Y met (Z%)
- Tests: X of Y implemented (Z%)
- Artifacts: X of Y created (Z%)

**Overall Status:**
- ✅ **Fully Complete**: All items verified with evidence (100%)
- 🟡 **Substantially Complete**: 90-99% complete, minor gaps only
- 🟠 **Partially Complete**: 70-89% complete, significant gaps exist
- ❌ **Incomplete**: <70% complete, major items missing

### 5. Remediation Plan

For any gaps identified:

**Required Actions:**
1. [Specific item to implement] - [Estimated effort: S/M/L]
2. [Specific item to implement] - [Estimated effort: S/M/L]

**Priority:**
- **P0 (Blocking)**: Items that prevent deployment or cause bugs
- **P1 (High)**: Items that affect functionality or testing
- **P2 (Medium)**: Items that affect quality or maintainability
- **P3 (Low)**: Nice-to-have items or documentation

**Dependencies:**
- List any dependencies between remaining items

## OUTPUT FORMAT (MANDATORY)

### Executive Summary
**Plan:** [Plan file name and date]
**Implementation Status:** Fully Complete / Substantially Complete / Partially Complete / Incomplete
**Completion Score:** [X]%
**Blocking Issues:** [Count] - [Brief summary or "None"]

---

### Detailed Verification Results

#### Phase 1: [Phase Name]
**Tasks:**
- ✅ Task 1 - Evidence: [file:line]
- ❌ Task 2 - **MISSING**: [What's missing]

**Success Criteria:**
- ✅ Criterion 1 - Verified by: [test or check]

**Tests:**
- ✅ Unit tests - [file:line]
- ❌ Integration tests - **MISSING**

---

### Gap Summary

**Total Gaps:** X

#### Not Implemented (Count: X)
1. [Item from plan] - Phase [N] - Impact: [description]

#### Partially Implemented (Count: X)
1. [Item from plan] - Phase [N] - What's missing: [description]

#### Missing Tests (Count: X)
1. [Test type] for [functionality] - Required by Phase [N]

#### Missing Artifacts (Count: X)
1. [Artifact type] - Required by Phase [N] - Impact: [description]

---

### Remediation Plan

**P0 (Blocking) - Must Complete Before Deployment:**
1. [Item] - Effort: [S/M/L] - [Why blocking]

**P1 (High) - Should Complete This Sprint:**
1. [Item] - Effort: [S/M/L] - [Impact]

**P2 (Medium) - Can Defer:**
1. [Item] - Effort: [S/M/L] - [Tradeoff]

**Dependencies:**
- [Item B] depends on [Item A]

---

### Verification Checklist

Final audit results:
- [ ] All tasks from plan verified
- [ ] All success criteria checked
- [ ] All tests verified (implemented and passing)
- [ ] All deployment artifacts verified
- [ ] Gaps documented with impact
- [ ] Remediation plan provided

**Auditor Confidence:** HIGH / MEDIUM / LOW
**Confidence Notes:** [Why this confidence level]

---

## WHEN TO USE THIS COMMAND

Use `/verify-plan-completion` AFTER:
- `/enhancement-execute` claims completion
- Any multi-phase implementation claiming "done"
- Before deploying significant changes
- When unsure if plan was fully implemented

## SCOPE GUIDANCE

**Full verification required for:**
- Multi-phase enhancement plans
- Plans with integration/deployment artifacts
- Plans affecting critical workflows

**Abbreviated verification acceptable for:**
- Single-phase simple changes
- Documentation-only changes
- Proof-of-concept implementations

## ANTI-PATTERNS

❌ Trusting "completion" claims without verification
❌ Skipping test verification
❌ Not checking deployment artifacts
❌ Accepting "mostly done" without gap analysis
❌ Not providing remediation plan for gaps
