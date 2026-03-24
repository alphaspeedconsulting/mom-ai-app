# Run Tests

Execute standardized test tiers to verify system stability in this repo.

CONTEXT:
- Test framework: `pytest` with `pytest-asyncio`
- Coverage defaults are configured in `pyproject.toml`
- Source package: `src/ai_product_agents_mcp`

## TEST TIERS
- **Tier 1 (Critical Pipelines):** Core MCP and agent pipeline checks. MUST PASS before merge.
- **Tier 2 (Integration):** Cross-component integration tests. SHOULD PASS for substantial changes.
- **Tier 3 (Unit):** Fast logic and model verification. SHOULD PASS for touched areas.
- **Tier 4 (Evals/Extended):** Evaluators and extended quality checks when relevant.
- **Full Coverage Run:** Whole-suite confidence and coverage enforcement.

## ACTIONS
1. Run the highest-signal tier that matches the change first
2. Run broader tiers as the change surface grows
3. Report pass/fail status by tier
4. Call out skipped tiers and why

## COMMANDS
```bash
# Tier 1: Critical pipelines and MCP surface
pytest tests/integration/test_mcp_server_integration.py tests/integration/test_prd_pipeline.py tests/integration/test_architect_pipeline.py tests/integration/test_security_pipeline.py -v --no-cov

# Tier 2: Full integration suite
pytest tests/integration/ -v --no-cov

# Tier 3: Unit suite
pytest tests/ --ignore=tests/integration --ignore=tests/test_evals -v --no-cov

# Tier 4: Evals and extended checks
pytest tests/test_evals/ -v --no-cov

# Full coverage run (uses repo coverage defaults and threshold)
pytest
```

## OUTPUT
- Tier-by-tier test results summary
- Failures with the most likely impacted area
- Coverage result when full suite is run
- Recommended next command if failures occur
