"use client";

import { useState, useCallback } from "react";
import { useHouseholdStore } from "@/stores/household-store";
import { useAuthStore } from "@/stores/auth-store";
import { ApiError } from "@/lib/api-client";
import * as api from "@/lib/api-client";

const MEMBER_COLORS = [
  "#32695a", "#7c4daa", "#d4855a", "#4a90d9", "#c45e6a", "#5a9c5a",
];

interface MemberDraft {
  name: string;
  age: string;
  role: "parent" | "child";
  color: string;
}

function emptyMember(index: number): MemberDraft {
  return { name: "", age: "", role: "child", color: MEMBER_COLORS[index % MEMBER_COLORS.length] };
}

type Step = 1 | 2 | 3 | 4;

export default function HouseholdOnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [householdName, setHouseholdName] = useState("");
  const [members, setMembers] = useState<MemberDraft[]>([emptyMember(0)]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteSent, setInviteSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [createdHouseholdId, setCreatedHouseholdId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const createHousehold = useHouseholdStore((s) => s.createHousehold);
  const isLoading = useHouseholdStore((s) => s.isLoading);
  const updateUser = useAuthStore((s) => s.updateUser);

  // ---------------------------------------------------------------------------
  // Step 1 → 2: just advance
  // ---------------------------------------------------------------------------
  const handleStep1Next = () => setStep(2);

  // ---------------------------------------------------------------------------
  // Step 2 → 3: create household with members
  // ---------------------------------------------------------------------------
  const handleStep2Next = async () => {
    setSubmitError(null);
    const membersPayload = members
      .filter((m) => m.name.trim())
      .map((m) => ({
        name: m.name.trim(),
        age: m.age ? parseInt(m.age, 10) : undefined,
        color: m.color,
        tags: [m.role],
      }));

    const result = await createHousehold(householdName.trim(), membersPayload);
    if (!result) {
      setSubmitError("Could not create your household. Please try again.");
      return;
    }
    setCreatedHouseholdId(result.id);
    updateUser({ household_id: result.id, household_role: "admin" } as Parameters<typeof updateUser>[0]);
    setStep(3);
  };

  // ---------------------------------------------------------------------------
  // Step 3: invite co-parent
  // ---------------------------------------------------------------------------
  const handleInvite = async () => {
    if (!inviteEmail.trim() || !createdHouseholdId) return;
    setInviteError(null);
    setIsSending(true);
    try {
      await api.household.invite(createdHouseholdId, { email: inviteEmail.trim() });
      setInviteSent(true);
    } catch (error) {
      if (error instanceof ApiError) {
        setInviteError(error.detail);
      } else {
        setInviteError("Could not send invite. You can do this from settings later.");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleStep3Next = () => setStep(4);

  // ---------------------------------------------------------------------------
  // Step 4: go to dashboard
  // ---------------------------------------------------------------------------
  const handleFinish = useCallback(() => {
    window.location.href = "/dashboard";
  }, []);

  // ---------------------------------------------------------------------------
  // Member helpers
  // ---------------------------------------------------------------------------
  const updateMember = (index: number, patch: Partial<MemberDraft>) => {
    setMembers((prev) => prev.map((m, i) => (i === index ? { ...m, ...patch } : m)));
  };

  const addMember = () => {
    setMembers((prev) => [...prev, emptyMember(prev.length)]);
  };

  const removeMember = (index: number) => {
    setMembers((prev) => prev.filter((_, i) => i !== index));
  };

  const validMembers = members.filter((m) => m.name.trim()).length > 0;

  // ---------------------------------------------------------------------------
  // Progress dots
  // ---------------------------------------------------------------------------
  const StepDots = () => (
    <div className="flex justify-center gap-2 mb-8">
      {([1, 2, 3, 4] as Step[]).map((s) => (
        <div
          key={s}
          className={`w-2 h-2 rounded-full transition-all ${
            s === step
              ? "w-6 bg-brand"
              : s < step
              ? "bg-brand/50"
              : "bg-border-subtle/40"
          }`}
        />
      ))}
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 pb-8">
      {/* Ambient glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-brand-glow/20 rounded-full blur-[120px]" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-tertiary-container/30 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <StepDots />

        {/* ----------------------------------------------------------------- */}
        {/* Step 1 — Household name                                           */}
        {/* ----------------------------------------------------------------- */}
        {step === 1 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mom-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px] text-on-primary">home</span>
              </div>
              <h1 className="font-headline text-alphaai-2xl font-extrabold text-foreground mb-2">
                Name your household
              </h1>
              <p className="text-alphaai-sm text-muted-foreground">
                This is how your family will appear across the app.
              </p>
            </div>

            <input
              type="text"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              placeholder="e.g. The Franco Family"
              className="mom-input mb-6"
              autoFocus
            />

            <button
              onClick={handleStep1Next}
              disabled={!householdName.trim()}
              className="mom-btn-primary w-full disabled:opacity-40"
            >
              Next
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 2 — Family members                                           */}
        {/* ----------------------------------------------------------------- */}
        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mom-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px] text-on-primary">group</span>
              </div>
              <h1 className="font-headline text-alphaai-2xl font-extrabold text-foreground mb-2">
                Add your family
              </h1>
              <p className="text-alphaai-sm text-muted-foreground">
                Who&apos;s in {householdName || "your household"}?
              </p>
            </div>

            <div className="space-y-3 mb-4 max-h-[50vh] overflow-y-auto">
              {members.map((member, index) => (
                <div key={index} className="mom-card p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    {/* Color dot */}
                    <div
                      className="w-8 h-8 rounded-full flex-shrink-0 cursor-pointer ring-2 ring-offset-2 ring-transparent hover:ring-brand transition-all"
                      style={{ backgroundColor: member.color }}
                      title="Color"
                    />
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(index, { name: e.target.value })}
                      placeholder="Name"
                      className="mom-input flex-1 py-2"
                    />
                    {members.length > 1 && (
                      <button
                        onClick={() => removeMember(index)}
                        className="text-muted-foreground hover:text-error transition-colors flex-shrink-0"
                      >
                        <span className="material-symbols-outlined text-[20px]">close</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Role toggle */}
                    <div className="flex gap-1 flex-1">
                      {(["parent", "child"] as const).map((role) => (
                        <button
                          key={role}
                          onClick={() => updateMember(index, { role })}
                          className={`flex-1 py-1.5 rounded-lg text-alphaai-xs font-medium capitalize transition-colors ${
                            member.role === role
                              ? "bg-brand text-on-primary"
                              : "bg-surface-container text-muted-foreground"
                          }`}
                        >
                          {role}
                        </button>
                      ))}
                    </div>
                    {/* Age */}
                    <input
                      type="number"
                      value={member.age}
                      onChange={(e) => updateMember(index, { age: e.target.value })}
                      placeholder="Age"
                      min={0}
                      max={120}
                      className="mom-input w-20 py-2 text-center"
                    />
                  </div>

                  {/* Color swatches */}
                  <div className="flex gap-2">
                    {MEMBER_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => updateMember(index, { color })}
                        className={`w-6 h-6 rounded-full transition-all ${
                          member.color === color ? "ring-2 ring-offset-1 ring-foreground scale-110" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={addMember}
              className="w-full py-2.5 border border-dashed border-brand/40 rounded-xl text-alphaai-sm text-brand hover:bg-brand/5 transition-colors mb-6 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add another member
            </button>

            {submitError && (
              <p className="text-alphaai-xs text-error text-center mb-4">{submitError}</p>
            )}

            <button
              onClick={handleStep2Next}
              disabled={!validMembers || isLoading}
              className="mom-btn-primary w-full disabled:opacity-40"
            >
              {isLoading ? "Creating…" : "Next"}
              {!isLoading && <span className="material-symbols-outlined text-[20px]">arrow_forward</span>}
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 3 — Invite co-parent                                         */}
        {/* ----------------------------------------------------------------- */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 mom-gradient-hero rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[32px] text-on-primary">person_add</span>
              </div>
              <h1 className="font-headline text-alphaai-2xl font-extrabold text-foreground mb-2">
                Invite a co-parent
              </h1>
              <p className="text-alphaai-sm text-muted-foreground">
                Share the household with a partner or co-parent. This is optional — you can do it from settings later.
              </p>
            </div>

            {!inviteSent ? (
              <>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="Partner's email address"
                  className="mom-input mb-3"
                />
                {inviteError && (
                  <p className="text-alphaai-xs text-error text-center mb-3">{inviteError}</p>
                )}
                <button
                  onClick={handleInvite}
                  disabled={!inviteEmail.trim() || isSending}
                  className="mom-btn-primary w-full mb-4 disabled:opacity-40"
                >
                  {isSending ? "Sending…" : "Send Invite"}
                  {!isSending && <span className="material-symbols-outlined text-[20px]">send</span>}
                </button>
              </>
            ) : (
              <div className="mom-card p-4 mb-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-brand">check_circle</span>
                <p className="text-alphaai-sm text-foreground">
                  Invite sent to <span className="font-medium">{inviteEmail}</span>
                </p>
              </div>
            )}

            <button
              onClick={handleStep3Next}
              className="w-full text-center text-alphaai-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              {inviteSent ? "Continue →" : "Skip for now"}
            </button>
          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* Step 4 — Done                                                      */}
        {/* ----------------------------------------------------------------- */}
        {step === 4 && (
          <div className="text-center">
            <div className="w-20 h-20 mom-gradient-hero rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <span className="material-symbols-outlined text-[40px] text-on-primary">celebration</span>
            </div>
            <h1 className="font-headline text-alphaai-3xl font-extrabold text-foreground mb-3">
              You&apos;re all set!
            </h1>
            <p className="text-alphaai-sm text-muted-foreground mb-2">
              <span className="font-semibold text-foreground">{householdName}</span> is ready.
            </p>
            <p className="text-alphaai-sm text-muted-foreground mb-8">
              {members.filter((m) => m.name.trim()).length} family member
              {members.filter((m) => m.name.trim()).length !== 1 ? "s" : ""} added.
              {inviteSent && " Co-parent invite sent."}
            </p>

            <button onClick={handleFinish} className="mom-btn-primary w-full">
              Let&apos;s go
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
