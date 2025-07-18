'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error details
    console.error('Error Boundary caught an error:', error);
    console.error('Error Info:', errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="flex items-center justify-center min-h-[200px] p-6">
          <div className="max-w-md w-full">
            <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold">Something went wrong</h3>
                    <p className="text-sm mt-1">
                      {this.state.error?.message || 'An unexpected error occurred'}
                    </p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={this.handleRetry}
                      size="sm"
                      variant="outline"
                      className="h-8"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Try Again
                    </Button>
                    <Button
                      onClick={() => window.location.reload()}
                      size="sm"
                      variant="outline"
                      className="h-8"
                    >
                      Reload Page
                    </Button>
                  </div>

                  {this.props.showDetails && this.state.error && (
                    <details className="mt-3">
                      <summary className="text-xs cursor-pointer text-red-600 dark:text-red-400">
                        Error Details
                      </summary>
                      <pre className="text-xs mt-1 p-2 bg-red-100 dark:bg-red-900/40 rounded overflow-auto">
                        {this.state.error.stack}
                      </pre>
                    </details>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Convenience wrapper for API-related errors
export const ApiErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('API Error Boundary:', error, errorInfo);
      // Here you could send to error tracking service
    }}
    fallback={
      <div className="flex items-center justify-center min-h-[100px] p-4">
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20 max-w-md">
          <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            <div className="space-y-2">
              <h3 className="font-semibold">Data Loading Error</h3>
              <p className="text-sm">Unable to load data. Please try refreshing the page.</p>
              <Button
                onClick={() => window.location.reload()}
                size="sm"
                variant="outline"
                className="h-8"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);

// Convenience wrapper for editor-related errors
export const EditorErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary
    onError={(error, errorInfo) => {
      console.error('Editor Error Boundary:', error, errorInfo);
    }}
    fallback={
      <div className="flex items-center justify-center min-h-[200px] p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <div className="text-center space-y-2">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400 mx-auto" />
          <h3 className="font-semibold text-red-800 dark:text-red-200">Editor Error</h3>
          <p className="text-sm text-red-700 dark:text-red-300">
            The editor encountered an error. Your content may be safely recovered by refreshing.
          </p>
          <Button
            onClick={() => window.location.reload()}
            size="sm"
            variant="outline"
            className="h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reload Editor
          </Button>
        </div>
      </div>
    }
  >
    {children}
  </ErrorBoundary>
);