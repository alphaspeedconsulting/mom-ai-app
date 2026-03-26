/**
 * API Contract Types — Mom.alpha
 *
 * This file is the single source of truth for all request/response shapes
 * between the Next.js frontend and the FastAPI backend.
 *
 * Both Phase 2 (backend) and Phase 3 (frontend) import from this file.
 * Changes here must be coordinated across both.
 */

// =============================================================================
// Common Types
// =============================================================================

export type AgentType =
  | "calendar_whiz"
  | "grocery_guru"
  | "budget_buddy"
  | "school_event_hub"
  | "tutor_finder"
  | "health_hub"
  | "sleep_tracker"
  | "self_care_reminder";

export type SubscriptionTier = "trial" | "family" | "family_pro";
export type ParentBrand = "mom" | "dad" | "neutral";
export type HouseholdRole = "admin" | "member";
export type HouseholdMembershipStatus = "none" | "pending_invite" | "active";

export type IntentType =
  | "calendar_crud"
  | "list_crud"
  | "reminder_set"
  | "status_query"
  | "streak_log"
  | "payment_query"
  | "filter_search"
  | "intelligent";

export type TaskStatus = "pending" | "in_progress" | "completed" | "failed";

export type ConsentDocumentType =
  | "terms_of_service"
  | "privacy_policy"
  | "ai_disclosure";

export type CalendarSource = "internal" | "google" | "apple" | "school";

// =============================================================================
// Auth — JWT Claims
// =============================================================================

export interface JWTClaims {
  sub: string; // user_id (UUID)
  household_id: string; // household UUID
  tier: SubscriptionTier;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

// =============================================================================
// Auth — Login / Signup
// =============================================================================

export interface AuthGoogleRequest {
  id_token: string; // Google OAuth ID token
}

export interface AuthEmailRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: "bearer";
  user: {
    id: string;
    email: string;
    name: string;
    household_id: string | null; // null if first login (needs onboarding)
    tier: SubscriptionTier;
    consent_current: boolean; // true if all consents are up-to-date
    parent_brand?: ParentBrand;
    household_role?: HouseholdRole | null;
    household_membership_status?: HouseholdMembershipStatus;
  };
}

// =============================================================================
// Consent API — POST /api/consent
// =============================================================================

export interface ConsentRequest {
  consents: Array<{
    document_type: ConsentDocumentType;
    document_version: string;
    document_hash: string; // SHA-256 of document content
  }>;
}

export interface ConsentResponse {
  recorded: number; // number of consent records created
  all_accepted: boolean;
}

export interface ConsentStatusResponse {
  documents: Array<{
    document_type: ConsentDocumentType;
    current_version: string;
    user_accepted_version: string | null;
    needs_acceptance: boolean;
  }>;
}

// =============================================================================
// Chat API — POST /api/chat
// =============================================================================

export interface ChatRequest {
  household_id: string;
  agent_type: AgentType;
  message: string;
  media_urls?: string[];
}

export interface ChatResponse {
  message_id: string;
  agent_type: AgentType;
  content: string;
  intent_type: IntentType;
  model_used: string | null; // null for deterministic ops
  tokens_used: number | null;
  quick_actions?: QuickAction[];
  task_id?: string; // if a background task was created
}

export interface QuickAction {
  label: string;
  action: string; // e.g., "add_to_list", "create_event", "scan_receipt"
  payload?: Record<string, unknown>;
}

// =============================================================================
// Budget API — GET /api/budget/{household_id}
// =============================================================================

export interface BudgetResponse {
  household_id: string;
  used: number;
  limit: number;
  remaining: number;
  period_start: string; // ISO date
  period_end: string;
  is_over_budget: boolean;
  tier: SubscriptionTier;
}

// =============================================================================
// Calendar API — /api/calendar
// =============================================================================

export interface CalendarEvent {
  id: string;
  household_id: string;
  member_id: string | null;
  title: string;
  description: string | null;
  start_at: string; // ISO datetime
  end_at: string;
  all_day: boolean;
  source: CalendarSource;
  external_id: string | null;
  member_name: string | null;
  member_color: string | null;
  metadata: Record<string, unknown>;
}

export interface CalendarEventCreateRequest {
  title: string;
  description?: string;
  start_at: string;
  end_at: string;
  all_day?: boolean;
  member_id?: string;
}

export interface CalendarEventUpdateRequest {
  title?: string;
  description?: string;
  start_at?: string;
  end_at?: string;
  all_day?: boolean;
  member_id?: string;
}

export interface CalendarEventsResponse {
  events: CalendarEvent[];
  total: number;
}

// =============================================================================
// Agent Marketplace — GET /api/agents
// =============================================================================

export interface AgentCard {
  agent_type: AgentType;
  name: string;
  description: string;
  category: string;
  icon: string; // Material Symbols icon name
  is_active: boolean;
  is_available: boolean; // false if tier doesn't include it
  required_tier: SubscriptionTier;
  capabilities: string[];
}

export interface AgentToggleRequest {
  agent_type: AgentType;
  is_active: boolean;
}

export interface AgentListResponse {
  agents: AgentCard[];
}

// =============================================================================
// Tasks API — GET /api/tasks
// =============================================================================

export interface TaskItem {
  id: string;
  household_id: string;
  agent_type: AgentType;
  title: string | null;
  status: TaskStatus;
  progress_pct: number;
  steps: TaskStep[];
  created_at: string;
  updated_at: string;
}

export interface TaskStep {
  label: string;
  status: "pending" | "in_progress" | "completed";
}

export interface TaskListResponse {
  tasks: TaskItem[];
  active_count: number;
  completed_today: number;
}

// =============================================================================
// Household / Family API
// =============================================================================

export interface Household {
  id: string;
  name: string;
  tier: SubscriptionTier;
  trial_expires_at: string | null;
  members: FamilyMember[];
}

export interface FamilyMember {
  id: string;
  name: string;
  age: number | null;
  photo_url: string | null;
  tags: string[];
  color: string;
  role?: "parent" | "child";
  parent_brand?: ParentBrand | null;
  household_role?: HouseholdRole | null;
  operator_id?: string | null;
}

export interface HouseholdCreateRequest {
  name: string;
  members: Array<{
    name: string;
    age?: number;
    tags?: string[];
    color?: string;
  }>;
}

export interface HouseholdInviteRequest {
  email: string;
  parent_brand?: ParentBrand;
  role?: Exclude<HouseholdRole, "admin">;
}

export interface HouseholdInviteResponse {
  household_id: string;
  invite_token: string;
  expires_at: string;
  invited_email: string;
}

export interface JoinHouseholdRequest {
  invite_token: string;
}

export interface HouseholdMember {
  operator_id: string;
  name: string;
  email?: string | null;
  role: HouseholdRole;
  parent_brand?: ParentBrand | null;
  membership_status: HouseholdMembershipStatus;
}

export interface HouseholdMembersResponse {
  household_id: string;
  members: HouseholdMember[];
}

export interface SyncDigestItem {
  id: string;
  category: "calendar" | "tasks" | "expenses" | "school" | "general";
  summary: string;
  created_at: string;
}

export interface SyncDigestResponse {
  household_id: string;
  generated_at: string;
  items: SyncDigestItem[];
}

export interface HouseholdUsageDashboard {
  household_id: string;
  period: string; // e.g. "2026-03"
  calls_used: number;
  calls_limit: number;
  usage_pct: number;
  is_soft_capped: boolean;
  model_override: string | null;
  by_agent: Record<string, number>;
  by_model: Record<string, number>;
}

// =============================================================================
// Expenses API — GET /api/expenses/{household_id}
// =============================================================================

export interface Expense {
  id: string;
  amount: number;
  category: string;
  merchant: string | null;
  date: string; // ISO date
  receipt_url: string | null;
  source: "manual" | "ocr" | "recurring";
}

export interface ExpenseSummary {
  total_month: number;
  by_category: Record<string, number>;
  recurring_total: number;
  trend: "up" | "down" | "stable";
}

// =============================================================================
// Notifications API
// =============================================================================

export interface NotificationItem {
  id: string;
  category: string;
  title: string;
  body: string;
  action_type: string | null;
  action_payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
}

export interface NotificationsResponse {
  notifications: NotificationItem[];
  unread_count: number;
}

// =============================================================================
// Lists API
// =============================================================================

export interface ListItem {
  id: string;
  text: string;
  checked: boolean;
  added_at: string;
}

export interface GroceryList {
  id: string;
  name: string;
  items: ListItem[];
  agent_type: AgentType;
  updated_at: string;
}

// =============================================================================
// Permission Slips API
// =============================================================================

export interface PermissionSlip {
  id: string;
  title: string;
  description: string | null;
  status: "pending" | "signed" | "expired" | "declined";
  due_date: string | null;
  fee_amount: number | null;
  signed_at: string | null;
}

// =============================================================================
// Wellness Streaks API
// =============================================================================

export interface WellnessStreak {
  id: string;
  member_id: string | null;
  member_name: string | null;
  streak_type: string;
  current_streak: number;
  longest_streak: number;
  dates: string[]; // ISO dates
}

// =============================================================================
// Sleep Tracker API
// =============================================================================

export interface SleepEntry {
  id: string;
  household_id: string;
  member_id: string | null;
  member_name: string | null;
  sleep_at: string; // ISO datetime (bedtime)
  wake_at: string; // ISO datetime (wake time)
  quality: "great" | "good" | "fair" | "poor";
  notes: string | null;
  duration_hours: number;
  created_at: string;
}

export interface SleepLogRequest {
  member_id?: string;
  sleep_at: string;
  wake_at: string;
  quality: "great" | "good" | "fair" | "poor";
  notes?: string;
}

export interface SleepHistoryResponse {
  entries: SleepEntry[];
  avg_duration_hours: number;
  avg_quality_score: number; // 1-4 (poor-great)
  weekly_pattern: Record<string, number>; // day-of-week → avg hours
}

// =============================================================================
// Self-Care Reminder API
// =============================================================================

export interface SelfCareReminder {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  category: "relaxation" | "exercise" | "social" | "hobby" | "rest" | "custom";
  remind_at: string; // ISO datetime
  recurring: boolean;
  recurrence_days: number[] | null; // 0=Sun, 1=Mon, ..., 6=Sat
  snoozed_until: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface SelfCareCreateRequest {
  title: string;
  description?: string;
  category: SelfCareReminder["category"];
  remind_at: string;
  recurring?: boolean;
  recurrence_days?: number[];
}

export interface SelfCareListResponse {
  reminders: SelfCareReminder[];
  completed_today: number;
  streak_days: number; // consecutive days with at least 1 self-care activity
}

// =============================================================================
// Analytics Dashboard (Family Pro)
// =============================================================================

export interface AnalyticsDashboard {
  period: string; // "2026-03"
  agent_usage: Record<AgentType, number>; // agent → chat count
  spending_trend: Array<{ date: string; amount: number }>;
  schedule_density: Array<{ date: string; events: number }>;
  top_categories: Array<{ category: string; count: number }>;
  call_budget_usage_pct: number;
}

// =============================================================================
// WebSocket Protocol
// =============================================================================

export type WSMessageType =
  | "task_update"
  | "notification"
  | "budget_change"
  | "agent_status"
  | "typing";

export interface WSMessage {
  type: WSMessageType;
  payload: Record<string, unknown>;
  timestamp: string; // ISO datetime
}

// =============================================================================
// Stripe / Checkout API
// =============================================================================

export interface CheckoutTrialRequest {
  tier: "family" | "family_pro";
  billing_cycle?: "monthly" | "yearly";
  success_url: string;
  cancel_url: string;
  promotion_code?: string; // Optional beta invite / promo code
}

export interface CheckoutTrialResponse {
  checkout_url: string; // Stripe Checkout hosted page URL
  session_id: string;
}

// =============================================================================
// LLM Cost Monitoring (Admin)
// =============================================================================

export interface LLMCostReport {
  period: string;
  total_cost: number;
  by_model: Record<string, { calls: number; tokens: number; cost: number }>;
  distribution: {
    gemini_flash_pct: number;
    gpt4o_mini_pct: number;
    gpt4o_pct: number;
  };
  alert: boolean; // true if spend > 2x rolling average
}
