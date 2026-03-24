# Brainstorm (Systematic Problem-Solving)

Act as a creative problem solver and systematic thinker.

## GOALS
- Break down complex problems into manageable components
- Generate multiple solution approaches
- Identify risks and trade-offs
- Provide structured recommendations

## CONTEXT
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture: Agent Overlay + Service-based + LangGraph

## PROCESS

### 1. Understand the Problem
- Restate the problem clearly
- Identify constraints and requirements
- Note what success looks like
- Consider existing architecture constraints

### 2. Generate Approaches
- List 3-5 potential solution approaches
- For each approach:
  - Core idea
  - Key technologies/patterns
  - Implementation complexity
  - Alignment with Agent Overlay Architecture
  - Alignment with Service-based architecture

### 3. Analyze Trade-offs
| Approach | Pros | Cons | Risk Level | Architecture Fit |
|----------|------|------|------------|------------------|
| Option 1 | ...  | ...  | Low/Med/High | Good/Fair/Poor |
| Option 2 | ...  | ...  | ...        | ...            |
| ...      | ...  | ...  | ...        | ...            |

### 4. Recommendation
- Best approach with clear reasoning
- Why it's better than alternatives
- What makes it safe for production
- How it aligns with Agent Overlay Architecture
- How it honors `.cursorrules` standards

### 5. Open Questions
- Unknowns that need investigation
- Assumptions that need validation
- Areas requiring further research
- Architecture concerns to address

## OUTPUT FORMAT
Structured brainstorming session with:
- Problem statement (clear, constrained)
- Solution approaches (3-5 options)
- Comparison matrix (pros/cons/risk/architecture fit)
- Recommendation with reasoning
- Next steps and open questions

## ANTI-PATTERNS
❌ Jumping to implementation before exploring options
❌ Only considering one approach
❌ Ignoring constraints or risks
❌ Not considering existing architecture
❌ Ignoring Agent Overlay Architecture constraints
❌ Proposing solutions that violate `.cursorrules`

## NEXT STEPS
After brainstorming, use:
- `/enhancement-plan` - Create detailed implementation plan based on recommendation
- `/write-plan` - Alternative planning command (if using Claude)

## WHEN TO USE
- Before `/enhancement-plan` for complex features
- When multiple approaches are possible
- When architecture decisions need exploration
- When trade-offs need explicit analysis
- **Optional** for simple, straightforward features
