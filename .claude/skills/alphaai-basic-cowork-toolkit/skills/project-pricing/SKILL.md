---
name: project-pricing
description: "Analyze project scope artifacts (brainstorm, PRD, architecture) and recommend a pricing model and justified price ranges for a client engagement. Use after the Architecture Gate in the product agents workflow, when pricing a new project, or when asked 'how much should we charge', 'what model fits this project', 'price this engagement', or 'what should the SOW say for cost'. Do NOT use for AgentVault subscription pricing — use PRODUCT-SUITE-OFFERING.md for that. Do NOT run before architecture output exists — complexity scoring requires integration count from the arch stage."
tools: Read, WebSearch
---

# Project Pricing Skill

Analyzes the scope artifacts produced by the product agents workflow and outputs a structured pricing recommendation — the right engagement model, justified price ranges, and competitive context.

**Canonical pattern:** `ai_product_agents_mcp/prompts/patterns/pricing-engine.md`
**Upstream stage:** Architecture Gate approved (`/tmp/product-{slug}-arch.md` exists)
**Downstream stages:** Pricing Gate → pitch deck revision (pitch-generation.md reads `{{pricing.*}}` variables) → Implementation Plan
**Output:** `/tmp/product-{slug}-pricing.md`

---

## When to Trigger This Skill

- After the Architecture Gate in the product agents workflow
- User says "price this project", "how much should we charge", "what model fits", "what's the SOW value"
- Before finalizing a pitch for a new client engagement (so `pitch-generation.md` has real numbers)
- When comparing engagement model options (project vs. retainer vs. hybrid)

**Do NOT use this skill for:**
- AgentVault subscription pricing (Basic/Advanced/DCR tiers) → see `PRODUCT-SUITE-OFFERING.md`
- Quick ballpark estimates without scope artifacts → run the brainstorm stage first
- Pricing existing recurring work with no change in scope → use the existing retainer agreement

---

## Required Inputs

| File | What it contains | Required? |
|---|---|---|
| `/tmp/product-{slug}-brainstorm.md` | Problem, market size, ROI estimates, competitive context | Required |
| `/tmp/product-{slug}-prd.md` | Functional scope, workflows, integrations, requirements | Required |
| `/tmp/product-{slug}-arch.md` | Tech stack, integration count, system complexity, timeline | Required |
| Sales context in conversation | `client_name`, `relationship_stage` (cold/warm/hot), `industry` | Optional but improves accuracy |

If `/tmp/product-{slug}-arch.md` is missing, **stop and ask the user to run the Architecture stage first.** Complexity scoring requires integration count from the architecture output.

---

## Output Contract

Writes `/tmp/product-{slug}-pricing.md` with:

```markdown
## Pricing Recommendation — {client_name}

**Complexity Score:** {score}/30
**Recommended Model:** {model_name}
**Confidence:** {1–5} / 5

### Score Breakdown
| Dimension | Score | Rationale |
...

### Recommended Model: {model_name}
**Why this model:** [1–2 sentences]

### Pricing
| Component | Range | Basis |
...

### Competitive Position
[2–3 sentences on most relevant alternative]

### Fallback Pricing (if scope changes)
...
```

The `{{pricing.*}}` variables in `pitch-generation.md` are populated from this file at pitch generation time.

---

## Six Pricing Models — Selection Guide

| Model | When to Use | Typical Range |
|---|---|---|
| **Discovery / POC** | Bounded scope, client needs proof of concept, < 3 workflows | $2,500–$5,500 |
| **Fixed-Fee Project** | Fully defined scope, one-time build, 3–8 workflows | $21,500–$41,000 |
| **Monthly Retainer** | Evolving scope, growth-phase client, ongoing dev needed | $2,500–$11,000/mo |
| **Hybrid (Build + Retainer)** | Large initial build + ongoing optimization — highest-growth model | $16k–$28k build + $1,500–$2,500/mo |
| **Outcome-Based** | Verifiable ROI ≥ $40k/year, risk-averse new client | 20% of annual savings, capped at 2× project fee |
| **AgentVault Platform** | Scope fits pre-built skills — no custom build needed | $29–$299+/mo |

**Rate card basis:** $125–175/hr blended (AI-native automation, not generic IT dev)

---

## How to Invoke

### Via MCP prompt (primary method)

Use the `@ai-product-agents` mention in Cowork to invoke the pricing engine:

```
@ai-product-agents pricing-engine
Arguments:
  slug: {project-slug}          # matches the brainstorm/prd/arch filenames
  client_name: {Client Name}    # optional, derived from brainstorm if omitted
  relationship_stage: cold      # cold | warm | hot
```

Claude will:
1. Read the three scope files for the slug
2. Score complexity across 5 dimensions (A: workflow depth, B: integration count, C: data model, D: client risk, E: timeline)
3. Select the primary pricing model using the decision tree in `pricing-engine.md`
4. Apply the rate card to compute justified ranges
5. Write `/tmp/product-{slug}-pricing.md`
6. Self-evaluate (all rubric dimensions ≥ threshold before returning)

### Via direct instruction (fallback if MCP not available)

```
Read /tmp/product-{slug}-brainstorm.md, /tmp/product-{slug}-prd.md, and
/tmp/product-{slug}-arch.md. Then follow the full pricing-engine.md pattern
(at ai_product_agents_mcp/prompts/patterns/pricing-engine.md) to score
complexity, select a model, apply the rate card, and write
/tmp/product-{slug}-pricing.md.
Client: {client_name}. Relationship: {cold|warm|hot}.
```

### Optional: augment with market rate research

If the engagement is in an unfamiliar vertical or you want competitive anchoring from live data:

```
sessions_spawn(agentId="research", model="claude-sonnet-4-6",
  task="Find current market rates for AI workflow automation consulting in {industry}.
        Find: typical POC pricing, project fees, retainer rates, outcome-based deals.
        Write findings to /tmp/product-{slug}-pricing-research.md",
  label="pricing-research-{slug}")
```

Read `/tmp/product-{slug}-pricing-research.md` in the pricing engine context call before scoring.

---

## Integration with Pitch Generation

After `/tmp/product-{slug}-pricing.md` is written and the Pricing Gate is approved, re-run the pitch pattern with the pricing context:

```
@ai-product-agents pitch-generation
context: "Read /tmp/product-{slug}-brainstorm.md and /tmp/product-{slug}-pricing.md.
          Generate the consultative pitch using {{pricing.*}} variables from the pricing file.
          Client: {client_name}. Audience: {investor|client|partner}."
→ pitch_final (save to /tmp/product-{slug}-pitch.md)
```

The updated `pitch-generation.md` pattern will auto-load `{{pricing.poc_range}}`, `{{pricing.project_range}}`, and `{{pricing.retainer_range}}` from the pricing file instead of using hardcoded defaults.

---

## Anti-Patterns

❌ **Running before architecture output** — complexity score requires integration count from arch stage
❌ **Skipping the self-evaluation loop** — confidence score must be ≥ 4 on all rubric dimensions before the output is valid
❌ **Fabricating ROI numbers** — only use figures documented in brainstorm or PRD artifacts
❌ **Defaulting to fixed-fee without checking override signals** — always check for retainer/hybrid indicators in the PRD
❌ **Suggesting AgentVault platform pricing for a custom build** — these are different products
❌ **Running this skill without a slug** — the slug is required to locate the correct scope files
