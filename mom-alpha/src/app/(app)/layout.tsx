import { BottomNav } from "@/components/shared/BottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { InstallBanner } from "@/components/shared/InstallBanner";
import { SyncStatus } from "@/components/shared/SyncStatus";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <InstallBanner />
      <OfflineBanner />
      <div className="min-h-screen bg-background pb-20">
        {children}
      </div>
      <SyncStatus />
      <BottomNav />
    </ErrorBoundary>
  );
}
