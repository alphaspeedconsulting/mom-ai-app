"use client";

import React, { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/stores/auth-store";
import * as api from "@/lib/api-client";
import type { CaregiverAccess, CaregiverPermission, CaregiverRole } from "@/types/api-contracts";
import { CardSkeleton } from "@/components/shared/Skeleton";
import { EmptyState } from "@/components/shared/EmptyState";

const ROLES: { value: CaregiverRole; label: string; icon: string }[] = [
  { value: "grandparent", label: "Grandparent", icon: "elderly" },
  { value: "babysitter", label: "Babysitter", icon: "child_care" },
  { value: "nanny", label: "Nanny", icon: "person" },
  { value: "other", label: "Other", icon: "group" },
];

const PERMISSIONS: { value: CaregiverPermission; label: string; icon: string }[] = [
  { value: "calendar", label: "Today's Schedule", icon: "calendar_month" },
  { value: "emergency", label: "Emergency Contacts", icon: "emergency" },
  { value: "allergies", label: "Allergies", icon: "warning" },
  { value: "medications", label: "Medications", icon: "medication" },
  { value: "routines", label: "Routines", icon: "schedule" },
];

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export default function CaregiversPage() {
  const router = useRouter();
  const isClient = useIsClient();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const householdId = user?.household_id;

  const [caregivers, setCaregivers] = useState<CaregiverAccess[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);

  const fetchCaregivers = useCallback(async () => {
    if (!householdId) return;
    setIsLoading(true);
    try {
      const data = await api.caregivers.list(householdId);
      setCaregivers(data);
    } catch {
      // Silently handle — empty state shown
    } finally {
      setIsLoading(false);
    }
  }, [householdId]);

  useEffect(() => {
    if (!isClient) return;
    if (!token) {
      router.replace("/login?mode=signup");
      return;
    }
    fetchCaregivers();
  }, [isClient, token, fetchCaregivers, router]);

  const handleRemove = async (id: string) => {
    if (!householdId) return;
    try {
      await api.caregivers.remove(householdId, id);
      setCaregivers((prev) => prev.filter((c) => c.id !== id));
    } catch {
      // TODO: show error toast
    }
  };

  if (!isClient || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <CardSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-border-subtle/10 bg-background">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <Link
            href="/settings"
            className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
            aria-label="Back to settings"
          >
            <span className="material-symbols-outlined text-[20px] text-foreground">
              arrow_back
            </span>
          </Link>
          <div className="flex-1">
            <h1 className="font-headline text-alphaai-lg font-bold text-foreground">
              Caregivers
            </h1>
            <p className="text-alphaai-3xs text-muted-foreground">
              Share limited access with trusted people
            </p>
          </div>
          <button
            onClick={() => setShowInvite(true)}
            className="w-10 h-10 rounded-full bg-brand flex items-center justify-center"
            aria-label="Add caregiver"
          >
            <span className="material-symbols-outlined text-[20px] text-on-primary">add</span>
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pt-24 pb-24 space-y-4">
        {/* Info card */}
        <div className="mom-card p-4 bg-brand-glow/5 border border-brand/10">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px] text-brand mt-0.5">info</span>
            <p className="text-alphaai-xs text-foreground">
              Caregivers get a limited view of your household — only the info you choose to share.
              They can see but never edit.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : caregivers.length === 0 ? (
          <EmptyState
            icon="child_care"
            title="No caregivers yet"
            description="Invite grandparents, babysitters, or nannies to see your family's schedule and important info."
          />
        ) : (
          caregivers.map((cg) => (
            <div key={cg.id} className="mom-card p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px] text-brand">
                    {ROLES.find((r) => r.value === cg.role)?.icon ?? "person"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-alphaai-sm font-semibold text-foreground">{cg.name}</p>
                  <p className="text-alphaai-3xs text-muted-foreground capitalize">
                    {cg.role} · {cg.email}
                  </p>
                </div>
                <button
                  onClick={() => handleRemove(cg.id)}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-error transition-colors"
                  aria-label={`Remove ${cg.name}`}
                >
                  <span className="material-symbols-outlined text-[18px]">delete</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cg.permissions.map((perm) => (
                  <span key={perm} className="mom-chip text-alphaai-3xs px-2 py-0.5">
                    {PERMISSIONS.find((p) => p.value === perm)?.label ?? perm}
                  </span>
                ))}
              </div>
              {cg.last_accessed_at && (
                <p className="text-alphaai-3xs text-muted-foreground mt-2">
                  Last accessed {new Date(cg.last_accessed_at).toLocaleDateString()}
                </p>
              )}
            </div>
          ))
        )}
      </main>

      {/* Invite modal */}
      {showInvite && householdId && (
        <InviteModal
          householdId={householdId}
          onClose={() => setShowInvite(false)}
          onSuccess={() => {
            setShowInvite(false);
            fetchCaregivers();
          }}
        />
      )}
    </div>
  );
}

function InviteModal({
  householdId,
  onClose,
  onSuccess,
}: {
  householdId: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CaregiverRole>("babysitter");
  const [permissions, setPermissions] = useState<CaregiverPermission[]>([
    "calendar",
    "emergency",
    "allergies",
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const togglePermission = (perm: CaregiverPermission) => {
    setPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  const handleSubmit = async () => {
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      await api.caregivers.invite(householdId, {
        name: name.trim(),
        email: email.trim(),
        role,
        permissions,
      });
      api.viral.track({
        event_type: "caregiver_invite",
        metadata: { role },
      }).catch(() => {});
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send invite");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline text-alphaai-lg font-bold text-foreground">
            Invite Caregiver
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Name */}
        <div>
          <label htmlFor="cg-name" className="text-alphaai-xs font-medium text-foreground mb-1 block">
            Name
          </label>
          <input
            id="cg-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Grandma Sue"
            className="mom-input"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="cg-email" className="text-alphaai-xs font-medium text-foreground mb-1 block">
            Email
          </label>
          <input
            id="cg-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="grandma@email.com"
            className="mom-input"
          />
        </div>

        {/* Role */}
        <div>
          <p className="text-alphaai-xs font-medium text-foreground mb-2">Role</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={`px-3 py-2 rounded-full text-alphaai-xs font-medium transition-colors ${
                  role === r.value
                    ? "bg-brand text-on-primary"
                    : "bg-surface-container text-muted-foreground"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div>
          <p className="text-alphaai-xs font-medium text-foreground mb-2">
            What can they see?
          </p>
          <div className="space-y-2">
            {PERMISSIONS.map((perm) => (
              <label
                key={perm.value}
                className="flex items-center gap-3 p-3 rounded-xl bg-surface-container cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={permissions.includes(perm.value)}
                  onChange={() => togglePermission(perm.value)}
                  className="w-4 h-4 rounded border-border accent-brand"
                />
                <span className="material-symbols-outlined text-[18px] text-muted-foreground">
                  {perm.icon}
                </span>
                <span className="text-alphaai-xs text-foreground">{perm.label}</span>
              </label>
            ))}
          </div>
        </div>

        {error && (
          <p className="text-alphaai-xs text-error">{error}</p>
        )}

        <button
          onClick={handleSubmit}
          disabled={!name.trim() || !email.trim() || permissions.length === 0 || submitting}
          className="mom-btn-primary w-full disabled:opacity-50"
        >
          {submitting ? "Sending Invite..." : "Send Invite"}
        </button>
      </div>
    </div>
  );
}
