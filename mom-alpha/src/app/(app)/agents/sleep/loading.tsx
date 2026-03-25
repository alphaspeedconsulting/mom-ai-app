import { CardSkeleton } from "@/components/shared/Skeleton";

export default function SleepLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-20 space-y-4">
        <div className="mom-skeleton h-32 w-full rounded-2xl" />
        <div className="mom-skeleton h-40 w-full rounded-xl" />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
