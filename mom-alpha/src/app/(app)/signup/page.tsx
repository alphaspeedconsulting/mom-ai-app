"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthForm } from "@/components/auth/AuthForm";

function SignupInner() {
  const searchParams = useSearchParams();
  const promoFromUrl = searchParams.get("promo")?.trim().toUpperCase() ?? "";
  const initialPromo =
    promoFromUrl ||
    (typeof window !== "undefined"
      ? (localStorage.getItem("mom-alpha-promo-code") ?? "")
      : "");

  return (
    <AuthForm
      initialMode="signup"
      initialPromo={initialPromo}
      showModeToggle={false}
    />
  );
}

export default function SignupPage() {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ?? "";
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <Suspense fallback={<div className="min-h-screen bg-background" />}>
        <SignupInner />
      </Suspense>
    </GoogleOAuthProvider>
  );
}
