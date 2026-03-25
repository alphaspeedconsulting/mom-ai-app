export function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 p-3 mom-glass-panel border-t border-border-subtle/10">
      <a
        href="/login?mode=signup"
        className="mom-btn-primary w-full text-center py-3"
      >
        Start Free Trial
      </a>
    </div>
  );
}
