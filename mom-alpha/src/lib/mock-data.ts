/**
 * Mock data for Phase 3 — all shapes match api-contracts.ts exactly.
 * Will be replaced with real API calls in Phase 4.
 */

import type {
  AgentCard,
  CalendarEvent,
  TaskItem,
  ChatResponse,
  BudgetResponse,
  FamilyMember,
  Household,
  NotificationItem,
  ConsentStatusResponse,
} from "@/types/api-contracts";

// ─── Family ──────────────────────────────────────────────────────────────────

export const MOCK_MEMBERS: FamilyMember[] = [
  { id: "m1", name: "Mom", age: 38, photo_url: null, tags: ["vegetarian"], color: "#32695a" },
  { id: "m2", name: "Sophia", age: 10, photo_url: null, tags: ["soccer", "piano"], color: "#8f4f14" },
  { id: "m3", name: "Liam", age: 7, photo_url: null, tags: ["swimming"], color: "#655883" },
];

export const MOCK_HOUSEHOLD: Household = {
  id: "h1",
  name: "The Martinez Family",
  tier: "family",
  trial_expires_at: null,
  members: MOCK_MEMBERS,
};

// ─── Agents ──────────────────────────────────────────────────────────────────

export const MOCK_AGENTS: AgentCard[] = [
  {
    agent_type: "calendar_whiz",
    name: "Calendar Whiz",
    description: "Manages family schedules, detects conflicts, and syncs all calendars.",
    category: "Household",
    icon: "calendar_month",
    is_active: true,
    is_available: true,
    required_tier: "family",
    capabilities: ["Schedule events", "Conflict detection", "Calendar sync", "Smart rescheduling"],
  },
  {
    agent_type: "grocery_guru",
    name: "Grocery Guru",
    description: "Builds grocery lists, plans meals, and suggests recipes for the family.",
    category: "Household",
    icon: "shopping_cart",
    is_active: true,
    is_available: true,
    required_tier: "family",
    capabilities: ["Grocery lists", "Meal planning", "Recipe suggestions", "Dietary filters"],
  },
  {
    agent_type: "budget_buddy",
    name: "Budget Buddy",
    description: "Tracks spending, scans receipts, and finds savings opportunities.",
    category: "Household",
    icon: "account_balance_wallet",
    is_active: true,
    is_available: true,
    required_tier: "family",
    capabilities: ["Receipt scanning", "Expense tracking", "Budget alerts", "Savings tips"],
  },
  {
    agent_type: "school_event_hub",
    name: "School Event Hub",
    description: "Scans school emails, tracks permission slips, and manages events.",
    category: "Education",
    icon: "school",
    is_active: true,
    is_available: true,
    required_tier: "family",
    capabilities: ["Email scanning", "Permission slips", "Event tracking", "Fee payments"],
  },
  {
    agent_type: "tutor_finder",
    name: "Tutor Finder",
    description: "Finds and compares tutors based on subject, availability, and ratings.",
    category: "Education",
    icon: "person_search",
    is_active: false,
    is_available: true,
    required_tier: "family_pro",
    capabilities: ["Tutor search", "Compare ratings", "Book sessions", "Progress tracking"],
  },
  {
    agent_type: "health_hub",
    name: "Health Hub",
    description: "Tracks wellness appointments, medication schedules, and health streaks.",
    category: "Wellness",
    icon: "health_and_safety",
    is_active: false,
    is_available: true,
    required_tier: "family",
    capabilities: ["Appointment reminders", "Wellness streaks", "Medication tracking"],
  },
  {
    agent_type: "sleep_tracker",
    name: "Sleep Tracker",
    description: "Monitors sleep patterns and provides personalized improvement tips.",
    category: "Wellness",
    icon: "bedtime",
    is_active: false,
    is_available: true,
    required_tier: "family_pro",
    capabilities: ["Sleep logging", "Pattern analysis", "Bedtime reminders", "Tips"],
  },
  {
    agent_type: "self_care_reminder",
    name: "Self-Care Reminder",
    description: "Gentle nudges for self-care, mindfulness, and personal wellness goals.",
    category: "Wellness",
    icon: "spa",
    is_active: false,
    is_available: true,
    required_tier: "family_pro",
    capabilities: ["Self-care prompts", "Mindfulness reminders", "Goal tracking"],
  },
];

// ─── Calendar Events ─────────────────────────────────────────────────────────

const today = new Date();
const yyyy = today.getFullYear();
const mm = today.getMonth();
const dd = today.getDate();

function isoDate(day: number, hour: number, minute = 0): string {
  return new Date(yyyy, mm, day, hour, minute).toISOString();
}

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: "e1", household_id: "h1", member_id: "m2", title: "Sophia — Soccer Practice",
    description: "Jefferson Park, Field 3", start_at: isoDate(dd, 15, 30), end_at: isoDate(dd, 17, 0),
    all_day: false, source: "internal", external_id: null,
    member_name: "Sophia", member_color: "#8f4f14", metadata: {},
  },
  {
    id: "e2", household_id: "h1", member_id: "m1", title: "Dentist Appointment",
    description: "Dr. Chen, 2nd floor", start_at: isoDate(dd, 10, 0), end_at: isoDate(dd, 11, 0),
    all_day: false, source: "google", external_id: "g_abc123",
    member_name: "Mom", member_color: "#32695a", metadata: {},
  },
  {
    id: "e3", household_id: "h1", member_id: "m3", title: "Liam — Swim Class",
    description: "Community Pool", start_at: isoDate(dd, 16, 0), end_at: isoDate(dd, 17, 0),
    all_day: false, source: "internal", external_id: null,
    member_name: "Liam", member_color: "#655883", metadata: {},
  },
  {
    id: "e4", household_id: "h1", member_id: null, title: "Family Game Night",
    description: null, start_at: isoDate(dd, 19, 0), end_at: isoDate(dd, 21, 0),
    all_day: false, source: "internal", external_id: null,
    member_name: null, member_color: null, metadata: {},
  },
  {
    id: "e5", household_id: "h1", member_id: "m2", title: "Piano Lesson",
    description: "Ms. Rivera's Studio", start_at: isoDate(dd + 1, 16, 0), end_at: isoDate(dd + 1, 17, 0),
    all_day: false, source: "internal", external_id: null,
    member_name: "Sophia", member_color: "#8f4f14", metadata: {},
  },
  {
    id: "e6", household_id: "h1", member_id: null, title: "Science Fair",
    description: "Lincoln Elementary", start_at: isoDate(dd + 3, 9, 0), end_at: isoDate(dd + 3, 12, 0),
    all_day: false, source: "school", external_id: null,
    member_name: null, member_color: null, metadata: { school: "Lincoln Elementary" },
  },
];

// ─── Tasks ───────────────────────────────────────────────────────────────────

export const MOCK_TASKS: TaskItem[] = [
  {
    id: "t1", household_id: "h1", agent_type: "grocery_guru",
    title: "Weekly meal plan generation",
    status: "in_progress", progress_pct: 60,
    steps: [
      { label: "Analyzing dietary preferences", status: "completed" },
      { label: "Generating recipes", status: "in_progress" },
      { label: "Building grocery list", status: "pending" },
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t2", household_id: "h1", agent_type: "school_event_hub",
    title: "Processing school newsletter",
    status: "in_progress", progress_pct: 45,
    steps: [
      { label: "Scanning email", status: "completed" },
      { label: "Extracting events", status: "in_progress" },
      { label: "Updating calendar", status: "pending" },
    ],
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "t3", household_id: "h1", agent_type: "calendar_whiz",
    title: "Calendar sync complete",
    status: "completed", progress_pct: 100,
    steps: [
      { label: "Fetching Google events", status: "completed" },
      { label: "Detecting conflicts", status: "completed" },
      { label: "Synced 12 events", status: "completed" },
    ],
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// ─── Budget ──────────────────────────────────────────────────────────────────

export const MOCK_BUDGET: BudgetResponse = {
  household_id: "h1",
  used: 342,
  limit: 500,
  remaining: 158,
  period_start: new Date(yyyy, mm, 1).toISOString(),
  period_end: new Date(yyyy, mm + 1, 0).toISOString(),
  is_over_budget: false,
  tier: "family",
};

// ─── Notifications ───────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "n1", category: "school", title: "Permission slip due tomorrow",
    body: "Sophia's field trip to the Science Museum needs your signature by Friday.",
    action_type: "sign_slip", action_payload: { slip_id: "s1" },
    read_at: null, created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: "n2", category: "calendar", title: "Schedule conflict detected",
    body: "Sophia has Soccer Practice and Piano Lesson overlapping on Thursday at 4 PM.",
    action_type: "view_calendar", action_payload: { date: isoDate(dd + 1, 16, 0) },
    read_at: null, created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "n3", category: "budget", title: "Weekly spending summary",
    body: "You spent $247.50 this week — $32 under budget. Great job!",
    action_type: null, action_payload: null,
    read_at: new Date(Date.now() - 7200000).toISOString(),
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
];

// ─── Consent ─────────────────────────────────────────────────────────────────

export const MOCK_CONSENT_STATUS: ConsentStatusResponse = {
  documents: [
    { document_type: "terms_of_service", current_version: "1.0.0", user_accepted_version: null, needs_acceptance: true },
    { document_type: "privacy_policy", current_version: "1.0.0", user_accepted_version: null, needs_acceptance: true },
    { document_type: "ai_disclosure", current_version: "1.0.0", user_accepted_version: null, needs_acceptance: true },
  ],
};

// ─── Chat History ────────────────────────────────────────────────────────────

export const MOCK_CHAT_RESPONSES: Record<string, ChatResponse[]> = {
  calendar_whiz: [
    {
      message_id: "cm1", agent_type: "calendar_whiz",
      content: "Good morning! Here's what's on your family's schedule today:\n\n🦷 **Dentist Appointment** — 10:00 AM (Mom)\n⚽ **Soccer Practice** — 3:30 PM (Sophia)\n🏊 **Swim Class** — 4:00 PM (Liam)\n🎲 **Family Game Night** — 7:00 PM\n\nHeads up — Sophia's soccer and Liam's swim overlap. Need help rescheduling?",
      intent_type: "status_query", model_used: null, tokens_used: null,
      quick_actions: [
        { label: "Reschedule conflict", action: "reschedule", payload: { event_ids: ["e1", "e3"] } },
        { label: "Add new event", action: "create_event" },
        { label: "View tomorrow", action: "list_events", payload: { date: "tomorrow" } },
      ],
    },
  ],
  grocery_guru: [
    {
      message_id: "cm2", agent_type: "grocery_guru",
      content: "I've added **milk** to your grocery list! 🥛\n\nYour current list has 8 items. Want me to suggest a meal plan for the week based on what you have?",
      intent_type: "list_crud", model_used: null, tokens_used: null,
      quick_actions: [
        { label: "View full list", action: "get_list" },
        { label: "Plan meals", action: "meal_plan" },
        { label: "Clear checked items", action: "clear_checked" },
      ],
    },
  ],
  budget_buddy: [
    {
      message_id: "cm3", agent_type: "budget_buddy",
      content: "Here's your spending this month:\n\n🛒 **Groceries** — $482.30\n⛽ **Gas** — $156.00\n🍽️ **Dining Out** — $124.50\n📚 **Education** — $89.00\n\nTotal: **$851.80** of $1,200 budget.\nYou're on track! 🎯",
      intent_type: "payment_query", model_used: null, tokens_used: null,
      quick_actions: [
        { label: "Scan receipt", action: "scan_receipt" },
        { label: "View recurring", action: "get_recurring" },
        { label: "Savings tips", action: "savings_tips" },
      ],
    },
  ],
  school_event_hub: [
    {
      message_id: "cm4", agent_type: "school_event_hub",
      content: "📋 **Pending Items:**\n\n1. **Science Museum Field Trip** — Permission slip due Friday ($15 fee)\n2. **Spring Concert** — March 28, 6:00 PM\n3. **Book Fair** — Next week (volunteer slots open)\n\nWould you like to sign the field trip slip now?",
      intent_type: "status_query", model_used: null, tokens_used: null,
      quick_actions: [
        { label: "Sign field trip slip", action: "sign_slip", payload: { slip_id: "s1" } },
        { label: "Add to calendar", action: "create_event" },
        { label: "View all events", action: "list_events" },
      ],
    },
  ],
};
