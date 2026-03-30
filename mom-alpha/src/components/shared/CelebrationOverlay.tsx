"use client";

import React, { useCallback, useEffect, useRef } from "react";
import { useTasksStore } from "@/stores/tasks-store";
import { Confetti } from "@/components/shared/Confetti";
import { CelebrationToast } from "@/components/shared/CelebrationToast";

/**
 * Global celebration overlay — triggers confetti + toast when all daily tasks are completed.
 * Mounted once in the app layout, listens to the tasks store for completion state.
 */
export function CelebrationOverlay() {
  const tasks = useTasksStore((s) => s.tasks);
  const celebrationShown = useTasksStore((s) => s.celebrationShown);
  const showCelebration = useTasksStore((s) => s.showCelebration);
  const dismissCelebration = useTasksStore((s) => s.dismissCelebration);
  const hasTriggeredRef = useRef(false);

  useEffect(() => {
    if (tasks.length === 0 || hasTriggeredRef.current) return;

    const today = new Date().toDateString();
    const todayTasks = tasks.filter(
      (t) => new Date(t.created_at).toDateString() === today,
    );

    if (todayTasks.length === 0) return;

    const allCompleted = todayTasks.every((t) => t.status === "completed");
    if (allCompleted) {
      hasTriggeredRef.current = true;
      showCelebration();
    }
  }, [tasks, showCelebration]);

  const handleDismiss = useCallback(() => {
    dismissCelebration();
  }, [dismissCelebration]);

  return (
    <>
      <Confetti active={celebrationShown} onComplete={handleDismiss} />
      <CelebrationToast
        message="All tasks done today! You're crushing it!"
        icon="celebration"
        visible={celebrationShown}
        onDismiss={handleDismiss}
      />
    </>
  );
}
