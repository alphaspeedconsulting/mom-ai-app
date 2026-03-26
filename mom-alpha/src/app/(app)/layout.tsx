import { BottomNav } from "@/components/shared/BottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { InstallBanner } from "@/components/shared/InstallBanner";
import { SyncStatus } from "@/components/shared/SyncStatus";
import { AmbientBackground } from "@/components/shared/AmbientBackground";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <AmbientBackground variant="subtle" />
      <InstallBanner />
      <OfflineBanner />
      <div className="min-h-screen bg-background/80 pb-20">
        {children}
      </div>
      <SyncStatus />
      <BottomNav />
    </ErrorBoundary>
  );
}
