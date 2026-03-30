import { BottomNav } from "@/components/shared/BottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { InstallBanner } from "@/components/shared/InstallBanner";
import { SyncStatus } from "@/components/shared/SyncStatus";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { UpdateBanner } from "@/components/shared/UpdateBanner";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ServiceWorkerRegistration />
      <AmbientBackground variant="subtle" />
      <InstallBanner />
      <OfflineBanner />
      <div className="mom-page-content min-h-screen bg-background pb-24">
        {children}
      </div>
      <UpdateBanner />
      <SyncStatus />
      <BottomNav />
    </ErrorBoundary>
  );
}
