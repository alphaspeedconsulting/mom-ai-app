# Run Tests Command

Execute standardized test tiers to verify system stability.

**Usage:** Copy this entire prompt into Cursor chat.

---

# Run Tests

Execute the standardized testing suite tiers.

## Tiers
- **Tier 1 (Critical)**: Production workflow regressions. MUST PASS.
- **Tier 2.5 (HTTP Smoke)**: Fast HTTP route coverage. SHOULD PASS.
- **Tier 2 (Integration)**: Service interactions & Simulator. SHOULD PASS.
- **Tier 3 (Unit)**: Logic verification.

## Actions
1. Run Tier 1 (Critical) tests to ensure production stability
2. Run Tier 2.5 (HTTP Smoke) tests to verify API wiring
3. Run Tier 2 (Integration) tests to verify service interactions
4. (Optional) Run Tier 3 (Unit) tests for deep logic verification
5. Report pass/fail status by Tier

## Commands
```bash
# Tier 1: Critical Workflow Regressions (Fast, Must Pass)
./scripts/test_tier1.sh

# Tier 2: Integration & Simulator (Comprehensive)
./scripts/test_tier2.sh

# Tier 2.5: HTTP Integration Smoke (Fast)
./scripts/test_tier2_5.sh

# Tier 3: All Unit Tests (Logic)
./scripts/test_tier3.sh
```
