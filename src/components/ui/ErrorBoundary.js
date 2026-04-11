"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * ErrorBoundary isolates widget crashes so that a single broken component
 * (e.g. null-pointer on user.name) doesn't take down the entire dashboard.
 * 
 * Usage:
 *   <ErrorBoundary fallbackLabel="Profile Widget">
 *     <ProfileEditor />
 *   </ErrorBoundary>
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      `[ErrorBoundary] ${this.props.fallbackLabel || "Component"} crashed:`,
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const label = this.props.fallbackLabel || "Widget";
      return (
        <div className="flex flex-col items-center justify-center gap-3 p-6 bg-red-500/5 border border-red-500/20 rounded-2xl text-center min-h-[120px]">
          <AlertTriangle className="text-red-400" size={28} />
          <div>
            <p className="text-sm font-semibold text-red-300">{label} Error</p>
            <p className="text-xs text-red-200/60 mt-1 max-w-xs">
              Something went wrong rendering this section.
            </p>
          </div>
          <button
            onClick={this.handleRetry}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-red-300 transition-colors"
          >
            <RefreshCw size={12} />
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
