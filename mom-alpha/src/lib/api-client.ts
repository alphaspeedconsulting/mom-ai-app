/**
 * API Client — typed fetch wrapper for all Alpha.Mom backend endpoints.
 *
 * Reads JWT from auth store. All methods throw ApiError on non-2xx responses.
 * Base URL is configurable via NEXT_PUBLIC_API_URL env var.
 */

import type {
  AgentListResponse,
  AgentToggleRequest,
  AnalyticsDashboard,
  AuthEmailRequest,
  AuthGoogleRequest,
  AuthResponse,
  AutomationRoutine,
  AutomationRoutineCreateRequest,
  BudgetResponse,
  CalendarConflict,
  CalendarEventCreateRequest,
  CalendarEventUpdateRequest,
  CalendarEventsResponse,
  Checklist,
  ChatRequest,
  ChatResponse,
  CheckoutTrialRequest,
  CheckoutTrialResponse,
  ConsentRequest,
  ConsentResponse,
  ConsentStatusResponse,
  Expense,
  ExpenseSummary,
  GoogleCalendarConnectionStatus,
  GoogleCalendarListResponse,
  GroceryList,
  HomeProject,
  HomeProjectCreateRequest,
  Household,
  HouseholdCreateRequest,
  HouseholdInviteRequest,
  HouseholdInviteResponse,
  HouseholdMembersResponse,
  HouseholdUsageDashboard,
  JoinHouseholdRequest,
  LLMCostReport,
  NotificationsResponse,
  PermissionSlip,
  SelfCareCreateRequest,
  SelfCareListResponse,
  SelfCareReminder,
  SharedInboxCreateRequest,
  SharedInboxItem,
  SharedInboxListResponse,
  SharedInboxUpdateRequest,
  SyncDigestResponse,
  SleepHistoryResponse,
  SleepLogRequest,
  TaskListResponse,
  TripPlan,
  TripPlanCreateRequest,
  Vehicle,
  VehicleCreateRequest,
  VehicleServiceItem,
  VehicleServiceItemCreateRequest,
  WeeklyPlan,
  WellnessStreak,
} from "@/types/api-contracts";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000")
    : "http://localhost:8000";

// ---------------------------------------------------------------------------
// Error
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    public status: number,
    public detail: string,
  ) {
    super(detail);
    this.name = "ApiError";
  }
}

// ---------------------------------------------------------------------------
// Core fetch
// ---------------------------------------------------------------------------

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("mom-alpha-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.token ?? null;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  opts: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(opts.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...opts,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new ApiError(res.status, body.detail ?? res.statusText);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export const auth = {
  loginGoogle: (body: AuthGoogleRequest) =>
    request<AuthResponse>("/api/auth/google", {
      method: "POST",
      body: JSON.stringify({ ...body, parent_brand: "mom" }),
    }),

  loginEmail: (body: AuthEmailRequest) =>
    request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(body) }),

  signup: (body: AuthEmailRequest & { name: string }) =>
    request<AuthResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({ ...body, parent_brand: "mom" }),
    }),
};

// ---------------------------------------------------------------------------
// Consent
// ---------------------------------------------------------------------------

export const consent = {
  getStatus: () =>
    request<ConsentStatusResponse>("/api/consent/status"),

  accept: (body: ConsentRequest) =>
    request<ConsentResponse>("/api/consent", { method: "POST", body: JSON.stringify(body) }),

  history: () =>
    request<ConsentStatusResponse>("/api/consent/history"),
};

// ---------------------------------------------------------------------------
// Chat
// ---------------------------------------------------------------------------

export const chat = {
  send: (body: ChatRequest) =>
    request<ChatResponse>("/api/chat", { method: "POST", body: JSON.stringify(body) }),
};

// ---------------------------------------------------------------------------
// Calendar
// ---------------------------------------------------------------------------

export const calendar = {
  list: (params?: { start_after?: string; start_before?: string; member_id?: string }) => {
    const qs = new URLSearchParams();
    if (params?.start_after) qs.set("start_after", params.start_after);
    if (params?.start_before) qs.set("start_before", params.start_before);
    if (params?.member_id) qs.set("member_id", params.member_id);
    const q = qs.toString();
    return request<CalendarEventsResponse>(`/api/calendar${q ? `?${q}` : ""}`);
  },

  create: (body: CalendarEventCreateRequest) =>
    request<{ id: string }>("/api/calendar", { method: "POST", body: JSON.stringify(body) }),

  update: (eventId: string, body: CalendarEventUpdateRequest) =>
    request<{ id: string }>(`/api/calendar/${eventId}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (eventId: string) =>
    request<void>(`/api/calendar/${eventId}`, { method: "DELETE" }),

  syncGoogle: () =>
    request<{ synced: number }>("/api/calendar/sync/google", { method: "POST" }),

  conflicts: (householdId: string) =>
    request<CalendarConflict[]>(`/api/household/${householdId}/calendar-align`),
};

// ---------------------------------------------------------------------------
// Agents
// ---------------------------------------------------------------------------

export const agents = {
  list: () => request<AgentListResponse>("/api/agents"),

  toggle: (body: AgentToggleRequest) =>
    request<AgentListResponse>("/api/agents/toggle", { method: "PUT", body: JSON.stringify(body) }),
};

// ---------------------------------------------------------------------------
// Tasks
// ---------------------------------------------------------------------------

export const tasks = {
  list: () => request<TaskListResponse>("/api/tasks"),
};

// ---------------------------------------------------------------------------
// Budget / Call Budget
// ---------------------------------------------------------------------------

export const budget = {
  get: (householdId: string) =>
    request<BudgetResponse>(`/api/budget/${householdId}`),
};

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------

export const expenses = {
  list: (householdId: string) =>
    request<Expense[]>(`/api/expenses/${householdId}`),

  summary: (householdId: string) =>
    request<ExpenseSummary>(`/api/expenses/${householdId}/summary`),

  create: (householdId: string, body: Partial<Expense>) =>
    request<Expense>(`/api/expenses/${householdId}`, { method: "POST", body: JSON.stringify(body) }),

  uploadReceipt: async (householdId: string, file: File) => {
    const token = getToken();
    const form = new FormData();
    form.append("file", file);
    const res = await fetch(`${BASE_URL}/api/expenses/${householdId}/receipt`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: res.statusText }));
      throw new ApiError(res.status, body.detail ?? res.statusText);
    }
    return res.json() as Promise<Expense>;
  },
};

// ---------------------------------------------------------------------------
// Lists (Grocery, etc.)
// ---------------------------------------------------------------------------

export const lists = {
  get: (householdId: string, agentType: string) =>
    request<GroceryList>(`/api/lists/${householdId}?agent_type=${agentType}`),

  addItem: (householdId: string, agentType: string, text: string) =>
    request<GroceryList>(`/api/lists/${householdId}/items`, {
      method: "POST",
      body: JSON.stringify({ agent_type: agentType, text }),
    }),

  toggleItem: (householdId: string, itemId: string) =>
    request<GroceryList>(`/api/lists/${householdId}/items/${itemId}/toggle`, { method: "PUT" }),

  removeItem: (householdId: string, itemId: string) =>
    request<void>(`/api/lists/${householdId}/items/${itemId}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Permission Slips
// ---------------------------------------------------------------------------

export const slips = {
  list: (householdId: string) =>
    request<PermissionSlip[]>(`/api/slips/${householdId}`),

  sign: (slipId: string) =>
    request<PermissionSlip>(`/api/slips/${slipId}/sign`, { method: "POST" }),
};

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export const notifications = {
  list: () => request<NotificationsResponse>("/api/notifications"),

  markRead: (notificationId: string) =>
    request<void>(`/api/notifications/${notificationId}/read`, { method: "PUT" }),

  subscribePush: (subscription: PushSubscriptionJSON) =>
    request<void>("/api/notifications/push/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
    }),

  sendTestPush: () =>
    request<void>("/api/notifications/push/send", {
      method: "POST",
      body: JSON.stringify({ title: "Alpha.Mom Test", body: "Push notifications are working!" }),
    }),
};

// ---------------------------------------------------------------------------
// Household
// ---------------------------------------------------------------------------

export const household = {
  get: (householdId: string) =>
    request<Household>(`/api/household/${householdId}`),

  create: (body: HouseholdCreateRequest) =>
    request<Household>("/api/household", { method: "POST", body: JSON.stringify(body) }),

  invite: (householdId: string, body: HouseholdInviteRequest) =>
    request<HouseholdInviteResponse>(`/api/household/${householdId}/invite`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  join: (body: JoinHouseholdRequest) =>
    request<Household>("/api/household/join", { method: "POST", body: JSON.stringify(body) }),

  listMembers: (householdId: string) =>
    request<HouseholdMembersResponse>(`/api/household/${householdId}/members`),

  syncDigest: (householdId: string) =>
    request<SyncDigestResponse>(`/api/household/${householdId}/sync-digest`),

  weeklyPlan: (householdId: string) =>
    request<WeeklyPlan>(`/api/household/${householdId}/weekly-plan`),

  usageDashboard: (householdId: string) =>
    request<HouseholdUsageDashboard>(`/api/household/${householdId}/usage`),

  generateChecklist: (householdId: string, activityType: string) =>
    request<Checklist>(`/api/household/${householdId}/checklist`, {
      method: "POST", body: JSON.stringify({ activity_type: activityType }),
    }),

  listChecklists: (householdId: string) =>
    request<Checklist[]>(`/api/household/${householdId}/checklists`),
};

// ---------------------------------------------------------------------------
// Wellness Streaks
// ---------------------------------------------------------------------------

export const wellness = {
  getStreaks: (householdId: string) =>
    request<WellnessStreak[]>(`/api/wellness/${householdId}/streaks`),

  logStreak: (householdId: string, streakType: string, memberId?: string) =>
    request<WellnessStreak>(`/api/wellness/${householdId}/streaks/log`, {
      method: "POST",
      body: JSON.stringify({ streak_type: streakType, member_id: memberId }),
    }),
};

// ---------------------------------------------------------------------------
// Stripe / Checkout
// ---------------------------------------------------------------------------

export const stripe = {
  createCheckout: (body: CheckoutTrialRequest) =>
    request<CheckoutTrialResponse>("/api/stripe/checkout", { method: "POST", body: JSON.stringify(body) }),

  getPortalUrl: () =>
    request<{ url: string }>("/api/stripe/portal"),
};

// ---------------------------------------------------------------------------
// Sleep Tracker
// ---------------------------------------------------------------------------

export const sleep = {
  log: (householdId: string, body: SleepLogRequest) =>
    request<SleepHistoryResponse>(`/api/sleep/${householdId}/log`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  history: (householdId: string, days?: number) =>
    request<SleepHistoryResponse>(
      `/api/sleep/${householdId}${days ? `?days=${days}` : ""}`
    ),
};

// ---------------------------------------------------------------------------
// Self-Care Reminders
// ---------------------------------------------------------------------------

export const selfCare = {
  list: (householdId: string) =>
    request<SelfCareListResponse>(`/api/self-care/${householdId}`),

  create: (householdId: string, body: SelfCareCreateRequest) =>
    request<SelfCareReminder>(`/api/self-care/${householdId}`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  complete: (householdId: string, reminderId: string) =>
    request<SelfCareReminder>(
      `/api/self-care/${householdId}/${reminderId}/complete`,
      { method: "POST" }
    ),

  snooze: (householdId: string, reminderId: string, minutes: number) =>
    request<SelfCareReminder>(
      `/api/self-care/${householdId}/${reminderId}/snooze`,
      { method: "POST", body: JSON.stringify({ minutes }) }
    ),
};

// ---------------------------------------------------------------------------
// Household Ops — vehicles, home projects, trips, routines (Family Pro)
// ---------------------------------------------------------------------------

export const householdOps = {
  // Vehicles
  listVehicles: (householdId: string) =>
    request<Vehicle[]>(`/api/household/${householdId}/vehicles`),
  createVehicle: (householdId: string, body: VehicleCreateRequest) =>
    request<Vehicle>(`/api/household/${householdId}/vehicles`, {
      method: "POST", body: JSON.stringify(body),
    }),
  updateVehicle: (householdId: string, vehicleId: string, body: Partial<VehicleCreateRequest>) =>
    request<Vehicle>(`/api/household/${householdId}/vehicles/${vehicleId}`, {
      method: "PUT", body: JSON.stringify(body),
    }),
  deleteVehicle: (householdId: string, vehicleId: string) =>
    request<void>(`/api/household/${householdId}/vehicles/${vehicleId}`, { method: "DELETE" }),
  listServiceItems: (householdId: string, vehicleId: string) =>
    request<VehicleServiceItem[]>(`/api/household/${householdId}/vehicles/${vehicleId}/service`),
  createServiceItem: (householdId: string, vehicleId: string, body: VehicleServiceItemCreateRequest) =>
    request<VehicleServiceItem>(`/api/household/${householdId}/vehicles/${vehicleId}/service`, {
      method: "POST", body: JSON.stringify(body),
    }),

  // Home projects
  listProjects: (householdId: string) =>
    request<HomeProject[]>(`/api/household/${householdId}/projects`),
  createProject: (householdId: string, body: HomeProjectCreateRequest) =>
    request<HomeProject>(`/api/household/${householdId}/projects`, {
      method: "POST", body: JSON.stringify(body),
    }),
  updateProject: (householdId: string, projectId: string, body: Partial<HomeProjectCreateRequest>) =>
    request<HomeProject>(`/api/household/${householdId}/projects/${projectId}`, {
      method: "PUT", body: JSON.stringify(body),
    }),
  deleteProject: (householdId: string, projectId: string) =>
    request<void>(`/api/household/${householdId}/projects/${projectId}`, { method: "DELETE" }),

  // Trips
  listTrips: (householdId: string) =>
    request<TripPlan[]>(`/api/household/${householdId}/trips`),
  createTrip: (householdId: string, body: TripPlanCreateRequest) =>
    request<TripPlan>(`/api/household/${householdId}/trips`, {
      method: "POST", body: JSON.stringify(body),
    }),
  updateTrip: (householdId: string, tripId: string, body: Partial<TripPlanCreateRequest>) =>
    request<TripPlan>(`/api/household/${householdId}/trips/${tripId}`, {
      method: "PUT", body: JSON.stringify(body),
    }),
  deleteTrip: (householdId: string, tripId: string) =>
    request<void>(`/api/household/${householdId}/trips/${tripId}`, { method: "DELETE" }),

  // Routines
  listRoutines: (householdId: string) =>
    request<AutomationRoutine[]>(`/api/household/${householdId}/routines`),
  createRoutine: (householdId: string, body: AutomationRoutineCreateRequest) =>
    request<AutomationRoutine>(`/api/household/${householdId}/routines`, {
      method: "POST", body: JSON.stringify(body),
    }),
  updateRoutine: (householdId: string, routineId: string, body: Partial<AutomationRoutineCreateRequest>) =>
    request<AutomationRoutine>(`/api/household/${householdId}/routines/${routineId}`, {
      method: "PUT", body: JSON.stringify(body),
    }),
  deleteRoutine: (householdId: string, routineId: string) =>
    request<void>(`/api/household/${householdId}/routines/${routineId}`, { method: "DELETE" }),
};

// ---------------------------------------------------------------------------
// Google Calendar OAuth
// ---------------------------------------------------------------------------

export const googleCalendar = {
  connectionStatus: () =>
    request<GoogleCalendarConnectionStatus>("/api/integrations/google-calendar/status"),
  connect: (redirectUri: string) =>
    request<{ auth_url: string }>("/api/integrations/google-calendar/connect", {
      method: "POST", body: JSON.stringify({ redirect_uri: redirectUri }),
    }),
  disconnect: () =>
    request<void>("/api/integrations/google-calendar/disconnect", { method: "POST" }),
  listCalendars: () =>
    request<GoogleCalendarListResponse>("/api/integrations/google-calendar/calendars"),
  selectCalendars: (calendar_ids: string[]) =>
    request<void>("/api/integrations/google-calendar/calendars/select", {
      method: "POST", body: JSON.stringify({ calendar_ids }),
    }),
};

// ---------------------------------------------------------------------------
// Analytics (Family Pro)
// ---------------------------------------------------------------------------

export const analytics = {
  dashboard: (householdId: string, period?: string) =>
    request<AnalyticsDashboard>(
      `/api/analytics/${householdId}${period ? `?period=${period}` : ""}`
    ),
};

// ---------------------------------------------------------------------------
// Admin
// ---------------------------------------------------------------------------

export const admin = {
  llmCosts: (period?: string) =>
    request<LLMCostReport>(`/api/admin/llm-costs${period ? `?period=${period}` : ""}`),
};

// ---------------------------------------------------------------------------
// Shared Inbox — Co-parent task sharing
// ---------------------------------------------------------------------------

export const sharedInbox = {
  list: (householdId: string) =>
    request<SharedInboxListResponse>(`/api/household/${householdId}/inbox`),

  create: (householdId: string, body: SharedInboxCreateRequest) =>
    request<SharedInboxItem>(`/api/household/${householdId}/inbox`, {
      method: "POST",
      body: JSON.stringify(body),
    }),

  update: (householdId: string, itemId: string, body: SharedInboxUpdateRequest) =>
    request<SharedInboxItem>(`/api/household/${householdId}/inbox/${itemId}`, {
      method: "PUT",
      body: JSON.stringify(body),
    }),

  delete: (householdId: string, itemId: string) =>
    request<void>(`/api/household/${householdId}/inbox/${itemId}`, { method: "DELETE" }),
};
