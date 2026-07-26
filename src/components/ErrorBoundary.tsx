import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

/**
 * Catches rendering errors anywhere in the component tree below it and shows
 * a friendly fallback UI instead of a blank white screen / crashed app.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    // In production this is where you'd forward to an error-tracking
    // service (Sentry, LogRocket, etc.)
    console.error('Tezzo app crashed:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[var(--color-background)] text-[var(--color-on-surface)] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-error-bg)] text-red-600 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-extrabold">Something went wrong</h1>
          <p className="text-sm text-[var(--color-on-surface-variant)] max-w-sm">
            Tezzo hit an unexpected error. Please try reloading the page — if the problem
            keeps happening, let us know.
          </p>
          <button
            onClick={this.handleReload}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--color-primary)] text-white font-semibold hover:bg-[var(--color-primary-container)] transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
