"use client";

import { useState } from "react";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 mom-glass-panel">
      <div className="mom-container flex items-center justify-between px-6 py-4">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full mom-gradient-hero flex items-center justify-center">
            <span className="text-on-primary font-bold text-alphaai-sm">M</span>
          </div>
          <span className="font-headline font-bold text-alphaai-lg text-foreground">
            Mom<span className="text-brand">.alpha</span>
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#agents" className="text-alphaai-sm text-muted-foreground hover:text-foreground transition-colors">
            Agents
          </a>
          <a href="#features" className="text-alphaai-sm text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <a href="#pricing" className="text-alphaai-sm text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </a>
          <a href="#faq" className="text-alphaai-sm text-muted-foreground hover:text-foreground transition-colors">
            FAQ
          </a>
          <a href="#waitlist" className="mom-btn-primary !py-2.5 !px-5 !text-alphaai-sm">
            Get Early Access
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-foreground transition-transform ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`block w-5 h-0.5 bg-foreground transition-opacity ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-foreground transition-transform ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border-subtle/15 bg-background/95 backdrop-blur-lg px-6 py-4 flex flex-col gap-4">
          <a href="#agents" onClick={() => setMenuOpen(false)} className="text-alphaai-base text-foreground py-2">
            Agents
          </a>
          <a href="#features" onClick={() => setMenuOpen(false)} className="text-alphaai-base text-foreground py-2">
            Features
          </a>
          <a href="#pricing" onClick={() => setMenuOpen(false)} className="text-alphaai-base text-foreground py-2">
            Pricing
          </a>
          <a href="#faq" onClick={() => setMenuOpen(false)} className="text-alphaai-base text-foreground py-2">
            FAQ
          </a>
          <a href="#waitlist" className="mom-btn-primary text-center">
            Get Early Access
          </a>
        </div>
      )}
    </nav>
  );
}
