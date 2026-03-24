# Gap Prevention Check (Pre-Implementation)

Act as a production engineer preventing known failure patterns.

You are performing a **pre-implementation gap analysis** to prevent known issues BEFORE code is written.

## PURPOSE
Proactively identify risks based on historical production gaps. Run this BEFORE implementing any significant change.

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Reference: `.cursorrules` Section 19 and `docs/WORKFLOW_GAPS_ANALYSIS_AND_PREVENTION.md`

## REQUIRED CHECKS

### 1. Type Safety Analysis (Gaps 1, 9, 23, 31, 37, 38)
Search for any step comparisons in the code:
- Direct `>`, `<`, `==` operators between step values
- Missing type normalization
- Risk of string/integer comparison (Windows uses "9a", "9b")

**Search patterns:**
```
current_step >, current_step <, current_step ==
workflow_step >, workflow_step <, workflow_step ==
step_number >, step_number <, step_number ==
```

### 2. Transaction Safety Analysis (Gaps 7, 13, 32)
Search for exception handlers:
- `except DatabaseError` without `session.rollback()`
- `except SQLAlchemyError` without `session.rollback()`
- Fallback queries before rollback

**Search patterns:**
```
except.*DatabaseError
except.*SQLAlchemyError
except.*IntegrityError
```

### 3. LLM Extraction Analysis (Gaps 11, 16, 17, 22)
Search for extraction result access:
- `extracted_data.field_name` (dot notation on dict) - WRONG
- `extracted_data.get("field")` or `model_instance.field` - CORRECT

**Search patterns:**
```
extracted_data\.(?!get)
extraction_result\.extracted_data\.(?!get)
```

### 4. State Management Analysis (Gaps 5, 15, 40)
Check for user-editable fields:
- Only reading from state_data (may be stale)
- Missing database query for current value
- Inconsistent data flow (update saves to different location than read)

### 5. Integration Artifacts Analysis (Gaps 2, 4, 6, 24)
Check for missing deployment artifacts:
- Database migration scripts needed?
- Template seeding scripts needed?
- Frontend draftSteps updates needed?
- Startup script updates needed?

### 6. Test Mock Pattern Analysis (Gap 11)
If tests exist or will be added:
- Are LLM extraction mocks using dict (not MagicMock with dot notation)?
- Are both string and int step numbers tested?

## OUTPUT FORMAT (MANDATORY)

### Gap Risk Assessment

| Category | Risk | Evidence |
|----------|------|----------|
| Type Safety | LOW/MEDIUM/HIGH | [Specific code locations or "N/A"] |
| Transaction Safety | LOW/MEDIUM/HIGH | [Specific code locations or "N/A"] |
| LLM Extraction | LOW/MEDIUM/HIGH | [Specific code locations or "N/A"] |
| State Management | LOW/MEDIUM/HIGH | [Specific code locations or "N/A"] |
| Integration Artifacts | LOW/MEDIUM/HIGH | [What's missing or "N/A"] |
| Test Mock Patterns | LOW/MEDIUM/HIGH | [Issues found or "N/A"] |

### Required Mitigations
For each HIGH or MEDIUM risk:
- **Location**: Exact file and line
- **Issue**: What could go wrong
- **Fix**: Required change
- **Test**: How to verify the fix

### Pre-Implementation Checklist

Answer these questions before proceeding:

1. **Does this change involve step comparisons?**
   - [ ] N/A - no step comparisons
   - [ ] Yes - will use `safe_step_comparison()` or `normalize_step_number_to_int()`

2. **Does this change involve database operations in error handlers?**
   - [ ] N/A - no error handlers with DB operations
   - [ ] Yes - will call `session.rollback()` before continuing

3. **Does this change involve LLM extraction?**
   - [ ] N/A - no LLM extraction
   - [ ] Yes - will use `model_instance` or `extracted_data.get()`

4. **Does this change affect user-editable fields?**
   - [ ] N/A - no user-editable fields
   - [ ] Yes - will use database-first state management

5. **Does this change add/modify database schema?**
   - [ ] N/A - no schema changes
   - [ ] Yes - will create migration scripts for `START_APP_RENDER.sh`

6. **Does this change add/modify email templates?**
   - [ ] N/A - no template changes
   - [ ] Yes - will add seeding scripts to startup

7. **Does this change add/modify draft-creating steps?**
   - [ ] N/A - no draft step changes
   - [ ] Yes - will update frontend `draftSteps` array

### Confidence Assessment

- **Safe to Proceed**: YES / NO / CONDITIONAL
- **Conditions** (if applicable): [What must be done first]
- **Recommended Actions**: [Ordered list of what to do]

## WHEN TO USE THIS COMMAND

Use `/gap-prevention-check` BEFORE:
- Implementing any workflow step changes
- Modifying database queries in error handlers
- Adding or modifying LLM extraction logic
- Changing state management patterns
- Any change that touches critical paths

## SCOPE GUIDANCE

**Full check required for:**
- Workflow step changes
- Database transaction modifications
- LLM extraction changes
- State management changes

**Abbreviated check (skip sections 3-4) for:**
- Frontend-only changes
- Documentation updates
- Test-only changes
- Configuration changes
