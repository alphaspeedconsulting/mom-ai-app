"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
            <span className="material-symbols-outlined text-[48px] text-muted-foreground mb-4">
              error_outline
            </span>
            <h2 className="font-headline text-alphaai-lg font-semibold text-foreground mb-2">
              Something went wrong
            </h2>
            <p className="text-alphaai-sm text-muted-foreground mb-6 max-w-sm">
              We hit an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.reload();
              }}
              className="mom-btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Refresh
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
