"use client";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
        <span className="material-symbols-outlined text-[32px] text-muted-foreground">
          {icon}
        </span>
      </div>
      <h3 className="font-headline text-alphaai-md font-semibold text-foreground mb-2">
        {title}
      </h3>
      <p className="text-alphaai-sm text-muted-foreground max-w-xs mb-6">
        {description}
      </p>
      {action && (
        <button onClick={action.onClick} className="mom-btn-primary text-alphaai-sm">
          {action.label}
        </button>
      )}
    </div>
  );
}
