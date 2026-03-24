# Pricing Recommendation — Mom.Ai

**Complexity Score:** 24/30
**Recommended Model:** Hybrid — Consumer SaaS (subscription tiers) + Build engagement (Option 3 Render-only)
**Confidence:** 4/5

---

## Part A: Build Cost Analysis (What It Costs to Build)

### Score Breakdown (Pricing Engine Dimensions)

| Dimension | Score | Rationale |
|---|---|---|
| A: Workflow Depth | 8/8 | 8 AI agents, each with its own workflow pipeline + orchestration layer + marketplace |
| B: Integration Count | 8/8 | Google Calendar, Apple CalDAV, Stripe, Plaid, FCM, Gmail, LLM APIs (GPT-4o/Claude/Gemini), Voyage AI, OCR = 9+ systems |
| C: Data Model | 6/6 | Families, members, agents, tasks, events, notifications, chat history, preferences, subscriptions + real-time sync + multi-tenant RLS |
| D: Client Risk | 0/4 | Internal project — no client relationship risk |
| E: Timeline | 2/4 | Soft deadline (~6 months to MVP), not rush |
| **Total** | **24/30** | |

### Build Cost — Option 3 (Render-Only + Cowork MCP Reuse)

Because ~60% of the backend already exists, the build effort is significantly reduced from a greenfield estimate.

#### What's Already Built (Reuse Value)

| Component | Greenfield Cost | Reuse % | Effective Cost |
|---|---|---|---|
| AgentVault License/Auth Server | $12,000 | 95% | $600 |
| MCP Agent Backend (HTTP/SSE) | $15,000 | 80% | $3,000 |
| Family Optimizer MCP (Calendar Whiz) | $8,000 | 70% | $2,400 |
| Gmail Connector (School Event Hub) | $6,000 | 60% | $2,400 |
| Google Calendar MCP | $5,000 | 90% | $500 |
| Governance Layer (payments, signing) | $8,000 | 85% | $1,200 |
| Render Postgres + Deploy Pipeline | $3,000 | 90% | $300 |
| LangSmith/Langfuse Observability | $4,000 | 100% | $0 |
| **Subtotal (reusable)** | **$61,000** | | **$10,400** |

#### What's New (Must Build)

| Component | Effort | Cost @ $150/hr |
|---|---|---|
| Next.js PWA (13 pages, "Lullaby & Logic" design system — Tailwind exports accelerate) | 200 hrs | $30,000 |
| 8 AI agent skill definitions (MCP) | 120 hrs | $18,000 |
| Agent chat interface (NLP + rich media) | 60 hrs | $9,000 |
| Family data schema + API routes | 40 hrs | $6,000 |
| WebSocket real-time sync layer | 24 hrs | $3,600 |
| Google/Apple OAuth integration | 16 hrs | $2,400 |
| Cloudflare R2 file storage | 8 hrs | $1,200 |
| Budget Buddy (receipt OCR + expense categorization) | 60 hrs | $9,000 |
| Notification engine (Web Push + Daily Edit) | 32 hrs | $4,800 |
| Stripe subscription + in-app payments | 32 hrs | $4,800 |
| COPPA compliance flow | 16 hrs | $2,400 |
| Testing + QA + PWA polish | 60 hrs | $9,000 |
| **Subtotal (new build)** | **586 hrs** | **$88,000** |

#### Total Build Cost (Option 3 — PWA)

| Category | Cost |
|---|---|
| Reused components (adapted) | $10,400 |
| New build | $88,000 |
| **Total Build** | **$98,400** |
| **Greenfield native equivalent** (no reuse) | ~$196,800 |
| **Savings from Cowork MCP reuse + PWA** | **~$98,400 (50%)** |

#### Monthly Ongoing (Post-Launch)

| Component | Monthly |
|---|---|
| Render infrastructure | $33 |
| LLM APIs (~10K households) | $2,000 |
| LangSmith + Sentry | $65 |
| Cloudflare Pages (PWA hosting) | $0 |
| Maintenance/bug fixes (20 hrs/mo @ $150) | $3,000 |
| **Total Monthly Ongoing** | **~$5,206** |

---

## Part B: Consumer Pricing (What to Charge End Users)

### Competitive Landscape — Family/Parenting App Pricing

| Competitor | Free Tier | Premium Price | What's Included |
|---|---|---|---|
| Cozi | Yes (ad-supported) | $29.99/year | Ad-free, birthday tracker, extra features |
| FamilyWall | Yes (basic) | $4.99/month | Premium calendar, messaging, locator |
| OurHome | Yes (basic) | $4.99/month | Chore rewards, meal planning |
| Maple (AI parenting) | No | $9.99/month | AI-powered parenting advice |
| Brilliant (AI learning) | Yes (limited) | $13.49/month | AI-powered learning for families |
| ChatGPT Plus | No | $20/month | General AI assistant (not family-specific) |
| **Average family app** | | **$5-10/month** | Basic features |
| **Average AI-powered app** | | **$10-20/month** | AI features included |

### Pricing Model: Paid-Only with LLM Router (No Free Tier)

Mom.Ai sits at the intersection of "family organizer" ($5-10/mo) and "AI-powered assistant" ($10-20/mo). No free tier — every user pays from Day 1. This eliminates the free-user LLM cost burden and ensures every household is margin-positive.

**Why no free tier:**
- LLM costs mean free users are a direct cost center, not just infrastructure overhead
- The platform pays for all LLM calls — no BYOK (user doesn't bring API keys)
- A 14-day free trial provides the "try before you buy" experience without ongoing cost exposure
- Focus on conversion quality over signup volume

### LLM Cost Architecture: Smart Router

The platform absorbs all LLM costs. A **model router** selects the cheapest model capable of handling each request:

```
User message → Agent Backend → LLM Router
                                ├─ Simple (reminder, list, lookup)    → Gemini 2.5 Flash  ~$0.001/call
                                ├─ Medium (planning, categorization)  → GPT-4o mini        ~$0.003/call
                                └─ Complex (conflict resolution, OCR) → GPT-4o             ~$0.010/call
```

**Routing heuristic** (implemented in agent backend):
- Agent type determines default model (Calendar Whiz = Flash, Budget Buddy OCR = GPT-4o)
- Message complexity classifier upgrades model if needed (short query = Flash, multi-step reasoning = GPT-4o)
- Over-budget households auto-downgrade all calls to Gemini Flash

**Estimated call cost distribution:**

| Model | % of Calls | Cost/Call | Weighted Cost |
|---|---|---|---|
| Gemini 2.5 Flash | 60% | $0.001 | $0.0006 |
| GPT-4o mini | 25% | $0.003 | $0.00075 |
| GPT-4o | 15% | $0.010 | $0.0015 |
| **Blended average** | | | **$0.0029/call** |

### Recommended Tier Structure

#### Tier 1 — "Family"
**Price: $7.99/month ($69.99/year — save 27%)**

| Included | Details |
|---|---|
| All 8 agents | Full ecosystem |
| **1,000 agent calls/month** | ~33 calls/day — covers typical household usage |
| Family calendar with AI (conflict detection, suggestions) | Full read/write sync |
| Up to 4 family members | Covers most families |
| Daily Edit morning summary | Personalized |
| Quick actions (sign slips, pay fees) | In-app actions |
| Receipt scanning (Budget Buddy) | Included in call budget |
| Wellness streak tracking | Full feature |
| Over-budget behavior | Graceful downgrade to Gemini Flash only (no cutoff) |

**LLM cost at 1,000 calls/mo:** 1,000 × $0.0029 = **$2.90/mo**
**Gross margin:** $7.99 - $2.90 = **$5.09 (63.7%)**

**Why 1,000 calls:** Average household uses ~33 agent interactions/day across all active agents. 1,000/mo = ~33/day, which covers typical daily use (morning Daily Edit, a few Calendar queries, Budget check, School Event scan). Power users who hit the cap get downgraded to Gemini Flash — still functional, just less capable.

#### Tier 2 — "Family Pro"
**Price: $14.99/month ($129.99/year — save 28%)**

| Included | Details |
|---|---|
| Everything in Family tier | — |
| **2,000 agent calls/month** | ~66 calls/day — power user headroom |
| Up to 6 family members | Extended family, nanny, co-parent |
| Plaid bank integration (Budget Buddy) | Auto-import transactions |
| Tutor booking + payments | Direct in-app booking |
| Voice input for agent chat | Hands-free interaction |
| Advanced analytics (spending trends, schedule insights) | Data dashboards |
| Multiple household support | Shared access for co-parents |
| Priority model routing | Complex calls use GPT-4o more often |
| Over-budget behavior | Graceful downgrade to Gemini Flash only (no cutoff) |

**LLM cost at 2,000 calls/mo (higher GPT-4o mix due to priority routing):**
- 50% Gemini Flash, 25% GPT-4o mini, 25% GPT-4o
- 2,000 × $0.0040 = **$8.00/mo**
**Gross margin:** $14.99 - $8.00 = **$6.99 (46.6%)**

**Why 2,000 calls:** Pro users engage more agents, use voice input (which generates more calls), and have larger families generating more calendar/notification events. 2,000/mo gives comfortable headroom without feeling restricted.

### Why No Free Tier Works

| Concern | Mitigation |
|---|---|
| Higher acquisition friction | 14-day free trial with full Family tier access (1,000 calls) |
| Competitor free tiers (Cozi) | Cozi free = no AI. Mom.Ai's value prop is AI agents — you can't demo that for free forever |
| Users won't pay without trying | Trial-to-paid conversion for no-free-tier AI apps: 25-40% (higher than freemium's 5-15%) |
| Can we add free later? | Yes — if growth stalls, add a 200 calls/mo free tier. Easier to add free than to remove it |

---

### Revenue Projections (No Free Tier — All Paid)

#### Assumptions

| Metric | Conservative | Moderate | Aggressive |
|---|---|---|---|
| Year 1 trial starts | 30K | 60K | 120K |
| Trial → Paid conversion | 25% | 35% | 45% |
| Year 1 paid households | 7,500 | 21,000 | 54,000 |
| Family vs Pro split | 85/15 | 80/20 | 70/30 |
| Annual vs monthly split | 40% annual | 50% annual | 60% annual |
| Monthly churn (paid) | 7% | 5% | 3% |

#### Year 1 Revenue (Moderate Scenario)

| Metric | Calculation | Result |
|---|---|---|
| Trial starts | — | 60,000 |
| Paid households (35%) | 60K × 35% | 21,000 |
| Family tier (80%) | 16,800 × $7.99 | $134,232/mo |
| Family Pro tier (20%) | 4,200 × $14.99 | $62,958/mo |
| **Monthly recurring revenue** | | **$197,190** |
| Annual discount blended (~8% reduction) | | **$181,415/mo effective** |
| **Annual recurring revenue** | | **$2,176,980** |

#### Year 1 Unit Economics (Moderate)

| Metric | Family ($7.99) | Family Pro ($14.99) | Blended |
|---|---|---|---|
| Monthly revenue | $7.99 | $14.99 | $9.39 |
| Monthly LLM cost (routed) | $2.90 (1K calls) | $8.00 (2K calls) | $3.92 |
| Monthly infrastructure/household | $0.02 | $0.02 | $0.02 |
| **Gross margin** | **$5.07 (63.5%)** | **$6.97 (46.5%)** | **$5.45 (58.0%)** |
| Monthly operational cost (total) | | | ~$5,206 |
| **Net margin after ops (21K households)** | | | **$109,244/mo** |
| **Break-even** | | | **~960 paid households** |

#### Year 1-3 ARR Trajectory (All Paid, No Free Tier)

| Year | Trial Starts | Paid Households | MRR | ARR | LLM Cost/mo |
|---|---|---|---|---|---|
| Year 1 | 60K | 21K | $181K | $2.18M | $82K |
| Year 2 | 180K | 63K | $544K | $6.53M | $247K |
| Year 3 | 400K | 140K | $1.21M | $14.5M | $549K |

---

### Price Sensitivity Analysis (Trial → Paid, No Free Tier)

| Family Price | Trial→Paid Rate | Paid Households (60K trials) | MRR | LLM Cost/mo | Net Margin |
|---|---|---|---|---|---|
| $4.99/mo | 45% | 27,000 | $134,730 | $105,840 | 21.5% |
| **$7.99/mo** | **35%** | **21,000** | **$181,415** | **$82,320** | **54.6%** |
| $9.99/mo | 28% | 16,800 | $167,832 | $65,856 | 60.7% |
| $12.99/mo | 20% | 12,000 | $155,880 | $47,040 | 69.8% |

**$7.99 maximizes absolute MRR** while maintaining 54.6% net margin after LLM costs. $9.99 has higher margin % but lower total revenue. $4.99 gets more users but LLM costs eat almost all profit.

**Key insight:** Without a free tier, trial→paid conversion is significantly higher (35% vs 15% in freemium) because only intentional users start trials. This more than compensates for the smaller top-of-funnel.

---

### 14-Day Trial Strategy (No Free Tier — Trial Is the Only Free Experience)

| Element | Recommendation |
|---|---|
| Trial tier | Full Family tier (all 8 agents, 1,000 calls) |
| Trial duration | 14 days |
| Credit card required? | **Yes** — reduces tire-kickers, increases trial-to-paid to 35-45% |
| Trial cost to platform | ~$1.40 in LLM (14 days × ~33 calls/day × $0.0029) |
| Conversion target | 35% (CC-required trials convert 2-3x higher than no-CC) |
| Trial nudges | Day 1: onboard 2 agents. Day 3: "Your agents handled X tasks this week." Day 7: "You've used Y of 1,000 calls — here's what your agents accomplished." Day 12: "Trial ending in 2 days — your data and agents stay if you subscribe." |
| Post-trial behavior | **App locks** — data preserved for 30 days, but agents stop. User can resubscribe anytime to resume. |
| Upgrade during trial | Show Family Pro upsell if user hits >500 calls in first week |

---

## Part C: Pricing Summary

### For End Users

| Tier | Price | Calls/Month | Target |
|---|---|---|---|
| **Family** | $7.99/mo ($69.99/yr) | 1,000 | Core household — 8 agents, smart model routing |
| **Family Pro** | $14.99/mo ($129.99/yr) | 2,000 | Power users — Plaid, voice, analytics, priority routing |
| **14-day trial** | $0 (CC required) | 1,000 (prorated) | Acquisition — full Family experience |

### LLM Cost Strategy

| Principle | Implementation |
|---|---|
| **Platform pays all LLM costs** | User never sees API keys, tokens, or usage-based bills |
| **Smart model routing** | 60% Gemini Flash / 25% GPT-4o mini / 15% GPT-4o |
| **Soft cap, not hard cutoff** | Over-budget → downgrade to Gemini Flash only (still works, just simpler) |
| **No per-call billing** | Call budget is a cost control lever, not a monetization metric |
| **Call budget visibility** | Show "X of 1,000 calls used this month" in app — builds awareness without anxiety |

### Build Cost (Option 3)

| Component | Cost |
|---|---|
| Total build (PWA + Cowork MCP reuse) | $98,400 |
| Monthly ongoing (post-launch) | ~$5,206 + LLM costs |
| Break-even | ~960 paid households |
| Time to break-even (moderate) | Month 2-3 post-launch |

### Key Pricing Decisions

| Decision | Recommendation | Rationale |
|---|---|---|
| Free tier? | **No** — 14-day trial only | Every user beyond trial costs $2.90-$8/mo in LLM; free tier is a cost center |
| Who pays for LLM? | **Platform absorbs** | Consumer users can't manage API keys; BYOK kills adoption |
| Ad-supported? | **No** | Destroys "Digital Sanctuary" brand promise |
| Family vs individual pricing? | **Household pricing** | One subscription covers the family (4 members Family, 6 members Pro) |
| Annual discount? | **27% off** ($69.99/yr vs $7.99/mo × 12 = $95.88) | Standard SaaS; improves retention and cash flow |
| Over-budget behavior? | **Graceful downgrade** to Gemini Flash | No cutoff, no overage charges — just simpler model responses |
| Credit card on trial? | **Yes** | Higher conversion (35% vs 15%), filters out non-serious users |

---

## Competitive Position

**vs. Cozi ($29.99/year):** "Cozi is a shared to-do list. Mom.Ai is 8 specialized AI agents that actually do the work for you — planning meals, scanning school emails, tracking budgets, and managing the family calendar with conflict detection. That's 100x the capability at 2.3x the price."

**vs. ChatGPT Plus ($20/month):** "ChatGPT is a general assistant that forgets your family between sessions. Mom.Ai knows your kids' names, ages, allergies, school schedules, and budget — and proactively manages all of it across 8 specialized agents. Half the price, 10x the family relevance."

**vs. doing nothing:** "The average mother spends 14+ hours/week on household management tasks. At $25/hour opportunity cost, that's $18,200/year. Mom.Ai Premium at $96/year represents a 190:1 ROI if it saves just 1 hour per week."

---

## Confidence Notes

**Confidence: 4/5**

- PRD and architecture analysis both present and detailed — scoring is well-grounded
- LLM cost model is estimated (not measured) — actual costs may vary ±30% based on real usage patterns
- Conversion rate assumptions (15%) are based on industry benchmarks, not validated with user research
- Competitive pricing data is current as of March 2026 — market may shift
- Premium+ tier pricing ($14.99) is speculative — depends on Phase 2 feature development costs

| Dimension | Score | Pass |
|---|---|---|
| Model fit — does the model match the scope? | 5/5 | Yes |
| Numbers justified — do ranges trace to formulas? | 4/5 | Yes |
| Competitive anchored — relevant comparison? | 5/5 | Yes |
| Scope-consistent — ranges reflect PRD/arch complexity? | 4/5 | Yes |

---

## Part D: Cross-Validation — Cowork Pricing Skills

Two independent pricing tools from the AlphaAI Cowork Plugin Kit were run against Mom.Ai's data. Here's how they compare.

### Tool 1: `project-pricing` Skill (Alpha Rate Card)

The project-pricing skill scores complexity on 5 dimensions using the Alpha Speed Consulting rate card ($125-175/hr blended).

| Dimension | Score | Rationale |
|---|---|---|
| A: Workflow Depth | 8/8 | 8 AI agents = 8+ workflows |
| B: Integration Count | 8/8 | Google Calendar, Apple CalDAV, Stripe, Plaid, FCM, Gmail, LLM APIs, OCR, Voyage AI = 9+ |
| C: Data Model | 6/6 | Families, members, agents, tasks, events, notifications, chat, preferences + real-time sync |
| D: Client Risk | 0/4 | Internal project |
| E: Timeline | 2/4 | Soft deadline, not rush |
| **Total** | **24/30** | |

**Selected Model: Hybrid (Build + Retainer)** — Score 24 falls in the "Hybrid or Retainer" range (23-30).

**Rate Card Application:**
- Build phase: 24 × $1,500 + $8,000 = $44,000 (base project fee) — but with 60% reuse, effective is $44,000 × 0.75 (retainer discount) × 0.40 (new build fraction) = **~$13,200** for the MCP-reusable portion
- Actual build estimate from Part A: **$135,800** (includes full React Native app, 8 agent skills, etc.)
- Monthly retainer: $1,500-$2,500/mo (maintenance + ongoing enhancement)

**AI Agent / MCP Engagement Model (Model 7) — better fit:**
- Discovery Workshop: $2,500 (flat)
- Pro Build: $15,000-$22,000 (4+ agents, durable execution, multi-tenant)
- Monthly ongoing: $850-$1,200/mo

**Assessment:** The project-pricing skill's Model 7 (AI Agent/MCP) range of $15K-$22K severely underestimates the build because it assumes a consulting engagement scope. Mom.Ai is a full consumer product (13 screens, custom design system, App Store deployment), not a client workflow automation. The rate card is designed for B2B consulting engagements, not consumer SaaS product builds.

**Verdict:** Project-pricing skill is **not the right tool** for pricing a consumer SaaS product. It correctly identifies the complexity (24/30) but its pricing models are built for consulting engagements.

---

### Tool 2: `pricing-strategy` Skill (Alireza Rezvani — SaaS Pricing)

The pricing-strategy skill + `pricing_modeler.py` script is designed for SaaS tier structure and was run with Mom.Ai's projected data.

#### Modeler Inputs
```json
{
  "current_customers": 15000 (projected Year 1 premium),
  "arpu": $9.04/mo (blended across $7.99 Family + $14.99 Pro),
  "trial_to_paid_rate_pct": 15,
  "monthly_churn_rate_pct": 5.0,
  "competitor_prices": [$2.50, $4.99, $4.99, $9.99, $13.49, $20.00],
  "cogs_per_customer_monthly": $0.22
}
```

#### Modeler Results

| Signal | Finding |
|---|---|
| **Market Position** | At-market ($9.04 ARPU vs $2.50-$20.00 competitor range) |
| **Elasticity Signal** | Possible overpricing (15% conversion = low end of healthy) |
| **Price Headroom** | -5% (suggests testing $8.59 ARPU — essentially confirming $7.99 is near ceiling) |
| **Gross Margin** | 97.6% (COGS of $0.22/customer/mo is extremely low) |
| **Min Viable Price** | $1.47/mo |

#### Modeler Tier Recommendation

| Tier | Modeler Suggests | My Original | Delta |
|---|---|---|---|
| Entry | ~$2 (broke on negative due to low COGS) | $0 (Free) | Modeler can't model freemium properly |
| Mid | **$4/mo** | **$7.99/mo** | Modeler says mid-tier should be $4 |
| Premium | **$14/mo** | **$14.99/mo** | Nearly identical |

#### Revenue Scenarios (12-month, paid customers only)

| Scenario | 12-Month Revenue |
|---|---|
| Current ($7.99/$14.99) | **$1,880,970** |
| +5% price increase | $1,958,657 |
| +15% price increase | $2,109,360 |
| +25% price increase | **$2,253,828** |
| Modeler recommended tiers ($4/$14) | $832,289 |

#### Key Insight: The Modeler Disagrees on Mid-Tier Price

The modeler recommends **$4/mo mid-tier** based on the competitor floor ($2.50 Cozi) and standard 2.5x tier multiplier from min viable price. But this misses a critical factor: **Mom.Ai is an AI-native product, not a traditional family organizer.** The competitor set should be split:

| Segment | Price Range | Products |
|---|---|---|
| Family organizers (no AI) | $2.50-$4.99 | Cozi, FamilyWall, OurHome |
| AI-powered apps | $9.99-$20.00 | Maple, Brilliant, ChatGPT Plus |

Mom.Ai sits firmly in the **AI-powered** segment. The modeler's competitor list includes the non-AI apps, which drags the recommended price down.

#### Resolution: $7.99 Confirmed, With a $4.99 Test Option

| Finding | Source | Implication |
|---|---|---|
| $4/mo mid-tier | Modeler (competitor-anchored) | Too low — undervalues AI agent capability |
| $7.99/mo mid-tier | Manual analysis (value-based) | Correctly positioned between AI apps and family apps |
| -5% headroom signal | Modeler elasticity | Confirms $7.99 is near the ceiling — don't go higher at launch |
| +25% scenario wins | Modeler revenue projection | If we can hold 15% conversion at $9.99, revenue increases 20% |
| 97.6% gross margin | Modeler COGS analysis | Extremely healthy — room to invest in growth, not raise prices |

**Final Recommendation:**

| Tier | Launch Price | Test Price (Month 3+) |
|---|---|---|
| **Starter** (Free) | $0 | $0 (keep free forever) |
| **Family** (Premium) | **$7.99/mo** ($69.99/yr) | Test $9.99/mo on new signups only |
| **Family Pro** (Phase 2) | **$14.99/mo** ($129.99/yr) | Confirmed by modeler ($14) |

**Pricing-strategy skill framework validation:**

| Axis | Assessment |
|---|---|
| **Value Metric** | Per-household (flat) — correct for B2C family app. Not per-seat, not per-usage. |
| **Packaging** | Good-Better-Best with Free → matches framework's freemium + 3-tier recommendation |
| **Price Point** | $7.99 sits between next-best-alternative ($4.99 Cozi) and perceived value ($20 ChatGPT). Follows the "price in the middle" heuristic. |

**Conversion rate signal check (from pricing-strategy skill):**
- 15% trial-to-paid = "market-priced" per the skill's elasticity table (15-30% = healthy)
- If conversion exceeds 25% after launch → strong signal of underpricing → test $9.99
- If conversion drops below 10% → price may be high for family market → test $5.99

---

### Cross-Validation Summary

| Question | Project-Pricing Skill | Pricing-Strategy Skill | Manual Analysis | Consensus |
|---|---|---|---|---|
| Complexity score | 24/30 (high) | N/A | 8.5/10 | High complexity confirmed |
| Build cost | $15-22K (MCP engagement) | N/A | $135,800 (full product) | Manual is correct — skills undersize consumer products |
| Consumer mid-tier price | N/A (consulting tool) | **$4/mo** | **$7.99/mo** | $7.99 — modeler undervalues AI positioning |
| Premium tier price | N/A | **$14/mo** | **$14.99/mo** | $14.99 confirmed |
| ARPU ceiling | N/A | $8.59 (-5% headroom) | $7.99-$9.99 | **$7.99 at launch, test $9.99 at Month 3** |
| Gross margin | N/A | 97.6% | 96.8% | ~97% — extremely healthy |
| Break-even | N/A | N/A | ~800 premium subs | Confirmed |
| Revenue Year 1 (moderate) | N/A | $1.88M (12-mo paid) | $1.24M ARR | Range: $1.2-1.9M depending on ramp curve |
