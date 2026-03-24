# Quick Reference - Run Agent Tests with Suggested Prompts Coverage

## 🚀 Quick Start

### Using Cursor Commands
```bash
# All agent tests including suggested prompts
/run-agent-tests

# Or from Claude
/run-tests
```

### Direct Commands

**Run suggested prompts tests only:**
```bash
pytest tests/integration/agents/test_suggested_prompts_coverage.py -v
```

**Run full E2E with chat validation:**
```bash
bash test_agent_all_prompts.sh
```

**Run specific test category:**
```bash
# Status queries (9 prompts)
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestStatusAndReportingQueries -v

# Customer management (5 prompts)
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestCustomerManagementQueries -v

# Gutter workflows (6 prompts)
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestGutterWorkflowQueries -v

# Email management (4 prompts)
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestEmailManagementQueries -v

# Scheduling (5 prompts)
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestSchedulingQueries -v

# Chat cards only (6 cards)
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestChatCardSuggestions -v

# Quality assurance
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestPromptsQualityAssurance -v
```

## 📊 Test Coverage Summary

| Category | Tests | Prompts | Status |
|----------|-------|---------|--------|
| Status & Reporting | 3 | 9 | ✅ All pass |
| Customer Management | 3 | 5 | ✅ All pass |
| Gutter Workflows | 3 | 6 | ✅ All pass |
| Email Management | 3 | 4 | ✅ All pass |
| Scheduling | 2 | 5 | ✅ All pass |
| Chat Cards | 6 | 6 | ✅ All pass |
| Quality Assurance | 4 | - | ✅ All pass |
| **Total** | **30** | **28+** | **✅ 30/30** |

## 📁 Files

**New test file:**
- `tests/integration/agents/test_suggested_prompts_coverage.py` (30 tests)

**New test runner:**
- `test_agent_all_prompts.sh` (full E2E validation)

**Updated documentation:**
- `.cursor/commands/run-agent-tests.md` 
- `prompts/run-tests.md`
- `docs/AGENT_TEST_COVERAGE_COMPLETE.md`

## 🎯 What Gets Tested

✅ **Metadata Validation** - JSON structure, agent values, counts
✅ **Prompt Existence** - All 28+ prompts present in JSON
✅ **Agent Routing** - Each prompt routes to correct agent
✅ **Chat Cards** - 6 empty state cards and their messages
✅ **Quality Checks** - No duplicates, descriptions, meaningful text
✅ **E2E Chat** - Actual chat interactions (with E2E runner)

## 🔍 Example Test Run

```bash
$ pytest tests/integration/agents/test_suggested_prompts_coverage.py -v

TestSuggestedPromptsMetadata::test_suggested_prompts_structure PASSED        [  3%]
TestStatusAndReportingQueries::test_status_prompts_exist PASSED             [ 23%]
TestCustomerManagementQueries::test_customer_prompts_exist PASSED           [ 33%]
TestGutterWorkflowQueries::test_gutter_prompts_exist PASSED                 [ 43%]
TestEmailManagementQueries::test_email_prompts_exist PASSED                 [ 53%]
TestSchedulingQueries::test_scheduling_prompts_exist PASSED                 [ 63%]
TestChatCardSuggestions::test_chat_card_project_management PASSED           [ 70%]
TestPromptsQualityAssurance::test_no_duplicate_prompts PASSED               [ 90%]
... 22 more tests ...

======================== 30 passed, 1 warning in 0.39s =========================
```

## 🧪 Testing Workflow

1. **Before code changes:**
   ```bash
   /run-agent-tests
   ```

2. **After changes to prompts or agents:**
   ```bash
   pytest tests/integration/agents/test_suggested_prompts_coverage.py -v
   ```

3. **Before deployment:**
   ```bash
   bash test_agent_all_prompts.sh
   ```

## 💡 Tips

- Tests validate structure/metadata (no external API calls)
- E2E runner validates actual chat interactions (needs server running)
- Use `--tb=short` for cleaner output when debugging
- Use `-k` to run specific tests by keyword

Example:
```bash
pytest tests/integration/agents/test_suggested_prompts_coverage.py -k "status" -v
```

## 📚 Documentation

See full documentation in:
- `docs/AGENT_TEST_COVERAGE_COMPLETE.md` - Complete guide
- `.cursor/commands/run-agent-tests.md` - Cursor command reference
- `prompts/run-tests.md` - Claude command reference

---

**Status**: ✅ All 30 tests passing
**Coverage**: 28+ suggested prompts + 6 chat cards
**Next**: Run tests and verify in agent chat UI
