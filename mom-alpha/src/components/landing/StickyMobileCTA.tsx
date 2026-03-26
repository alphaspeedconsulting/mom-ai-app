export function StickyMobileCTA() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-subtle/10 bg-background p-3 md:hidden">
      <a
        href="/login?mode=signup"
        className="mom-btn-primary w-full text-center py-3"
      >
        Start Free Trial
      </a>
    </div>
  );
}
