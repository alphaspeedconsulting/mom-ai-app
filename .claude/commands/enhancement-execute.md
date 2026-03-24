# Enhancement Execute (Plan-Driven Implementation)

Act as a senior software engineer executing an **approved enhancement plan**.

You MUST strictly follow the enhancement plan provided in context.
DO NOT introduce new features, scope, or architectural changes beyond the plan.

CONTEXT:
- Plan/files: $ARGUMENTS
- Architecture: Agent Overlay + Service-based + LangGraph
- Rules: Read `.cursorrules` and `CLAUDE.md` for project standards

## PRECONDITIONS (MANDATORY)
- An enhancement plan exists in context
- The plan has been reviewed and approved
- Any open questions in the plan have been resolved

If these conditions are not met, STOP and request clarification.

---

## EXECUTION RULES
- Follow:
  - Agent Overlay Architecture
  - Service-based architecture
  - Workflow engine constraints
  - `.cursorrules`
- Prefer reuse over new code
- No speculative refactors
- No "while we're here" improvements
- No quick fixes or hard-coded conditionals

---

## EXECUTION STEPS (REQUIRED)

### 1. Plan Validation
- Read the entire plan first
- Restate the enhancement plan in brief
- List the exact phases and steps you will implement
- Confirm no deviations from the plan
- STOP if plan is unclear or incomplete (request clarification)

### 2. Phase-by-Phase Implementation
For each phase in the plan:
1. State: "Implementing Phase X: [Name]"
2. List specific tasks from plan for this phase
3. Implement tasks incrementally and cleanly
4. Run tests after each phase
5. Report status: "Phase X complete" or "Phase X blocked: [reason]"

Maintain existing abstractions and boundaries throughout.
Ensure workflow steps remain deterministic and idempotent.

### 3. Workflow Safety Checks
- Verify all affected workflow transitions
- Validate side effects, async jobs, and state persistence
- Ensure backward compatibility with existing workflows

### 4. Test Implementation
You MUST add or update tests as specified in the plan:
- Unit tests
- Integration tests
- E2E / workflow tests (if applicable)

Tests must:
- Fail without the enhancement
- Pass only after correct implementation

### 5. Regression Scan
- Identify other areas impacted by the change
- Confirm no unintended workflow breakage
- Explicitly state what was checked

### 6. Deviations
If you encounter a blocker or need to deviate from the plan:
1. STOP implementation
2. State the blocker clearly
3. Propose solution
4. WAIT for approval before continuing

### 7. Completion Verification (MANDATORY)
Do not declare completion until all planned work is verified with evidence.

#### Phase Completion Protocol
After EACH phase, provide explicit checkoff:

```text
## Phase X Completion Checkoff
| Task | Status | Evidence |
|------|--------|----------|
| Task 1 from plan | DONE / BLOCKED / SKIPPED | file path, test output, or reason |
| Task 2 from plan | DONE / BLOCKED / SKIPPED | file path, test output, or reason |

Success Criteria:
| Criterion | Status | Evidence |
|-----------|--------|----------|
| Criterion 1 | MET / NOT MET | test or verification |
```

If ANY item is blocked or skipped, STOP and report to the user before proceeding.

#### Final Completion Audit
Before declaring the plan complete:
1. Re-read the original plan
2. Check every phase and success criterion against the implementation
3. List any gaps found during audit
4. Complete remaining items before final report

#### Completion Report
```text
## Plan Execution Complete

### Items Implemented
- [x] Item 1 - evidence
- [x] Item 2 - evidence

### Items Blocked (Requiring User Decision)
- [ ] Item 3 - reason

### Items Deferred (Out of Scope)
- [ ] Item 4 - reason

### Final Verification
- [ ] All phases complete
- [ ] All success criteria met
- [ ] Tests passing
- [ ] Plan re-read and verified
- [ ] No items forgotten
```

---

## OUTPUT FORMAT (MANDATORY)

### Enhancement Plan Summary
- Brief recap of the approved plan
- Phases to implement

### Phase-by-Phase Execution
For each phase:
```text
## Phase X: [Name]
- Tasks from plan: [list]
- Implementation: [what was done]
- Tests added: [list]
- Status: Complete / Blocked
```

### Changes Implemented
- Files modified
- New files added (if any)

### Tests Added / Updated
- What coverage was introduced
- What regressions are now prevented

### Workflow Risk Assessment
- Remaining risks (if any)
- Why the change is safe to deploy

### Completion Verification Report
- Items Implemented (with evidence)
- Items Blocked (if any)
- Final verification checklist

### Deviations (If Any)
- MUST be empty unless explicitly approved

## ANTI-PATTERNS (NEVER DO THIS)
❌ "While we're here, let me also..." (scope creep)
❌ "I think a better approach would be..." (follow the plan)
❌ "Let me refactor this unrelated code..." (stay in scope)
❌ "I'll skip tests for now..." (tests are mandatory)
❌ "The plan says X but I'll do Y instead..." (follow the plan exactly)
❌ Declaring "done" without explicit item-by-item verification
❌ Skipping the completion audit
