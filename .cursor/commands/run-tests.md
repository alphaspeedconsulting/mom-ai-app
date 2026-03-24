# Run All Tests

Execute comprehensive test suite including unit tests and workflow regression tests.

CONTEXT:
- Repo: {{repo}}
- Test framework: pytest with pytest-asyncio

ACTIONS:
1. Run all unit tests
2. Run workflow regression tests
3. Generate coverage report
4. Report any failures

COMMAND:
```bash
pytest tests/ --cov=backend --cov-report=html
```

OUTPUT:
- Test results summary
- Coverage report
- List of failures (if any)
- Recommendations for fixing failures

