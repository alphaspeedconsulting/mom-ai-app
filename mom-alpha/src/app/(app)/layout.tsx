import { BottomNav } from "@/components/shared/BottomNav";
import { OfflineBanner } from "@/components/shared/OfflineBanner";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { InstallBanner } from "@/components/shared/InstallBanner";
import { SyncStatus } from "@/components/shared/SyncStatus";
import { AmbientBackground } from "@/components/shared/AmbientBackground";
import { ServiceWorkerRegistration } from "@/components/shared/ServiceWorkerRegistration";
import { MemoryHydrator } from "@/components/shared/MemoryHydrator";
import { QuickCapture } from "@/components/shared/QuickCapture";
import { UpdateBanner } from "@/components/shared/UpdateBanner";
import { CelebrationOverlay } from "@/components/shared/CelebrationOverlay";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary>
      <ServiceWorkerRegistration />
      <MemoryHydrator />
      <AmbientBackground variant="subtle" />
      <InstallBanner />
      <OfflineBanner />
      <div className="mom-page-content min-h-screen bg-background pb-24">
        {children}
      </div>
      <QuickCapture />
      <CelebrationOverlay />
      <UpdateBanner />
      <SyncStatus />
      <BottomNav />
    </ErrorBoundary>
  );
}
