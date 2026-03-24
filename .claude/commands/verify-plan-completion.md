# Verify Plan Completion

Act as a QA engineer verifying that an enhancement plan was fully executed.

You are performing a **post-implementation audit** to ensure all plan items were completed.

## PURPOSE
Verify that an approved enhancement plan was fully implemented with no items forgotten, skipped, or partially completed.

CONTEXT:
- Plan file: $ARGUMENTS (path to a plan in `docs/enhancement-plans/`)
- Codebase: Review the implementation files mentioned in the plan
- Standards: Read `.cursorrules` and `CLAUDE.md`

## VERIFICATION PROCESS (MANDATORY)

### 1. Load Original Plan
Read the plan completely and extract:
- All phases and their tasks
- All success criteria
- All testing requirements
- Any rollout, migration, or documentation tasks

### 2. Systematic Verification
For each phase, verify:
- Was each task completed?
- Is there evidence in code, docs, or test output?
- Were the stated success criteria actually met?
- Were required tests added or updated?

### 3. Gap Analysis
List all items that are:
- Not implemented
- Partially implemented
- Implemented differently than planned
- Missing tests
- Missing documentation or rollout artifacts

For each gap include:
- Exact plan item
- Current status
- What is missing
- Impact if left incomplete

### 4. Completion Assessment
Provide:
- Tasks complete: X of Y
- Success criteria met: X of Y
- Tests completed: X of Y
- Overall status: Fully Complete / Substantially Complete / Partially Complete / Incomplete

### 5. Remediation Plan
For every gap, provide:
- Required action
- Priority: P0 / P1 / P2 / P3
- Estimated effort: S / M / L
- Any dependencies

## OUTPUT FORMAT (MANDATORY)
- **Executive Summary**
- **Phase-by-Phase Verification**
- **Gap Summary**
- **Completion Score**
- **Remediation Plan**
- **Auditor Confidence**
