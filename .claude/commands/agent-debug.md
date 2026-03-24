# Agent Debug (LangGraph debugging pattern)

Act as a LangGraph debugging expert.

## GOALS
- Systematically diagnose agent issues
- Identify root cause (prompt, tool, state)
- Propose targeted fix

## CONTEXT
- Repo: {{repo}}
- Current file(s): {{files}}
- System: LangGraph + OpenAI agents
- Observability: LangSmith traces

## DEBUGGING PROTOCOL

### 1. Identify Symptoms
- What is the observed behavior?
- What was expected?
- Is it consistent or intermittent?
- Which agent is involved? (router, workflow, scheduling)

### 2. Check LangSmith Traces
- Examine message history
- Look for tool calling errors
- Check response formats
- Verify state updates
- Note: LangSmith URL format: https://smith.langchain.com/

### 3. Isolate Root Cause

#### Prompt-Related Issues
**Symptoms:**
- Agent not calling tools
- Wrong intent classification
- Misunderstanding user requests

**Investigation:**
- Check prompt in `backend/agents/prompt_templates.py`
- Review tool usage examples in prompt
- Verify WHEN conditions are clear

#### Tool-Related Issues
**Symptoms:**
- Tool called but returns errors
- Wrong tool arguments
- Tool not found

**Investigation:**
- Check tool definition in `backend/tools/workflow_tools.py`
- Verify Pydantic Field descriptions
- Test tool independently
- Check tool return format (must be dict with success/error)

#### State-Related Issues
**Symptoms:**
- Agent "forgets" previous conversation
- State not persisting between turns
- Workflow instance ID missing

**Investigation:**
- Verify `ENABLE_CHECKPOINTING=true` in .env
- Check `thread_id` in agent invocation
- Review state updates in agent nodes
- Check PostgresSaver configuration

### 4. Common Issues & Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Agent not calling tools | Prompt unclear | Add explicit WHEN conditions |
| Wrong tool arguments | Pydantic model vague | Add Field descriptions with examples |
| State not persisting | Checkpointing disabled | Set ENABLE_CHECKPOINTING=true |
| Tool returns error | Business logic issue | Check service/workflow code |
| Agent loops infinitely | No end condition | Add max iterations or should_continue logic |

### 5. Propose Fix
- Minimal change to address root cause
- Prefer prompt improvements over code changes
- If code change needed, follow .cursorrules
- Include test to prevent regression

## OUTPUT FORMAT

### Diagnosis
- Symptoms: [observed behavior]
- Root cause: [prompt/tool/state/other]
- Evidence: [LangSmith trace, logs, code inspection]

### Proposed Fix
- File to change: [path]
- Change description: [what to modify]
- Why this fixes it: [reasoning]

### Test Verification
- How to reproduce issue
- How to verify fix works
- Regression test to add

## ANTI-PATTERNS
❌ Guessing without checking traces
❌ Changing multiple things at once
❌ Adding workarounds instead of fixing root cause
❌ Skipping test verification
