export function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle/10 bg-background p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden">
      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="flex-shrink-0 text-alphaai-sm font-medium text-brand px-4 py-3"
        >
          Log In
        </a>
        <a
          href="/login?mode=signup"
          className="mom-btn-primary flex-1 text-center py-3"
        >
          Start Free Trial
        </a>
      </div>
    </div>
  );
}
