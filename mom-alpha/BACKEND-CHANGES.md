# Backend Changes Required for Mom.alpha Second Brain Features

> **Context:** The Mom.alpha PWA frontend has been updated with a local-first memory layer, daily briefing, voice capture, shared inbox, and cross-agent context injection. This document specifies the backend changes needed in `family_platform/` and `mom_alpha/` to fully support these features.
>
> **Frontend branch:** `claude/add-local-memory-storage-EHGmA`

---

## 1. Chat API — Memory Context Injection

### What changed on the frontend
The chat store now sends an optional `memory_context` array with each message and expects an optional `memory_hints` array in the response.

### Endpoint: `POST /api/chat`

**Request body additions:**
```python
class ChatRequest(BaseModel):
    household_id: str
    agent_type: AgentType
    message: str
    media_urls: list[str] | None = None
    # NEW — on-device family context from local memory store
    memory_context: list[MemoryContextItem] | None = None

class MemoryContextItem(BaseModel):
    category: str       # "family_fact", "preference", "routine", "important_date", etc.
    content: str        # The memory text, e.g. "Jake is allergic to peanuts"
    pinned: bool        # User-pinned items (high priority context)
```

**What the backend should do with `memory_context`:**
1. If present, prepend the memory items to the LLM system prompt as structured context, e.g.:
   ```
   ## Family Context (from Mom's memory)
   - [family_fact, pinned] Jake is allergic to peanuts
   - [routine] Soccer practice every Tuesday at 4pm
   - [preference] We prefer organic produce
   ```
2. Pinned items should be prioritized (placed first).
3. Limit to ~20 items to stay within token budget. The frontend already caps at 20.
4. The memory context should NOT be persisted server-side — it's ephemeral per-request context from the device.

**Response body additions:**
```python
class ChatResponse(BaseModel):
    message_id: str
    agent_type: AgentType
    content: str
    intent_type: IntentType
    model_used: str | None
    tokens_used: int | None
    quick_actions: list[QuickAction] | None = None
    task_id: str | None = None
    # NEW — memory hints for the frontend to auto-save locally
    memory_hints: list[MemoryHint] | None = None

class MemoryHint(BaseModel):
    category: str   # "family_fact", "routine", "important_date", etc.
    content: str    # The fact to remember
```

**What the backend should do to generate `memory_hints`:**
1. After generating the agent response, optionally run a lightweight extraction pass (or use structured output) to identify new family facts, routines, or dates mentioned.
2. Return them in `memory_hints` so the frontend auto-saves to local IndexedDB.
3. This is **optional** — the frontend also does its own regex-based extraction. Backend hints are higher quality.

**Priority:** HIGH — this is what makes agents context-aware.

---

## 2. Shared Inbox API — Co-Parent Task Sharing

### What changed on the frontend
A new shared inbox lets both parents capture, delegate, and track tasks. The frontend stores tasks locally in IndexedDB AND syncs with the backend so the co-parent can see them.

### New Database Table: `shared_inbox_items`

```sql
CREATE TABLE shared_inbox_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id    UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    content         TEXT NOT NULL,
    assigned_agent  VARCHAR(50),                -- agent_type enum
    assigned_to     UUID REFERENCES operators(id),  -- co-parent operator_id
    created_by      UUID NOT NULL REFERENCES operators(id),
    status          VARCHAR(20) NOT NULL DEFAULT 'captured',
        -- captured | delegated | in_progress | done | dismissed
    agent_response  TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_shared_inbox_household ON shared_inbox_items(household_id);
CREATE INDEX idx_shared_inbox_status ON shared_inbox_items(status);
```

### Endpoints

#### `GET /api/household/{household_id}/inbox`
Returns all shared inbox items for the household.

**Response:**
```json
{
  "items": [
    {
      "id": "uuid",
      "household_id": "uuid",
      "content": "Pick up Jake's prescription",
      "assigned_agent": "health_hub",
      "assigned_to": "uuid-of-co-parent",
      "created_by": "uuid-of-creator",
      "created_by_name": "Sarah",
      "status": "delegated",
      "agent_response": null,
      "created_at": "2026-03-30T08:00:00Z",
      "updated_at": "2026-03-30T08:05:00Z"
    }
  ],
  "active_count": 5,
  "completed_count": 12
}
```

**Notes:**
- `created_by_name` should be resolved by joining with the operators table.
- Filter out items older than 30 days with status `done` or `dismissed` to keep the payload lean.
- Order: active items first (captured → delegated → in_progress), then done/dismissed by `updated_at` DESC.

#### `POST /api/household/{household_id}/inbox`
Create a new shared inbox item.

**Request:**
```json
{
  "content": "Buy birthday cake for Saturday party",
  "assigned_agent": "grocery_guru",
  "assigned_to": "uuid-of-co-parent"
}
```

**Response:** The created `SharedInboxItem` (same shape as list items).

**Notes:**
- `created_by` is set from the JWT `sub` claim (current user).
- `assigned_agent` and `assigned_to` are optional.
- If `assigned_to` is set, consider sending a push notification to the co-parent.

#### `PUT /api/household/{household_id}/inbox/{item_id}`
Update an inbox item (status, assignment, agent response).

**Request (all fields optional):**
```json
{
  "status": "done",
  "assigned_agent": "calendar_whiz",
  "assigned_to": "uuid",
  "content": "Updated task text",
  "agent_response": "I've added it to your calendar for Saturday 2pm"
}
```

**Response:** The updated `SharedInboxItem`.

**Authorization:** Both household members (admin + member roles) can update any item.

#### `DELETE /api/household/{household_id}/inbox/{item_id}`
Delete an inbox item permanently.

**Response:** 204 No Content.

**Priority:** HIGH — this is what makes Mom.alpha a two-parent tool, not just a single-user app.

---

## 3. Household Members API — Verify Response Shape

### Existing endpoint: `GET /api/household/{household_id}/members`

The frontend depends on this response shape:
```json
{
  "household_id": "uuid",
  "members": [
    {
      "operator_id": "uuid",
      "name": "Sarah",
      "email": "sarah@example.com",
      "role": "admin",
      "parent_brand": "mom",
      "membership_status": "active"
    },
    {
      "operator_id": "uuid",
      "name": "Mike",
      "email": "mike@example.com",
      "role": "member",
      "parent_brand": "dad",
      "membership_status": "active"
    }
  ]
}
```

**What to verify:**
- `operator_id` must be present (used as the key for co-parent assignment).
- `name` must be present (displayed in task assignment UI).
- `role` field must distinguish admin vs member (both are "parents" in the shared inbox).

**Priority:** MEDIUM — endpoint likely exists, just verify the shape matches.

---

## 4. Calendar API — Verify Date Range Filtering

### Existing endpoint: `GET /api/calendar`

The Daily Brief component calls:
```
GET /api/calendar?start_after=2026-03-30T00:00:00Z&start_before=2026-03-31T00:00:00Z
```

**What to verify:**
- `start_after` and `start_before` query params filter `start_at` correctly.
- Response includes `member_name` and `member_color` (used for color-coded schedule display).

**Priority:** LOW — likely already works, just confirm.

---

## 5. Tasks API — Verify Active Task Filtering

### Existing endpoint: `GET /api/tasks`

The Daily Brief filters for non-completed tasks:
```typescript
tasks.filter((t) => t.status !== "completed")
```

**What to verify:**
- Response includes `title`, `status`, `progress_pct` fields.
- Active tasks (pending, in_progress) are returned.

**Priority:** LOW — likely already works.

---

## 6. Push Notifications for Shared Inbox (Future)

When a task is assigned to a co-parent (`assigned_to` is set), the backend should optionally trigger a push notification:

```json
{
  "title": "New task from Sarah",
  "body": "Pick up Jake's prescription",
  "data": {
    "action_type": "open_inbox",
    "url": "/memory"
  }
}
```

This uses the existing push notification infrastructure (`POST /api/notifications/push/send`).

**Priority:** LOW — nice-to-have for v1.1.

---

## 7. Agent Chat — Task Pre-fill Support (Optional Enhancement)

When a user delegates an inbox task, the frontend navigates to:
```
/chat/{agent_type}?task=Pick+up+Jake's+prescription
```

The frontend handles this entirely client-side (reads the query param and pre-fills the input). No backend change needed.

However, if the backend wants to **automatically mark inbox tasks as `in_progress`** when the agent processes them, it could:
1. Accept an optional `inbox_item_id` in `ChatRequest`.
2. After processing, update the shared inbox item's status to `in_progress` and set `agent_response`.

**Priority:** LOW — future enhancement.

---

## Implementation Order

| Phase | Item | Effort | Impact |
|-------|------|--------|--------|
| **1** | Chat API: accept `memory_context` in request | Small | Enables cross-agent intelligence |
| **1** | Shared Inbox: full CRUD endpoints + DB table | Medium | Enables co-parent task sharing |
| **2** | Chat API: return `memory_hints` in response | Medium | Auto-builds family knowledge base |
| **2** | Shared Inbox: push notifications on assignment | Small | Co-parent awareness |
| **3** | Chat API: accept `inbox_item_id` for auto-status | Small | Closes the delegation loop |

---

## Files to Modify

### `family_platform/` (shared package)
- `models/shared_inbox.py` — new SQLAlchemy model
- `services/chat_service.py` — inject `memory_context` into LLM prompt, extract `memory_hints`
- `services/shared_inbox_service.py` — new CRUD service
- `schemas/chat.py` — add `memory_context` and `memory_hints` fields
- `schemas/shared_inbox.py` — new Pydantic schemas

### `mom_alpha/` (FastAPI backend)
- `routes/shared_inbox.py` — new router with 4 endpoints
- `routes/chat.py` — pass `memory_context` to service, return `memory_hints`
- `main.py` — register shared inbox router
- `scripts/migrate.py` — add `shared_inbox_items` table migration

### `dad_alpha/` (sibling app — keep in sync)
- Same schema changes to `api-contracts.ts` and `api-client.ts` (already done for mom-alpha, must mirror)

---

## Frontend Types Reference

For convenience, here are the exact TypeScript types the frontend expects (copy to Python Pydantic models):

```typescript
// api-contracts.ts
interface SharedInboxItem {
  id: string;
  household_id: string;
  content: string;
  assigned_agent?: AgentType;
  assigned_to?: string;
  created_by: string;
  created_by_name: string;
  status: "captured" | "delegated" | "in_progress" | "done" | "dismissed";
  agent_response?: string;
  created_at: string;  // ISO datetime
  updated_at: string;
}

interface SharedInboxCreateRequest {
  content: string;
  assigned_agent?: AgentType;
  assigned_to?: string;
}

interface SharedInboxUpdateRequest {
  status?: SharedInboxStatus;
  assigned_agent?: AgentType;
  assigned_to?: string;
  content?: string;
  agent_response?: string;
}

interface SharedInboxListResponse {
  items: SharedInboxItem[];
  active_count: number;
  completed_count: number;
}

interface MemoryContextItem {
  category: string;
  content: string;
  pinned: boolean;
}

// In ChatResponse:
memory_hints?: Array<{ category: string; content: string }>;
```
