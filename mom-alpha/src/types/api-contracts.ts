/**
 * API Contract Types — Alpha.Mom
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

export interface AuthSignupRequest {
  email: string;
  password: string;
  name: string;
  promotion_code?: string;
}

// =============================================================================
// Stripe — Promotion Code Validation
// =============================================================================

export interface PromotionValidateResponse {
  valid: boolean;
  percent_off: number | null;
  amount_off: number | null;   // in cents
  duration: string | null;     // "once" | "repeating" | "forever"
  name: string | null;         // coupon display name
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
  /** On-device memory context injected from local memory store */
  memory_context?: MemoryContextItem[];
  /** Recent conversation history so the backend has multi-turn context */
  chat_history?: ChatHistoryItem[];
}

export interface ChatHistoryItem {
  role: "user" | "agent";
  content: string;
}

/** Lightweight memory item sent alongside chat messages for agent context */
export interface MemoryContextItem {
  category: string;
  content: string;
  pinned: boolean;
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
  /** Optional memory hints extracted by backend for local storage */
  memory_hints?: Array<{ category: string; content: string }>;
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
  starter_prompts: string[];
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
  category: "calendar" | "tasks" | "expenses" | "school" | "general" | "household_ops";
  summary: string;
  source?: "household_ops";
  ops_type?: "garage" | "home" | "trip" | "routine";
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
// Checklists API
// =============================================================================

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface Checklist {
  id: string;
  household_id: string;
  title: string;
  activity_type: string;
  items: ChecklistItem[];
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Weekly Plan API
// =============================================================================

export interface WeeklyPlanDay {
  date: string;
  events: Array<{ time: string; title: string; who: string }>;
}

export interface WeeklyPlan {
  household_id: string;
  week_start: string;
  days: WeeklyPlanDay[];
  generated_at: string;
}

// =============================================================================
// Calendar Conflicts API
// =============================================================================

export interface CalendarConflict {
  id: string;
  event_a: { title: string; time: string; parent: string };
  event_b: { title: string; time: string; parent: string };
  date: string;
  severity: "overlap" | "tight" | "logistics";
}

// =============================================================================
// Household Ops — Vehicles
// =============================================================================

export interface Vehicle {
  id: string;
  household_id: string;
  nickname: string;
  make: string | null;
  model: string | null;
  year: number | null;
  vin: string | null;
  current_mileage: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface VehicleCreateRequest {
  nickname: string;
  make?: string;
  model?: string;
  year?: number;
  vin?: string;
  current_mileage?: number;
  notes?: string;
}

export interface VehicleServiceItem {
  id: string;
  vehicle_id: string;
  service_type: string;
  last_performed_at: string | null;
  last_performed_mileage: number | null;
  next_due_at: string | null;
  next_due_mileage: number | null;
  notes: string | null;
  created_at: string;
}

export interface VehicleServiceItemCreateRequest {
  service_type: string;
  last_performed_at?: string;
  last_performed_mileage?: number;
  next_due_at?: string;
  next_due_mileage?: number;
  notes?: string;
}

// =============================================================================
// Household Ops — Home Projects
// =============================================================================

export type HomeProjectStatus = "planned" | "in_progress" | "completed" | "on_hold";
export type HomeProjectArea = "interior" | "exterior" | "yard" | "other";

export interface HomeProject {
  id: string;
  household_id: string;
  title: string;
  description: string | null;
  status: HomeProjectStatus;
  estimated_cost: number | null;
  area: HomeProjectArea;
  checklist_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface HomeProjectCreateRequest {
  title: string;
  description?: string;
  status?: HomeProjectStatus;
  estimated_cost?: number;
  area?: HomeProjectArea;
}

// =============================================================================
// Household Ops — Trips
// =============================================================================

export type TripStatus = "planning" | "booked" | "completed" | "cancelled";

export interface TripPlan {
  id: string;
  household_id: string;
  destination: string;
  start_date: string | null;
  end_date: string | null;
  estimated_budget: number | null;
  packing_checklist_id: string | null;
  notes: string | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface TripPlanCreateRequest {
  destination: string;
  start_date?: string;
  end_date?: string;
  estimated_budget?: number;
  notes?: string;
}

// =============================================================================
// Household Ops — Automation Routines
// =============================================================================

export type RoutineTriggerType = "time" | "checklist" | "reminder";

export interface RoutineStep {
  id: string;
  label: string;
  trigger_type: RoutineTriggerType;
  trigger_value: string | null;
  order: number;
}

export interface AutomationRoutine {
  id: string;
  household_id: string;
  name: string;
  steps: RoutineStep[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AutomationRoutineCreateRequest {
  name: string;
  steps?: Array<{
    label: string;
    trigger_type: RoutineTriggerType;
    trigger_value?: string;
    order: number;
  }>;
}

// =============================================================================
// Google Calendar Integration
// =============================================================================

export interface GoogleCalendarConnectionStatus {
  connected: boolean;
  email: string | null;
  scopes: string[];
  connected_at: string | null;
}

export interface GoogleCalendarItem {
  id: string;
  summary: string;          // calendar name
  description?: string | null;
  background_color?: string | null;
  foreground_color?: string | null;
  primary: boolean;
  selected: boolean;        // currently synced by Alpha.Mom
}

export interface GoogleCalendarListResponse {
  calendars: GoogleCalendarItem[];
}

export interface GoogleCalendarSelectRequest {
  calendar_ids: string[];   // IDs to sync; omitted calendars are unselected
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

// =============================================================================
// Shared Inbox API — Co-parent task sharing
// =============================================================================

export type SharedInboxStatus = "captured" | "delegated" | "in_progress" | "done" | "dismissed";

export interface SharedInboxItem {
  id: string;
  household_id: string;
  content: string;
  assigned_agent?: AgentType;
  assigned_to?: string;            // operator_id of assigned parent
  created_by: string;              // operator_id of creator
  created_by_name: string;         // display name
  status: SharedInboxStatus;
  agent_response?: string;
  created_at: string;
  updated_at: string;
}

export interface SharedInboxCreateRequest {
  content: string;
  assigned_agent?: AgentType;
  assigned_to?: string;            // operator_id — assign to co-parent
}

export interface SharedInboxUpdateRequest {
  status?: SharedInboxStatus;
  assigned_agent?: AgentType;
  assigned_to?: string;
  content?: string;
  agent_response?: string;
}

export interface SharedInboxListResponse {
  items: SharedInboxItem[];
  active_count: number;
  completed_count: number;
}

// =============================================================================
// Weekly Wins — Shareable family accomplishment summary
// =============================================================================

export interface WeeklyWinSummary {
  household_id: string;
  week_start: string;
  week_end: string;
  meals_planned: number;
  dollars_saved: number;
  events_managed: number;
  tasks_completed: number;
  agent_interactions: number;
  top_agent: AgentType;
  streak_days: number;
  personal_highlight: string;
}

// =============================================================================
// Share Links — Deep links for sharing items externally
// =============================================================================

export type ShareableItemType = "grocery_list" | "calendar_event" | "task" | "win_card";

export interface ShareLinkRequest {
  item_type: ShareableItemType;
  item_id: string;
}

export interface ShareLinkResponse {
  share_url: string;
  share_token: string;
  expires_at: string;
}

export interface SharePreviewResponse {
  item_type: ShareableItemType;
  title: string;
  preview_data: Record<string, unknown>;
  household_name: string;
  sharer_name: string;
}

// =============================================================================
// Viral Analytics — Event tracking for growth metrics
// =============================================================================

export type ViralEventType =
  | "share_win_card"
  | "share_link"
  | "referral_send"
  | "caregiver_invite"
  | "template_share"
  | "emergency_activate";

export interface ViralEvent {
  event_type: ViralEventType;
  metadata: Record<string, unknown>;
}

// =============================================================================
// Co-Parent Balance — Task split tracking
// =============================================================================

export interface CoParentBalanceParent {
  name: string;
  operator_id: string;
  tasks_completed: number;
  pct: number;
}

export interface CoParentBalance {
  household_id: string;
  period: string;
  parent_a: CoParentBalanceParent;
  parent_b: CoParentBalanceParent | null;
  by_category: Array<{ category: string; parent_a_pct: number; parent_b_pct: number }>;
  weekly_trend: Array<{ week: string; parent_a_pct: number; parent_b_pct: number }>;
}

// =============================================================================
// Referral Engine — Viral growth loop
// =============================================================================

export interface ReferralInfo {
  referral_code: string;
  referral_url: string;
  friends_invited: number;
  friends_joined: number;
  reward_weeks_earned: number;
  reward_weeks_used: number;
}

export interface ReferralRedeemRequest {
  referral_code: string;
}

export interface ReferralRedeemResponse {
  success: boolean;
  reward_weeks: number;
  message: string;
}

// =============================================================================
// Caregiver Mode — Limited access for babysitters, grandparents, nannies
// =============================================================================

export type CaregiverRole = "babysitter" | "grandparent" | "nanny" | "other";

export type CaregiverPermission =
  | "calendar"
  | "emergency"
  | "allergies"
  | "medications"
  | "routines";

export interface CaregiverAccess {
  id: string;
  name: string;
  email: string;
  role: CaregiverRole;
  permissions: CaregiverPermission[];
  active: boolean;
  created_at: string;
  last_accessed_at: string | null;
}

export interface CaregiverInviteRequest {
  name: string;
  email: string;
  role: CaregiverRole;
  permissions: CaregiverPermission[];
}

export interface CaregiverViewData {
  household_name: string;
  today_schedule: CalendarEvent[];
  emergency_contacts: Array<{ name: string; phone: string; relationship: string }>;
  allergies: string[];
  medications: Array<{ member: string; medication: string; schedule: string }>;
  routines: Array<{ time: string; description: string }>;
  family_members: Array<{ name: string; age: number | null }>;
}

// =============================================================================
// Family Templates Marketplace — User-generated content flywheel
// =============================================================================

export type TemplateCategory =
  | "routine"
  | "meal_plan"
  | "chore_chart"
  | "school_prep"
  | "bedtime"
  | "budget"
  | "other";

export interface TemplateItem {
  label: string;
  time?: string;
  day?: string;
  order: number;
}

export interface FamilyTemplate {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  author_name: string;
  uses_count: number;
  rating: number;
  items: TemplateItem[];
  tags: string[];
  created_at: string;
}

export interface TemplateCreateRequest {
  title: string;
  description: string;
  category: TemplateCategory;
  items: TemplateItem[];
  tags: string[];
}

export interface TemplateListResponse {
  templates: FamilyTemplate[];
  total: number;
}

// =============================================================================
// Seasonal Intelligence Packs — Timely, shareable content
// =============================================================================

export interface SeasonalChecklistItem {
  text: string;
  agent_type?: AgentType;
}

export interface SeasonalPack {
  id: string;
  title: string;
  description: string;
  season: string;
  icon: string;
  checklist_items: SeasonalChecklistItem[];
  available_from: string;
  available_until: string;
}

export interface SeasonalPacksResponse {
  packs: SeasonalPack[];
}

// =============================================================================
// Family Goals — Gamified household progress
// =============================================================================

export type GoalType = "savings" | "meals" | "exercise" | "sleep" | "tasks" | "custom";

export interface FamilyGoal {
  id: string;
  household_id: string;
  title: string;
  goal_type: GoalType;
  target_value: number;
  current_value: number;
  unit: string;
  period: "weekly" | "monthly";
  created_at: string;
  completed_at: string | null;
}

export interface GoalCreateRequest {
  title: string;
  goal_type: GoalType;
  target_value: number;
  unit: string;
  period: "weekly" | "monthly";
}

export interface GoalUpdateRequest {
  current_value?: number;
  title?: string;
  target_value?: number;
}

// =============================================================================
// Voice Morning Briefing
// =============================================================================

export interface VoiceBriefScript {
  text: string;
  generated_at: string;
}

// =============================================================================
// Emergency Mode — "I'm Sick" delegation
// =============================================================================

export interface EmergencyActivateRequest {
  duration_days: number;
  message_to_coparent?: string;
}

export interface EmergencyStatus {
  active: boolean;
  activated_at: string | null;
  deactivates_at: string | null;
  delegated_tasks: number;
  cancelled_events: number;
  notified_coparent: boolean;
}

// =============================================================================
// Mom's Village — Community Feed
// =============================================================================

export type VillagePostCategory =
  | "tip"
  | "meal_idea"
  | "school_hack"
  | "activity"
  | "vent"
  | "win"
  | "question";

export interface VillagePost {
  id: string;
  author_name: string;
  author_avatar_seed: string;
  category: VillagePostCategory;
  content: string;
  kids_ages?: number[];
  location?: string;
  reactions: {
    heart: number;
    helpful: number;
    same: number;
  };
  user_reaction?: "heart" | "helpful" | "same" | null;
  comment_count: number;
  reported: boolean;
  created_at: string;
}

export interface VillageComment {
  id: string;
  post_id: string;
  author_name: string;
  content: string;
  created_at: string;
}

export interface VillagePostCreateRequest {
  category: VillagePostCategory;
  content: string;
  kids_ages?: number[];
}

export interface VillageFeedResponse {
  posts: VillagePost[];
  total: number;
  next_cursor: string | null;
}
