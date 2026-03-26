# Shared Household Rollout Checklist (Mom.alpha + Dad.AI)

## Purpose

Use this checklist when shipping Mom.alpha frontend changes that depend on the shared-household backend contract.

## Release Order

1. Deploy backend shared-household endpoints first.
2. Verify backend capability probes in staging.
3. Deploy Mom.alpha frontend with household lifecycle UI.
4. Run cross-parent smoke tests in staging before production rollout.

## Backend/Frontend Contract Compatibility

- [ ] `GET /api/household/{household_id}` returns stable `Household` shape.
- [ ] `POST /api/household` accepts `HouseholdCreateRequest` and returns `Household`.
- [ ] `POST /api/household/join` accepts `JoinHouseholdRequest` and returns `Household`.
- [ ] `POST /api/household/{household_id}/invite` returns `HouseholdInviteResponse`.
- [ ] `GET /api/household/{household_id}/members` returns `HouseholdMembersResponse`.
- [ ] `GET /api/household/{household_id}/usage` returns `HouseholdUsageDashboard`.
- [ ] Auth payload includes `household_id`; optional fields (`household_role`, `parent_brand`) do not break parsing when absent.

## Cross-Brand Consistency Checks

- [ ] Parent A (Mom.alpha) creates household.
- [ ] Parent A sends invite token.
- [ ] Parent B (Dad.AI or Mom.alpha) joins using invite token.
- [ ] Parent A and Parent B both see the same household members.
- [ ] Admin-only actions are blocked for non-admin members.
- [ ] Budget usage values match across both parent views.

## Regression Test Gate

- [ ] Run `mom-alpha/tests/e2e/shared-household.spec.ts`.
- [ ] Run `mom-alpha/tests/e2e/pwa.spec.ts`.
- [ ] Run `mom-alpha/tests/e2e/navigation.spec.ts`.
- [ ] Verify settings page renders correctly for:
  - no household
  - admin parent in household
  - member parent in household

## Rollback Plan

If production errors occur:

1. Hide household lifecycle actions in frontend via capability checks.
2. Keep read-only household rendering active.
3. Revert frontend deployment to the previous stable release.
4. Keep backend endpoints backward-compatible while frontend rollback propagates.

## Post-Deploy Monitoring

- [ ] Track household create/join errors (4xx/5xx rates).
- [ ] Track invite issuance failures.
- [ ] Track settings page client errors by role (`admin` vs `member`).
- [ ] Verify no increase in auth/session hydration failures.
