import { CardSkeleton } from "@/components/shared/Skeleton";

export default function TutorLoading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 pt-20 space-y-4">
        <div className="mom-skeleton h-12 w-full rounded-xl" />
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mom-skeleton h-10 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
