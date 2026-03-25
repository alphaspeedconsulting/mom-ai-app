import { CardSkeleton } from "@/components/shared/Skeleton";

export default function AppLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-20 space-y-4">
        <div className="mom-skeleton h-8 w-48 rounded-lg" />
        <div className="mom-skeleton h-12 w-full rounded-xl" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
