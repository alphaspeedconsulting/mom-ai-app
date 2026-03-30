# Backend Changes Required for Mom.alpha Viral Growth Features

> **Context:** The Mom.alpha PWA frontend has been updated with 12 viral growth features across 4 phases: shareable moments, co-parent network effects, content flywheel, and community feed. This document specifies every backend endpoint, database table, and background job needed to support these features.
>
> **Frontend work:** Complete — 49 pages, 46 new files, 0 TypeScript errors. All endpoints below are called from `src/lib/api-client.ts` and typed in `src/types/api-contracts.ts`.
>
> **Implementation priority:** P0 endpoints should ship first (enables sharing + referrals — the primary acquisition loops). P3 endpoints can wait until user base reaches ~500 households.

---

## Database Migrations

### 7 New Tables

```sql
-- =====================================================================
-- 1. Referrals — viral growth loop
-- =====================================================================
CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_operator_id UUID NOT NULL REFERENCES operators(id),
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    friends_invited INT DEFAULT 0,
    friends_joined INT DEFAULT 0,
    reward_weeks_earned INT DEFAULT 0,
    reward_weeks_used INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_referrals_operator ON referrals(referrer_operator_id);
CREATE UNIQUE INDEX idx_referrals_code ON referrals(referral_code);

-- =====================================================================
-- 2. Caregiver Access — limited view grants
-- =====================================================================
CREATE TABLE caregiver_access (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('babysitter', 'grandparent', 'nanny', 'other')),
    permissions JSONB NOT NULL DEFAULT '["calendar", "emergency", "allergies"]',
    access_token VARCHAR(64) UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    last_accessed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_caregiver_household ON caregiver_access(household_id);
CREATE UNIQUE INDEX idx_caregiver_token ON caregiver_access(access_token);

-- =====================================================================
-- 3. Family Templates — user-generated content marketplace
-- =====================================================================
CREATE TABLE family_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_operator_id UUID NOT NULL REFERENCES operators(id),
    author_name VARCHAR(100) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN (
        'routine', 'meal_plan', 'chore_chart', 'school_prep', 'bedtime', 'budget', 'other'
    )),
    items JSONB NOT NULL DEFAULT '[]',      -- array of {label, time?, day?, order}
    tags TEXT[] DEFAULT '{}',
    uses_count INT DEFAULT 0,
    rating_sum FLOAT DEFAULT 0,
    rating_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_templates_category ON family_templates(category);
CREATE INDEX idx_templates_rating ON family_templates((rating_sum / NULLIF(rating_count, 0)) DESC);

CREATE TABLE template_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES family_templates(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES operators(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (template_id, operator_id)
);

-- =====================================================================
-- 4. Seasonal Packs — admin-seeded timely content
-- =====================================================================
CREATE TABLE seasonal_packs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    season VARCHAR(50) NOT NULL,             -- "Back to School 2026", "Holiday 2026"
    icon VARCHAR(50) NOT NULL,               -- Material Symbols icon name
    checklist_items JSONB NOT NULL DEFAULT '[]',  -- array of {text, agent_type?}
    available_from DATE NOT NULL,
    available_until DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_seasonal_dates ON seasonal_packs(available_from, available_until);

-- =====================================================================
-- 5. Family Goals — gamified household progress
-- =====================================================================
CREATE TABLE family_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    goal_type VARCHAR(20) NOT NULL CHECK (goal_type IN (
        'savings', 'meals', 'exercise', 'sleep', 'tasks', 'custom'
    )),
    target_value FLOAT NOT NULL,
    current_value FLOAT DEFAULT 0,
    unit VARCHAR(50) NOT NULL,
    period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'monthly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_goals_household ON family_goals(household_id);

-- =====================================================================
-- 6. Emergency Events — "I'm Sick" delegation log
-- =====================================================================
CREATE TABLE emergency_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    activated_by UUID NOT NULL REFERENCES operators(id),
    duration_days INT NOT NULL DEFAULT 1,
    message TEXT,
    delegated_tasks INT DEFAULT 0,
    cancelled_events INT DEFAULT 0,
    notified_coparent BOOLEAN DEFAULT FALSE,
    activated_at TIMESTAMPTZ DEFAULT NOW(),
    deactivated_at TIMESTAMPTZ              -- NULL = still active
);

CREATE INDEX idx_emergency_household ON emergency_events(household_id);

-- =====================================================================
-- 7. Village Community — posts, reactions, comments, reports
-- =====================================================================
CREATE TABLE village_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_operator_id UUID NOT NULL REFERENCES operators(id),
    author_name VARCHAR(100) NOT NULL,       -- anonymized (first name + last initial)
    author_avatar_seed VARCHAR(20) NOT NULL, -- deterministic seed for avatar color
    category VARCHAR(20) NOT NULL CHECK (category IN (
        'tip', 'meal_idea', 'school_hack', 'activity', 'vent', 'win', 'question'
    )),
    content TEXT NOT NULL CHECK (length(content) <= 500),
    kids_ages INT[],
    location VARCHAR(100),
    heart_count INT DEFAULT 0,
    helpful_count INT DEFAULT 0,
    same_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    reported BOOLEAN DEFAULT FALSE,
    hidden BOOLEAN DEFAULT FALSE,            -- auto-hide at 3+ reports
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_village_created ON village_posts(created_at DESC) WHERE NOT hidden;
CREATE INDEX idx_village_category ON village_posts(category, created_at DESC) WHERE NOT hidden;

CREATE TABLE village_reactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES village_posts(id) ON DELETE CASCADE,
    operator_id UUID NOT NULL REFERENCES operators(id),
    reaction VARCHAR(10) NOT NULL CHECK (reaction IN ('heart', 'helpful', 'same')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, operator_id)
);

CREATE TABLE village_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES village_posts(id) ON DELETE CASCADE,
    author_operator_id UUID NOT NULL REFERENCES operators(id),
    author_name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL CHECK (length(content) <= 300),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_village_comments_post ON village_comments(post_id, created_at);

CREATE TABLE village_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES village_posts(id) ON DELETE CASCADE,
    reporter_operator_id UUID NOT NULL REFERENCES operators(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (post_id, reporter_operator_id)
);

-- =====================================================================
-- 8. Viral Analytics — event tracking
-- =====================================================================
CREATE TABLE viral_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    operator_id UUID REFERENCES operators(id),
    event_type VARCHAR(30) NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_viral_type_date ON viral_events(event_type, created_at);

-- =====================================================================
-- 9. Share Tokens — time-limited share links
-- =====================================================================
CREATE TABLE share_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES operators(id),
    item_type VARCHAR(30) NOT NULL,
    item_id VARCHAR(100) NOT NULL,
    token VARCHAR(64) UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_share_token ON share_tokens(token);
```

---

## Endpoint Specifications

### Priority P0 — Ship First (Enables Sharing + Referrals)

---

#### `GET /api/wins/{household_id}/weekly`

**Auth:** Bearer JWT (household member)

**Response:**
```json
{
  "household_id": "uuid",
  "week_start": "2026-03-23",
  "week_end": "2026-03-29",
  "meals_planned": 12,
  "dollars_saved": 47,
  "events_managed": 8,
  "tasks_completed": 23,
  "agent_interactions": 45,
  "top_agent": "calendar_whiz",
  "streak_days": 5,
  "personal_highlight": "You planned every dinner this week — your family ate home-cooked meals 6 out of 7 nights!"
}
```

**Implementation notes:**
- Query `tasks` table: `COUNT(*) WHERE household_id = ? AND status = 'completed' AND updated_at >= week_start`
- Query `calendar_events` table: `COUNT(*) WHERE household_id = ? AND start_at BETWEEN week_start AND week_end`
- Query `chat_messages` or call budget table for `agent_interactions`, grouped by `agent_type` for `top_agent`
- `meals_planned`: count tasks/chat interactions with `grocery_guru` agent, or count grocery list items added
- `dollars_saved`: compare this week's `expenses` total to prior week's, or sum `budget_buddy` savings suggestions accepted
- `streak_days`: count consecutive days with at least 1 agent interaction (from call budget or chat history)
- `personal_highlight`: generate via LLM with a prompt like: *"Write one encouraging sentence about this family's week: {stats}."* Cache for 24h per household. Fallback to template: *"You completed {tasks_completed} tasks this week — keep it up!"*

---

#### `POST /api/analytics/viral-event`

**Auth:** Bearer JWT (optional — fire-and-forget)

**Request:**
```json
{
  "event_type": "share_win_card",
  "metadata": { "method": "shared" }
}
```

**Response:** `204 No Content`

**Implementation:** Insert into `viral_events` table. No validation needed — this is analytics only. Should never fail the request even if insert fails.

**Valid `event_type` values:** `share_win_card`, `share_link`, `referral_send`, `caregiver_invite`, `template_share`, `emergency_activate`

---

#### `GET /api/referral`

**Auth:** Bearer JWT

**Response:**
```json
{
  "referral_code": "MOM-A7X9K2",
  "referral_url": "https://mom.alphaspeedai.com/signup?ref=MOM-A7X9K2",
  "friends_invited": 3,
  "friends_joined": 2,
  "reward_weeks_earned": 4,
  "reward_weeks_used": 2
}
```

**Implementation:**
- Lookup or auto-create a `referrals` row for the current operator
- `referral_code` format: `MOM-` + 6 alphanumeric chars (uppercase), generated on first access
- `referral_url`: `https://mom.alphaspeedai.com/signup?ref={code}`
- `friends_invited` increments when the user shares (tracked via `viral_events` with `event_type = 'referral_send'`)
- `friends_joined` increments when a new user redeems the code at signup

---

#### `POST /api/referral/redeem`

**Auth:** Bearer JWT (new user during signup)

**Request:**
```json
{
  "referral_code": "MOM-A7X9K2"
}
```

**Response:**
```json
{
  "success": true,
  "reward_weeks": 2,
  "message": "You and your friend both earned 2 free weeks of Family Pro!"
}
```

**Implementation:**
1. Validate `referral_code` exists in `referrals` table
2. Verify the redeeming user is not the referrer (no self-referral)
3. Verify the redeeming user hasn't already redeemed a code
4. Increment referrer's `friends_joined` and `reward_weeks_earned` by 2
5. Extend both users' `trial_expires_at` by 14 days (or credit 2 weeks of Family Pro)
6. If referrer has no active subscription, extend their trial; if subscribed, credit toward next billing cycle

**Anti-fraud:**
- Max 10 reward_weeks_earned per referrer (5 successful referrals)
- Rate limit: 1 redemption per IP per hour
- Unique email constraint (no duplicate signups)

---

### Priority P1 — Ship Second (Co-Parent Conversion + Emergency)

---

#### `GET /api/household/{household_id}/balance`

**Auth:** Bearer JWT (household member)

**Response:**
```json
{
  "household_id": "uuid",
  "period": "2026-W13",
  "parent_a": {
    "name": "Sarah Miller",
    "operator_id": "uuid",
    "tasks_completed": 18,
    "pct": 72
  },
  "parent_b": {
    "name": "David Miller",
    "operator_id": "uuid",
    "tasks_completed": 7,
    "pct": 28
  },
  "by_category": [
    { "category": "calendar", "parent_a_pct": 80, "parent_b_pct": 20 },
    { "category": "meals", "parent_a_pct": 60, "parent_b_pct": 40 },
    { "category": "school", "parent_a_pct": 90, "parent_b_pct": 10 }
  ],
  "weekly_trend": [
    { "week": "2026-03-02", "parent_a_pct": 65, "parent_b_pct": 35 },
    { "week": "2026-03-09", "parent_a_pct": 70, "parent_b_pct": 30 },
    { "week": "2026-03-16", "parent_a_pct": 68, "parent_b_pct": 32 },
    { "week": "2026-03-23", "parent_a_pct": 72, "parent_b_pct": 28 }
  ]
}
```

**Implementation:**
- `parent_a` is always the requesting user; `parent_b` is the co-parent (if exists, else `null`)
- Query `tasks` table: `GROUP BY completed_by_operator_id WHERE household_id = ? AND status = 'completed' AND updated_at >= start_of_week`
- **Requires** a `completed_by` or `assigned_to` column on tasks. If not present, attribute to the operator who created the task or last interacted via chat.
- `by_category`: derive from `agent_type` on the task (calendar_whiz → calendar, grocery_guru → meals, school_event_hub → school, etc.)
- `weekly_trend`: same query for each of the last 4 weeks
- If only one parent exists in the household, return `parent_b: null` — frontend handles this case

---

#### `POST /api/household/{household_id}/emergency`

**Auth:** Bearer JWT (household member)

**Request:**
```json
{
  "duration_days": 1,
  "message_to_coparent": "Not feeling well today. Can you cover the kids' activities?"
}
```

**Response:**
```json
{
  "active": true,
  "activated_at": "2026-03-30T08:00:00Z",
  "deactivates_at": "2026-03-31T08:00:00Z",
  "delegated_tasks": 5,
  "cancelled_events": 2,
  "notified_coparent": true
}
```

**Implementation — this is a transactional operation:**
1. Check no active emergency exists for this household
2. Query all `tasks` WHERE `household_id = ? AND status IN ('pending', 'in_progress') AND assigned_to = requesting_operator_id`
3. Reassign those tasks to the co-parent's `operator_id` (set `assigned_to`)
4. Query `calendar_events` for the next `duration_days` WHERE `member_id` is linked to the requesting operator
5. For non-essential events (heuristic: not school, not medical), add `[PAUSED]` prefix to title or mark a `paused` flag
6. Send push notification to co-parent: *"Sarah activated Emergency Mode: '{message}'. {delegated_tasks} tasks have been delegated to you."*
7. Insert `emergency_events` row
8. Schedule auto-deactivation (see Background Jobs below)

---

#### `GET /api/household/{household_id}/emergency`

**Auth:** Bearer JWT (household member)

**Response:** Same `EmergencyStatus` shape as above. Returns the most recent `emergency_events` row. If `deactivated_at IS NULL`, it's active.

---

#### `POST /api/household/{household_id}/emergency/deactivate`

**Auth:** Bearer JWT (household member)

**Response:** `EmergencyStatus` with `active: false`

**Implementation:**
1. Set `deactivated_at = NOW()` on the active `emergency_events` row
2. Optionally reassign tasks back (or leave them — let the user manually reassign)
3. Remove `[PAUSED]` prefix from calendar events
4. Send push notification to co-parent: *"Sarah is feeling better — Emergency Mode deactivated."*

---

#### `GET /api/household/{household_id}/caregivers`

**Auth:** Bearer JWT (household admin)

**Response:** Array of `CaregiverAccess` objects.

---

#### `POST /api/household/{household_id}/caregivers`

**Auth:** Bearer JWT (household admin)

**Request:**
```json
{
  "name": "Grandma Sue",
  "email": "grandma@email.com",
  "role": "grandparent",
  "permissions": ["calendar", "emergency", "allergies"]
}
```

**Response:** The created `CaregiverAccess` object.

**Implementation:**
1. Generate a random `access_token` (64 chars, URL-safe)
2. Insert into `caregiver_access`
3. Send email to the caregiver with a link: `https://mom.alphaspeedai.com/caregiver-view?token={access_token}`
4. Email should explain what they can see and that it's read-only

---

#### `DELETE /api/household/{household_id}/caregivers/{caregiver_id}`

**Auth:** Bearer JWT (household admin)

Soft-delete: set `active = FALSE`. The access token immediately stops working.

---

#### `GET /api/caregiver/{access_token}`

**Auth:** None (token-authenticated) — **PUBLIC ENDPOINT**

**Response:**
```json
{
  "household_name": "The Millers",
  "today_schedule": [ /* CalendarEvent objects for today */ ],
  "emergency_contacts": [
    { "name": "Sarah Miller", "phone": "512-555-0100", "relationship": "Mom" }
  ],
  "allergies": ["Peanuts (Jake)", "Shellfish (Maya)"],
  "medications": [
    { "member": "Jake", "medication": "EpiPen", "schedule": "As needed" }
  ],
  "routines": [
    { "time": "7:00 AM", "description": "Wake up, brush teeth" },
    { "time": "3:30 PM", "description": "Pick up from school" }
  ],
  "family_members": [
    { "name": "Maya", "age": 7 },
    { "name": "Jake", "age": 4 }
  ]
}
```

**Implementation:**
1. Look up `caregiver_access` by `access_token` WHERE `active = TRUE`
2. Update `last_accessed_at = NOW()`
3. Based on `permissions` array, include or exclude sections:
   - `"calendar"` → include `today_schedule`
   - `"emergency"` → include `emergency_contacts`
   - `"allergies"` → include `allergies` (derived from family member tags)
   - `"medications"` → include `medications` (from family member tags or a dedicated field)
   - `"routines"` → include `routines` (from memory store or automation_routines)
4. `family_members`: always included (name + age of children only, no parent info)

**Security:** This endpoint must NOT expose parent email, phone (except emergency contacts), or any financial data.

---

### Priority P2 — Ship Third (Engagement + Content)

---

#### `GET /api/household/{household_id}/voice-brief`

**Auth:** Bearer JWT (household member)

**Response:**
```json
{
  "text": "Good morning Sarah. You have 3 things on your plate today. Maya has soccer practice at 3 PM, and Jake's allergy appointment is at 10 AM. You completed 23 tasks last week — that's a new record! Budget Buddy noticed your grocery spending is down 12% this month. Have a great day.",
  "generated_at": "2026-03-30T07:00:00Z"
}
```

**Implementation:**
1. Gather today's calendar events, active tasks, inbox items, pinned memories for the household
2. Send to LLM with system prompt:
   ```
   Generate a warm, encouraging 30-second morning briefing for a busy parent.
   Include: today's schedule highlights, active task count, any notable achievements
   or agent insights. Use their first name. Keep it under 150 words.
   Tone: supportive, calm, efficient.
   ```
3. **Cache** the result for 1 hour per household (key: `voice_brief:{household_id}:{date}`)
4. Route to cheapest LLM (Gemini Flash) — this is a low-complexity generation

---

#### `GET /api/templates?category=&q=`

**Auth:** Bearer JWT

**Query params:**
- `category` (optional): filter by template category
- `q` (optional): full-text search on title + description + tags

**Response:**
```json
{
  "templates": [
    {
      "id": "uuid",
      "title": "Morning Routine for Ages 3-6",
      "description": "A gentle morning routine...",
      "category": "routine",
      "author_name": "Sarah M.",
      "uses_count": 1247,
      "rating": 4.7,
      "items": [
        { "label": "Wake up, stretch", "time": "7:00 AM", "order": 0 },
        { "label": "Brush teeth", "time": "7:10 AM", "order": 1 }
      ],
      "tags": ["toddler", "preschool", "gentle"],
      "created_at": "2026-03-15T10:00:00Z"
    }
  ],
  "total": 42
}
```

**Implementation:**
- Default sort: `uses_count DESC, rating DESC`
- `rating` is computed: `rating_sum / NULLIF(rating_count, 0)`, default 0
- `author_name`: anonymize to first name + last initial (e.g., "Sarah M.")
- Full-text search: `WHERE title ILIKE '%q%' OR description ILIKE '%q%' OR q = ANY(tags)`
- Paginate: `LIMIT 20 OFFSET ?` (or cursor-based)

---

#### `GET /api/templates/{template_id}`

**Auth:** Bearer JWT

**Response:** Single `FamilyTemplate` object (same shape as array item above).

---

#### `POST /api/templates`

**Auth:** Bearer JWT

**Request:**
```json
{
  "title": "Morning Routine for Ages 3-6",
  "description": "A gentle morning routine...",
  "category": "routine",
  "items": [
    { "label": "Wake up, stretch", "time": "7:00 AM", "order": 0 }
  ],
  "tags": ["toddler", "preschool"]
}
```

**Validation:**
- `title`: 3-200 chars
- `description`: 10-500 chars
- `items`: 1-30 items, each `label` 1-200 chars
- `tags`: 0-10 tags, each 1-30 chars
- Rate limit: 5 templates per user per day

---

#### `POST /api/templates/{template_id}/clone`

**Auth:** Bearer JWT

**Response:** `{ "cloned": true }`

**Implementation:**
1. Copy the template's `items` into a new `automation_routines` row for the user's household
2. Increment `uses_count` on the template
3. Don't allow cloning your own template

---

#### `POST /api/templates/{template_id}/rate`

**Auth:** Bearer JWT

**Request:** `{ "rating": 4 }`

**Implementation:**
- Upsert into `template_ratings` (unique on template_id + operator_id)
- Update `family_templates.rating_sum` and `rating_count` accordingly
- If updating an existing rating, subtract old value and add new

---

#### `GET /api/seasonal/current`

**Auth:** Bearer JWT

**Response:**
```json
{
  "packs": [
    {
      "id": "uuid",
      "title": "Back to School 2026",
      "description": "Everything you need to get ready for the new school year",
      "season": "Fall 2026",
      "icon": "school",
      "checklist_items": [
        { "text": "Order school supplies", "agent_type": "budget_buddy" },
        { "text": "Schedule back-to-school physicals", "agent_type": "health_hub" },
        { "text": "Set up carpool schedule", "agent_type": "calendar_whiz" }
      ],
      "available_from": "2026-07-15",
      "available_until": "2026-09-15"
    }
  ]
}
```

**Implementation:**
- `WHERE available_from <= CURRENT_DATE AND available_until >= CURRENT_DATE`
- This is admin-seeded content — create a management script or admin endpoint to insert packs
- Suggested initial packs to seed:
  - **Spring Cleaning** (Mar-Apr): declutter checklist, donation scheduling
  - **Summer Camp Prep** (May-Jun): camp research, packing lists, schedule setup
  - **Back to School** (Jul-Sep): supplies, physicals, teacher meetings
  - **Holiday Season** (Nov-Dec): gift budgeting, meal planning, travel prep

---

#### `GET /api/household/{household_id}/goals`

**Auth:** Bearer JWT (household member)

**Response:** Array of `FamilyGoal` objects, ordered by `created_at DESC`.

---

#### `POST /api/household/{household_id}/goals`

**Auth:** Bearer JWT (household member)

**Request:**
```json
{
  "title": "Cook at home 5 nights this week",
  "goal_type": "meals",
  "target_value": 5,
  "unit": "meals",
  "period": "weekly"
}
```

**Validation:**
- `target_value` > 0
- Max 10 active goals per household
- `period` determines when `current_value` auto-resets (see Background Jobs)

---

#### `PUT /api/household/{household_id}/goals/{goal_id}`

**Auth:** Bearer JWT (household member)

**Request:** Partial update — any of `current_value`, `title`, `target_value`.

**Implementation:**
- When `current_value >= target_value`, set `completed_at = NOW()`
- Trigger a push notification: *"Goal completed: {title}! 🎉"*

---

#### `POST /api/household/{household_id}/share`

**Auth:** Bearer JWT (household member)

**Request:**
```json
{
  "item_type": "grocery_list",
  "item_id": "uuid"
}
```

**Response:**
```json
{
  "share_url": "https://mom.alphaspeedai.com/share?token=abc123...",
  "share_token": "abc123...",
  "expires_at": "2026-04-06T00:00:00Z"
}
```

**Implementation:**
- Generate 64-char URL-safe token
- Insert into `share_tokens` with 7-day expiry
- `share_url` uses query param format: `/share?token={token}`

---

#### `GET /api/share/{token}`

**Auth:** None — **PUBLIC ENDPOINT**

**Response:**
```json
{
  "item_type": "grocery_list",
  "title": "Weekly Groceries",
  "preview_data": {
    "items": [
      { "text": "Organic milk" },
      { "text": "Chicken breast (2 lbs)" }
    ]
  },
  "household_name": "The Millers",
  "sharer_name": "Sarah"
}
```

**Implementation:**
1. Look up `share_tokens` by `token` WHERE `expires_at > NOW()`
2. Based on `item_type`, fetch the item data and return a limited preview
3. `sharer_name`: first name only (privacy)
4. `household_name`: household display name
5. `preview_data` shape depends on `item_type`:
   - `grocery_list`: `{ items: [{text}] }` (max 10 items)
   - `calendar_event`: `{ date, description }` (no location/attendees)
   - `task`: `{ status, agent_type }` (no details)
   - `win_card`: `{ tasks_completed, events_managed, streak_days }` (stats only)

**Security:** Never expose full item data, addresses, financial info, or personal details.

---

### Priority P3 — Ship When User Base Reaches ~500 Households

---

#### `GET /api/village/feed?category=&cursor=`

**Auth:** Bearer JWT

**Query params:**
- `category` (optional): filter by post category
- `cursor` (optional): cursor for pagination (ISO timestamp of last post)

**Response:**
```json
{
  "posts": [
    {
      "id": "uuid",
      "author_name": "Sarah M.",
      "author_avatar_seed": "a7x9k2",
      "category": "tip",
      "content": "Game changer: I prep all lunches on Sunday evening...",
      "kids_ages": [4, 7],
      "location": null,
      "reactions": { "heart": 12, "helpful": 8, "same": 3 },
      "user_reaction": "heart",
      "comment_count": 5,
      "reported": false,
      "created_at": "2026-03-30T14:00:00Z"
    }
  ],
  "total": 156,
  "next_cursor": "2026-03-30T12:00:00Z"
}
```

**Implementation:**
- `WHERE NOT hidden` — exclude auto-hidden posts
- Sort by `created_at DESC`
- Cursor pagination: `WHERE created_at < cursor LIMIT 20`
- `user_reaction`: LEFT JOIN `village_reactions` on `post_id + requesting_operator_id`
- `author_name`: anonymized (first name + last initial)
- `author_avatar_seed`: deterministic hash of operator_id (for consistent avatar colors)

---

#### `GET /api/village/posts/{post_id}`

**Auth:** Bearer JWT

**Response:** Single `VillagePost` object.

---

#### `POST /api/village/posts`

**Auth:** Bearer JWT

**Request:**
```json
{
  "category": "tip",
  "content": "Game changer: I prep all lunches on Sunday evening...",
  "kids_ages": [4, 7]
}
```

**Validation:**
- `content`: 10-500 chars
- Rate limit: 5 posts per user per day
- **Content moderation:** Run content through a lightweight check before publishing:
  - Reject if it contains phone numbers, email addresses, or URLs (regex)
  - Optionally pass through LLM classifier to flag inappropriate content
  - Auto-reject slurs/hate speech (keyword list)

---

#### `POST /api/village/posts/{post_id}/react`

**Auth:** Bearer JWT

**Request:** `{ "reaction": "heart" }`

**Implementation:**
- Upsert into `village_reactions` (unique on post_id + operator_id)
- If same reaction exists, delete it (toggle off)
- If different reaction exists, update it
- Update the denormalized counts on `village_posts` accordingly

---

#### `POST /api/village/posts/{post_id}/report`

**Auth:** Bearer JWT

**Response:** `204 No Content`

**Implementation:**
1. Insert into `village_reports` (unique on post_id + reporter)
2. Count total reports for this post
3. If count >= 3, set `village_posts.hidden = TRUE` and `reported = TRUE`

---

#### `GET /api/village/posts/{post_id}/comments`

**Auth:** Bearer JWT

**Response:** Array of `VillageComment` objects, ordered by `created_at ASC`.

---

#### `POST /api/village/posts/{post_id}/comments`

**Auth:** Bearer JWT

**Request:** `{ "content": "Great tip! We do something similar..." }`

**Validation:**
- `content`: 1-300 chars
- Rate limit: 20 comments per user per day
- Increment `village_posts.comment_count`

---

## Background Jobs

### 1. Emergency Auto-Deactivation (Cron)

**Schedule:** Every hour

**Logic:**
```python
UPDATE emergency_events
SET deactivated_at = NOW()
WHERE deactivated_at IS NULL
  AND activated_at + (duration_days * INTERVAL '1 day') <= NOW()
RETURNING household_id;
```

For each deactivated household:
- Remove `[PAUSED]` prefix from calendar events
- Send push notification: *"Emergency Mode has auto-deactivated after {duration_days} day(s). Welcome back!"*

### 2. Goal Period Reset (Cron)

**Schedule:** Every Monday at midnight UTC (for weekly goals), 1st of each month at midnight (for monthly goals)

**Logic:**
```python
-- Weekly reset
UPDATE family_goals
SET current_value = 0
WHERE period = 'weekly'
  AND completed_at IS NULL;

-- Monthly reset
UPDATE family_goals
SET current_value = 0
WHERE period = 'monthly'
  AND completed_at IS NULL;
```

### 3. Goal Auto-Progress (Event-Driven)

When certain events happen, auto-increment the related goal's `current_value`:

| Event | Goal Type | Increment |
|-------|-----------|-----------|
| Task completed | `tasks` | +1 |
| Grocery list item added | `meals` | +1 |
| Expense logged (savings) | `savings` | +amount |
| Sleep log entry | `sleep` | +1 |
| Self-care reminder completed | `exercise` | +1 |

This can be implemented as post-commit hooks on the relevant tables, or as explicit calls in the task/expense/sleep service code.

### 4. Share Token Cleanup (Cron)

**Schedule:** Daily at 3 AM UTC

```sql
DELETE FROM share_tokens WHERE expires_at < NOW();
```

---

## Migration to `dad-alpha/`

Per `CLAUDE.md` rules, the following files must be synced to `dad-alpha/`:

1. `src/types/api-contracts.ts` — all new types added in Phases 1-4
2. `src/lib/api-client.ts` — all new endpoint methods

The types and endpoints are brand-neutral. The only brand-specific behavior is:
- Referral codes: `MOM-` prefix for mom-alpha, `DAD-` prefix for dad-alpha
- Village feed: consider separate feeds per brand, or a shared feed with brand indicator

---

## Summary

| Category | Count |
|----------|-------|
| New database tables | 9 |
| New endpoints | 27 |
| Public (no-auth) endpoints | 2 (`/api/share/{token}`, `/api/caregiver/{token}`) |
| Background cron jobs | 4 |
| LLM calls required | 2 (weekly win highlight, voice brief script) |
| Email sends | 1 (caregiver invite) |
| Push notification triggers | 4 (emergency activate/deactivate, goal complete, co-parent task delegation) |
