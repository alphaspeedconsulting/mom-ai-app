# Chat Messages Fixture

500 hand-labeled chat messages for intent classifier validation.

## Distribution

- 250 deterministic (should bypass LLM)
- 250 intelligent (should route to LLM)
- Balanced across all 8 agent domains

## Format (JSONL)

```json
{"message": "Add milk to the grocery list", "expected_intent": "list_crud", "expected_agent": "grocery_guru", "is_deterministic": true}
{"message": "Plan healthy dinners for the week considering Sarah's nut allergy", "expected_intent": "intelligent", "expected_agent": "grocery_guru", "is_deterministic": false}
```

## Labeling Rules

- `expected_intent`: one of `calendar_crud`, `list_crud`, `reminder_set`, `status_query`, `streak_log`, `payment_query`, `filter_search`, `intelligent`
- `is_deterministic`: true if the operation can be handled without LLM
- All PII is synthetic (no real names, addresses, or phone numbers)

## Status

- [ ] TODO: Create and label 500 messages (Phase 2 prerequisite)
