export function Footer() {
  return (
    <footer className="py-12 px-6 bg-surface-container-low">
      <div className="mom-container">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full mom-gradient-hero flex items-center justify-center">
                <span className="text-on-primary font-bold text-alphaai-3xs">M</span>
              </div>
              <span className="font-headline font-bold text-alphaai-md text-foreground">
                Mom<span className="text-brand">.alpha</span>
              </span>
            </div>
            <p className="text-alphaai-xs text-muted-foreground">
              Powered by{" "}
              <span className="font-semibold text-foreground">AlphaSpeed AI</span>
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-6 text-alphaai-xs text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-foreground transition-colors">AI Disclosure</a>
            <a href="#" className="hover:text-foreground transition-colors">Contact</a>
          </div>

          {/* Copyright */}
          <p className="text-alphaai-3xs text-muted-foreground">
            &copy; {new Date().getFullYear()} AlphaSpeed AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
