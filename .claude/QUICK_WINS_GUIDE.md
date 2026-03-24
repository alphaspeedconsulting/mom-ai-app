# Claude Skills - Quick Wins Guide

**Date:** January 6, 2025  
**Purpose:** Immediate use cases for downloaded Claude Skills (no extraction needed)  
**Prerequisite:** Skills downloaded to `.claude/skills/` (run `.claude/download_skills.sh`)

---

## How to Use Skills in Claude Code

After downloading skills to `.claude/skills/` and configuring `.claude/settings.local.json`, Claude Code will automatically load relevant skills when you start conversations.

**Skills are loaded progressively:**
1. Claude scans skill metadata (~100 tokens per skill)
2. Loads full instructions when skill matches task (<5k tokens)
3. Executes skill-specific code as needed

---

## Quick Win #1: Webapp Testing with Playwright

**Skill:** `webapp-testing` (from Anthropic official skills)

**Purpose:** Test the Roofing Chatbot's web interfaces automatically

### Use Case 1: Test Agent Chat Interface

**In Claude Code:**
```
Test the agent chat interface at http://localhost:8000/agent-chat

Verify:
1. Page loads correctly
2. Chat input is functional
3. Customer creation works: "Create customer John Smith, john@example.com, 555-1234, 123 Main St"
4. Workflow status check works: "What's the status of project 123?"
5. Error handling works: "Start workflow" (missing details)
```

**Expected Output:**
```
✅ Navigated to http://localhost:8000/agent-chat
✅ Page loaded successfully
✅ Chat input found and functional
✅ Test 1: Customer creation
   - Sent message: "Create customer John Smith..."
   - Response: "✅ Customer created with ID 456"
✅ Test 2: Workflow status
   - Sent message: "What's the status..."
   - Response: "📊 Project 123 status: ..."
✅ Test 3: Error handling
   - Sent message: "Start workflow"
   - Response: "I need more information..."

Summary: 5/5 tests passed
```

### Use Case 2: Test Dashboard UI

**In Claude Code:**
```
Test the workflow dashboard at http://localhost:8000/dashboard

Verify:
1. Projects list loads
2. Workflow status badges display correctly
3. Pending items are visible
4. Filter by workflow type works
```

**Benefit:** Automated UI testing without manual clicking

---

## Quick Win #2: Frontend Design Improvements

**Skill:** `frontend-design` (from Anthropic official skills)

**Purpose:** Improve UI aesthetics, avoid "AI slop" generic designs

### Use Case 1: Redesign Workflow Dashboard

**In Claude Code:**
```
Review backend/templates/dashboard.html and suggest design improvements.

Goals:
- Modern, bold aesthetics (not generic)
- Clear visual hierarchy
- Better color scheme
- Improved typography
- Mobile-responsive

Current stack: HTML, Tailwind CSS
```

**Expected Output:**
```markdown
## Dashboard Design Improvements

### Current Issues
- Generic color scheme (gray scale)
- Weak visual hierarchy
- Small typography
- No responsive breakpoints

### Recommended Changes

#### Color Scheme (Bold & Professional)
- Primary: #2563eb (Blue-600) - Actions, CTAs
- Success: #059669 (Green-600) - Completed workflows
- Warning: #d97706 (Amber-600) - Pending items
- Danger: #dc2626 (Red-600) - Errors
- Background: #f9fafb (Gray-50)

#### Typography
- Headings: text-2xl font-bold (was text-lg)
- Body: text-base (was text-sm)
- Monospace for IDs: font-mono

#### Visual Hierarchy
- Card elevation: shadow-lg (was shadow)
- Workflow badges: Larger, pill-shaped
- Pending items: Red dot indicator

#### Mobile Responsiveness
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Stack workflow details on mobile

[Specific code changes follow...]
```

**Benefit:** Professional design guidance, avoid generic AI aesthetics

---

## Quick Win #3: Security Audit with secure-env

**Skill:** `secure-env` (from community skills - if available)

**Purpose:** Audit environment variables for security issues

### Use Case: Audit .env File

**In Claude Code:**
```
Audit .env file for security issues:
1. Hardcoded secrets
2. Weak passwords
3. Exposed API keys
4. Missing encryption
5. Insecure defaults

File: .env
```

**Expected Output:**
```markdown
## Security Audit: .env

### 🔴 CRITICAL Issues
1. **DATABASE_PASSWORD=simple123**
   - Issue: Weak password
   - Fix: Use 16+ character password with symbols
   - Recommended: `openssl rand -base64 32`

2. **OPENAI_API_KEY=sk-...** (visible in file)
   - Issue: API key in plain text
   - Fix: Use secret manager (e.g., AWS Secrets Manager, Render env vars)

### 🟡 MEDIUM Issues
1. **SECRET_KEY not set**
   - Issue: Using default secret key
   - Fix: Generate strong secret: `python -c 'import secrets; print(secrets.token_hex(32))'`

2. **DEBUG=true** in .env
   - Issue: Debug mode should not be in version control
   - Fix: Set via environment variable only

### ✅ GOOD Practices
- DATABASE_URL uses environment variable placeholder
- LANGCHAIN_API_KEY properly configured

### Recommendations
1. Move all secrets to Render environment variables
2. Add .env to .gitignore (already done ✅)
3. Use `.env.example` with placeholder values
4. Rotate API keys quarterly
5. Enable 2FA on all API accounts
```

**Benefit:** Identify security vulnerabilities before production

---

## Quick Win #4: Document Processing (Invoice Extraction)

**Skills:** `pdf`, `xlsx`, `docx` (from Anthropic official skills)

**Purpose:** Extract structured data from invoices and estimates

### Use Case: Extract Invoice Data

**In Claude Code:**
```
Extract invoice data from attached PDF:
- Vendor name
- Invoice number
- Invoice date
- Line items (description, quantity, unit price, total)
- Subtotal
- Tax
- Total amount

File: invoice_sample.pdf
```

**Expected Output:**
```json
{
  "vendor_name": "Alpha Speed Gutters",
  "invoice_number": "INV-2025-001",
  "invoice_date": "2025-01-05",
  "line_items": [
    {
      "description": "6\" Seamless Gutter Installation",
      "quantity": 150,
      "unit": "linear feet",
      "unit_price": 8.50,
      "total": 1275.00
    },
    {
      "description": "Downspout Installation",
      "quantity": 4,
      "unit": "each",
      "unit_price": 45.00,
      "total": 180.00
    }
  ],
  "subtotal": 1455.00,
  "tax": 116.40,
  "tax_rate": 0.08,
  "total": 1571.40
}
```

**Benefit:** Automated invoice processing, no manual data entry

---

## Quick Win #5: MCP Server Creation

**Skill:** `mcp-builder` (from Anthropic official skills)

**Purpose:** Build Model Context Protocol servers for external integrations

### Use Case: Create DCR Database MCP Server

**In Claude Code:**
```
Create an MCP server to expose DCR database operations to Claude.

Capabilities needed:
1. Get customer by ID
2. Get project details
3. List workflows
4. Get workflow status
5. Get pending items

Database: PostgreSQL
Connection: DATABASE_URL from environment
Framework: Python with asyncpg
```

**Expected Output:**
```python
# mcp_servers/dcr_database/server.py
"""
DCR Database MCP Server

Provides read-only access to DCR database for Claude.
"""
import asyncio
import asyncpg
from mcp.server import MCPServer
from mcp.types import Tool, Resource

server = MCPServer("dcr-database")

# Database connection
async def get_db():
    return await asyncpg.connect(os.getenv("DATABASE_URL"))

# Tools
@server.tool()
async def get_customer(customer_id: int) -> dict:
    """Get customer by ID"""
    conn = await get_db()
    try:
        row = await conn.fetchrow(
            "SELECT * FROM customers WHERE id = $1",
            customer_id
        )
        return dict(row) if row else None
    finally:
        await conn.close()

@server.tool()
async def get_workflow_status(project_id: int) -> dict:
    """Get workflow status for project"""
    # ... implementation

# Resources
@server.resource("dcr://workflows")
async def list_workflows() -> list[dict]:
    """List all available workflows"""
    # ... implementation

if __name__ == "__main__":
    server.run()
```

**Benefit:** Extend Claude Code with direct database access

---

## Quick Win #6: obra/superpowers Commands

**Skills:** `superpowers`, `superpowers-skills` (from obra)

**Purpose:** Development workflow patterns (brainstorm, plan, execute)

### Use Case 1: Brainstorm Feature

**In Claude Code (will auto-load superpowers):**
```
I need to add invoice reconciliation to the Roofing Chatbot.
Help me brainstorm approaches.
```

**Expected Output (using superpowers brainstorm pattern):**
```markdown
## Problem Statement
Add invoice reconciliation: Match subcontractor invoices against work estimates.

## Approach 1: Manual Reconciliation UI
**Pros:** Simple, no AI needed
**Cons:** Time-consuming, manual errors
**Risk:** Low

## Approach 2: Automated LLM Extraction + Matching
**Pros:** Fast, accurate, scales
**Cons:** LLM costs, requires training data
**Risk:** Medium

## Approach 3: Hybrid (AI + Human Review)
**Pros:** Best of both, catches errors
**Cons:** More complex
**Risk:** Low-Medium

## Recommendation
Approach 3 (Hybrid) because:
- Automation for routine cases
- Human review for discrepancies
- Balances speed and accuracy

## Next Steps
1. Design invoice extraction prompt
2. Create matching algorithm
3. Build review UI
4. Test with real invoices
```

**Benefit:** Structured problem-solving, multiple perspectives

---

## How to Verify Skills Are Working

### Check Skills Directory
```bash
ls -la .claude/skills/
```

**Expected output:**
- superpowers/
- anthropic-official/
- alirezarezvani-skills/
- ... (15+ repositories)

### Check Settings
```bash
cat .claude/settings.local.json
```

**Expected:** List of skill paths

### Test in Claude Code
1. Open Claude Code
2. Start conversation
3. Ask: "What skills do you have available?"
4. Claude should list loaded skills

---

## Troubleshooting

### Skills Not Loading
- **Check:** `.claude/settings.local.json` exists and has correct paths
- **Check:** Skill repositories were cloned successfully (`git pull` in each)
- **Check:** Restart Claude Code after adding new skills

### Skill Not Activating
- **Cause:** Task doesn't match skill description
- **Fix:** Be more specific in request (mention "test", "design", "security")

### Permission Errors
- **Cause:** Script files not executable
- **Fix:** `chmod +x .claude/skills/*/scripts/*.sh`

---

## Next Steps

1. ✅ Download skills (done via `.claude/download_skills.sh`)
2. ✅ Configure settings (done via `.claude/settings.local.json`)
3. ⏭️ **Try 3 quick wins** (webapp-testing, frontend-design, secure-env)
4. ⏭️ Extract patterns for runtime prompts (Phase 2)
5. ⏭️ Create runtime prompt library (Phase 2-3)

---

**Quick Wins Status:** Ready to use  
**Prerequisites:** Skills downloaded, settings configured  
**Next Action:** Open Claude Code and test Quick Win #1 (webapp-testing)  
**Documentation:** See `PROMPT_LIBRARY_IMPLEMENTATION_PLAN.md` for full plan
