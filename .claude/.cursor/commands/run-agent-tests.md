# Run Agent Tests Command

Execute comprehensive agent test suites including all 28 suggested prompts and 6 chat cards.

**Usage:** Copy this entire prompt into Cursor chat.

---

# Run Agent Tests - Complete Coverage

Execute all agent-specific test suites including unit tests, integration tests, and coverage of all suggested prompts and chat cards.

## Test Suites
- **Unit Tests**: Agent utilities and core logic (ContextCarrier, MultiStepCoordinator, retry wrapper, workflow resolution)
- **Integration Tests**: Multi-step conversation flow and supervisor coordination
- **NEW - Suggested Prompts Coverage**: All 28 verified prompts across 5 categories
- **NEW - Agent-Tool Integration**: Agent → Tool → Workflow execution chain verification
- **NEW - Chat Cards E2E**: 6 empty state cards and their triggered queries
- **NEW - Sample Prompts E2E**: Quick verification of agent routing

## Coverage Summary
- **Status & Reporting**: 9 prompts tested
- **Customer Management**: 5 prompts tested
- **Gutter Workflows**: 6 prompts tested
- **Email Management**: 4 prompts tested
- **Scheduling**: 5 prompts tested
- **Chat Cards**: 6 empty state cards tested

## Quick Start Commands

### Run All Agent Tests with Suggested Prompts Coverage
```bash
# Full comprehensive test suite
bash test_agent_all_prompts.sh

# Or run Python tests only (no E2E)
pytest tests/unit/agents/ tests/integration/agents/ tests/integration/agents/test_suggested_prompts_coverage.py tests/integration/agents/test_agent_tool_integration.py -v
```

### Run Individual Test Suites
```bash
# Unit Tests: Agent utilities and core logic
pytest tests/unit/agents/ -v

# Integration Tests: Multi-step conversation flow
pytest tests/integration/agents/test_multi_step_flow.py -v

# NEW: All suggested prompts coverage
pytest tests/integration/agents/test_suggested_prompts_coverage.py -v

# NEW: Agent-to-tool integration tests
pytest tests/integration/agents/test_agent_tool_integration.py -v

# NEW: Specific category tests
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestStatusAndReportingQueries -v
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestCustomerManagementQueries -v
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestGutterWorkflowQueries -v
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestEmailManagementQueries -v
pytest tests/integration/agents/test_suggested_prompts_coverage.py::TestSchedulingQueries -v

# Run all agent tests with coverage
pytest tests/unit/agents/ tests/integration/agents/ --cov=backend/agents --cov-report=term-missing --cov-report=html

# Run specific test file
pytest tests/unit/agents/test_workflow_resolution.py -v
pytest tests/integration/agents/test_multi_step_flow.py -v
```

## Test Structure

### Unit Tests
- `test_context_carrier.py` - Context propagation tests
- `test_multi_step_coordinator.py` - Multi-step coordination tests
- `test_retry_wrapper.py` - Retry logic tests
- `test_workflow_resolution.py` - Workflow instance resolution tests

### Integration Tests
- `test_multi_step_flow.py` - Full multi-step conversation flow tests
- `test_suggested_prompts_coverage.py` - **NEW** - All 28 suggested prompts from `suggested-prompts.json`
- `test_agent_tool_integration.py` - **NEW** - Agent → Tool → Workflow execution chain verification

### Chat Card Tests (in test_suggested_prompts_coverage.py)
- `TestChatCardSuggestions` - 6 empty state card tests
- `TestSuggestedPromptsMetadata` - Metadata validation
- `TestSuggestedPromptsAgentRouting` - Agent routing validation

## Expected Results
✅ All 27+ verified prompts should route to correct agents
✅ Chat cards should trigger appropriate queries
✅ Multi-step flows should coordinate correctly
✅ Coverage: 80%+ for agent code

## Debugging
If tests fail:
```bash
# Run with verbose output
pytest tests/integration/agents/test_suggested_prompts_coverage.py -vv

# Run with full traceback
pytest tests/integration/agents/test_suggested_prompts_coverage.py -vv --tb=long

# Check LangSmith traces for agent routing issues
# https://smith.langchain.com/o/...
```

## Testing Suggested Prompts in Live UI
After tests pass, test these queries live in the agent chat UI:
1. **Status Query**: "What's the status of project DCR-86?"
2. **Customer Creation**: "Create customer John Smith with email john@example.com"
3. **Gutter Workflow**: "Start a gutter project for customer 123"
4. **Email Draft**: "Show pending email drafts"
5. **Scheduling**: "Schedule a measurement appointment"

Access the UI at: `http://localhost:8000/dashboard/poc/agent-chat.html`
