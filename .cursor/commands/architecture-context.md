# Architecture Context (New Development Onboarding)

Act as an expert solution architect. Help developers understand the application context before starting new development work.

GOALS:
- Provide quick architectural context for new development tasks
- Identify relevant code locations and patterns
- Ensure understanding of key architectural constraints
- Guide developers to the right files and concepts

CONTEXT:
- Repo: {{repo}}
- Current file(s): {{files}}
- Architecture Reference Guide: `ARCHITECTURE_REFERENCE_GUIDE.md`
- Cursor Rules: `.cursorrules`

## TASK

Before starting implementation, help me understand the application context by:

### 1. System Overview
Read `ARCHITECTURE_REFERENCE_GUIDE.md` Section 1 (Executive Summary) and Section 2 (System Overview) and summarize:
- **System Purpose**: What does this application do?
- **Key Capabilities**: What are the main features?
- **Architectural Philosophy**: What are the core design principles?
- **Technology Stack**: What technologies are used?

### 2. Identify Relevant Code Locations
Based on the current task, point to relevant directories:
- **Workflows**: `backend/workflows/` (definitions), `backend/engine/` (execution)
- **Agents**: `backend/agents/` (LangGraph nodes), `backend/tools/` (LangChain tools)
- **Email Processing**: `email_handler/` (processing), `backend/integrations/gmail.py` (Gmail API)
- **Services**: `backend/services/` (business logic layer)
- **API Routes**: `backend/routes/` (FastAPI endpoints)
- **Database**: `backend/database.py` (models), `backend/db/` (utilities)

### 3. Key Architectural Constraints
Explain these critical constraints:
- **Agent Overlay Architecture**: Agents orchestrate tools, workflows execute business logic
  - Agents: Natural language understanding, intent classification, tool selection
  - Workflows: Business logic, data extraction, persistence, email generation
  - Tools: Bridge between agents and workflows (typed, idempotent)
- **Service Layer Pattern**: Business logic lives in services, not in agents or routes
- **Async-First**: All I/O operations must use async/await (AsyncSession, aiohttp, etc.)
- **Registry Pattern**: Workflows registered dynamically via WorkflowRegistry singleton
- **State Management**: Workflow state persisted in database (WorkflowInstance.state_data), not in memory

### 4. Quick Reference
Provide quick access to:
- **Key Files to Understand**:
  - `backend/main.py` - Application entry point, startup sequence
  - `backend/database.py` - Database models and connection management
  - `backend/agents/graph.py` - LangGraph agent system structure
  - `backend/engine/registry_workflow_engine.py` - Workflow execution engine
  - `email_handler/processor.py` - Email processing pipeline
- **Key Concepts**:
  - `WorkflowInstance` - Active workflow execution with state
  - `StepHandler` - Async function implementing step logic (StepInput → StepOutput)
  - `AgentState` - LangGraph state (TypedDict with messages, context IDs)
  - `Tool` - LangChain tool that agents call (Pydantic input, dict output)
  - `WorkflowRegistry` - Singleton registry for workflow discovery
- **Key Patterns**:
  - Registry Pattern: Dynamic workflow registration
  - Service Layer: Business logic encapsulation
  - Supervisor Pattern: Multi-agent coordination
  - State Machine: Workflow step transitions

### 5. Compliance Check
Ensure understanding of:
- **`.cursorrules` Requirements**:
  - Production-grade error handling (try/except, logging, retries)
  - Async/await for all I/O operations
  - Type hints and Pydantic models
  - No placeholders or TODOs
  - Comprehensive testing (80% coverage minimum)
- **Production-Grade Patterns**:
  - Structured logging with context
  - Idempotent operations
  - Transaction management
  - Row-level locking for concurrent access
  - Memory optimization (connection pooling, garbage collection)

## OUTPUT FORMAT

Provide a structured summary:

```markdown
## Architecture Context Summary

### System Purpose
[Brief description of what the system does]

### Key Architectural Principles
1. [Principle 1]
2. [Principle 2]
...

### Relevant Code Locations
- **For [task type]**: `path/to/relevant/code`
- **Key files**: `file1.py`, `file2.py`

### Architectural Constraints
- **Constraint 1**: [Explanation]
- **Constraint 2**: [Explanation]

### Quick Reference
- **Key Concepts**: [List]
- **Key Patterns**: [List]

### Compliance Checklist
- [ ] Understands Agent Overlay Architecture
- [ ] Understands Service Layer Pattern
- [ ] Understands async/await requirements
- [ ] Understands .cursorrules requirements
```

Then proceed to help with the actual implementation, ensuring all code follows the established architecture and patterns.

