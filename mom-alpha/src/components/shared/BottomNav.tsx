"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const NAV_ITEMS = [
  { href: "/dashboard", icon: "home", label: "Home" },
  { href: "/tasks", icon: "task_alt", label: "Tasks" },
  { href: "/memory", icon: "neurology", label: "Brain" },
  { href: "/calendar", icon: "calendar_month", label: "Calendar" },
  { href: "/profile", icon: "person", label: "Profile" },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <nav className="mom-bottom-nav fixed bottom-0 left-0 right-0 z-50">
      <div className="flex items-center max-w-lg mx-auto px-1">
        {/* Back */}
        <button
          onClick={() => router.back()}
          aria-label="Go back"
          className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_back_ios</span>
          <span className="text-alphaai-3xs font-medium">Back</span>
        </button>

        {/* Main nav tabs */}
        <div className="flex items-center justify-around flex-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-brand-glow/40 text-brand"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="material-symbols-outlined text-[24px]"
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {item.icon}
                </span>
                <span className="text-alphaai-3xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Forward */}
        <button
          onClick={() => router.forward()}
          aria-label="Go forward"
          className="flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        >
          <span className="material-symbols-outlined text-[22px]">arrow_forward_ios</span>
          <span className="text-alphaai-3xs font-medium">Fwd</span>
        </button>
      </div>
    </nav>
  );
}
