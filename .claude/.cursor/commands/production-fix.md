# Production-Grade Fix (Comprehensive)

Act as a senior production engineer.

You are applying a **production-grade fix**, not a patch.

## NON-NEGOTIABLE RULES
- Follow `.cursorrules`
- NO quick fixes or one-off conditionals
- Changes must be reusable, testable, and durable

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture: Agent Overlay + Service-based

## REQUIRED STEPS

### 1. Root Cause Analysis
- Identify the true root cause (not just the symptom)
- Reference relevant workflow steps and agents

### 2. Fix Implementation
- Apply the fix cleanly
- Ensure it aligns with existing abstractions
- Avoid introducing special cases

### 3. Horizontal Scan
You MUST:
- Search for similar patterns across the codebase
- Identify other workflow steps or services that could fail the same way
- Propose fixes or safeguards where appropriate

### 4. Log & Runtime Validation
- Review Render MCP logs and runtime behavior
- Explain how logs confirm the fix works
- Identify any missing observability

### 5. Test Coverage
- Add or update tests that would have caught this issue
- Explicitly state what would fail if the bug regressed

### 6. Critical Gap Prevention Checklist
Reference: `.cursorrules` Section 19 and `docs/WORKFLOW_GAPS_ANALYSIS_AND_PREVENTION.md`

Before considering the fix complete, verify:

#### Transaction Safety (Gaps 7, 13, 32)
- [ ] All exception handlers call `await session.rollback()` before continuing
- [ ] Fallback queries happen AFTER rollback
- [ ] No early returns leave uncommitted transactions

#### Type Safety (Gaps 1, 9, 23)
- [ ] All step comparisons use `safe_step_comparison()` or `normalize_step_number_to_int()`
- [ ] Conditional steps (9a, 9b, 9c) handled correctly
- [ ] No direct `>`, `<`, `==` comparisons between potentially mixed types

#### Database Schema (Gaps 2, 6, 24)
- [ ] SQLAlchemy models match database schema
- [ ] Migration scripts added to `START_APP_RENDER.sh` if needed
- [ ] Migrations tested for idempotency

#### LLM Extraction Safety (Gaps 11, 16, 17)
- [ ] Uses `model_instance` (Pydantic model) or `extracted_data.get()` (dict access)
- [ ] NEVER uses `extracted_data.field_name` (dot notation on dict)
- [ ] Regex fallback exists for critical extractions

#### Frontend Integration (Gap 4)
- [ ] Draft steps added to `draftSteps` array in `project-detail.html` if applicable
- [ ] Pending items display correctly for affected workflow
- [ ] Conditional step UI works (if applicable)

**If any checklist item is applicable but not addressed, the fix is incomplete.**

## OUTPUT FORMAT (MANDATORY)
- Root Cause
- Fix Summary
- Related Risk Areas
- Gap Prevention Checklist Results
- Tests Added / Updated
- Confidence Assessment
