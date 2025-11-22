import { Component } from "react";
import { Button } from "./ui/button";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // In production, you would send this to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;

      // Use custom fallback if provided
      if (fallback) {
        return fallback({
          error: this.state.error,
          errorInfo: this.state.errorInfo,
          resetError: this.handleReset,
        });
      }

      // Default error UI
      return (
        <div className="min-h-screen w-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-950 p-4">
          <div className="max-w-md w-full">
            <div className="bg-white dark:bg-neutral-900 rounded-2xl p-8 shadow-lg border border-neutral-200 dark:border-neutral-800">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white text-center mb-2">
                Oops! Something went wrong
              </h1>

              {/* Description */}
              <p className="text-neutral-600 dark:text-neutral-400 text-center mb-6">
                We encountered an unexpected error. Don't worry, your data is safe.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="mb-6 p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
                  <summary className="cursor-pointer text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Error Details
                  </summary>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 font-mono overflow-auto max-h-40">
                    <p className="font-semibold mb-1">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className="flex flex-col gap-3">
                <Button
                  onClick={this.handleReset}
                  className="w-full"
                  size="lg"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                <Button
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
