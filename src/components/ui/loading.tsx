import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Basic spinner component
export const Spinner: React.FC<{ className?: string; size?: 'sm' | 'md' | 'lg' }> = ({ 
  className, 
  size = 'md' 
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 className={cn('animate-spin', sizeClasses[size], className)} />
  );
};

// Loading skeleton for content
export const ContentSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={cn('animate-pulse space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={cn(
          'h-4 bg-slate-300 dark:bg-slate-700 rounded',
          i === lines - 1 ? 'w-3/4' : 'w-full'
        )}
      />
    ))}
  </div>
);

// Card skeleton for grid layouts
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('animate-pulse', className)}>
    <div className="bg-slate-300 dark:bg-slate-700 rounded-lg p-6 space-y-4">
      <div className="h-6 bg-slate-400 dark:bg-slate-600 rounded w-3/4" />
      <div className="space-y-2">
        <div className="h-4 bg-slate-400 dark:bg-slate-600 rounded w-full" />
        <div className="h-4 bg-slate-400 dark:bg-slate-600 rounded w-2/3" />
      </div>
      <div className="flex space-x-2">
        <div className="h-8 bg-slate-400 dark:bg-slate-600 rounded w-16" />
        <div className="h-8 bg-slate-400 dark:bg-slate-600 rounded w-16" />
      </div>
    </div>
  </div>
);

// Loading overlay for forms and modals
export const LoadingOverlay: React.FC<{ 
  children: React.ReactNode;
  isLoading: boolean;
  loadingText?: string;
  className?: string;
}> = ({ children, isLoading, loadingText = 'Loading...', className }) => (
  <div className={cn('relative', className)}>
    {children}
    {isLoading && (
      <div className="absolute inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50 rounded-lg">
        <div className="flex flex-col items-center space-y-2">
          <Spinner size="lg" />
          <p className="text-sm text-slate-600 dark:text-slate-400">{loadingText}</p>
        </div>
      </div>
    )}
  </div>
);

// Progress bar for uploads and operations
export const ProgressBar: React.FC<{ 
  progress: number; 
  className?: string;
  showLabel?: boolean;
}> = ({ progress, className, showLabel = true }) => (
  <div className={cn('space-y-1', className)}>
    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
      <div 
        className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
      />
    </div>
    {showLabel && (
      <p className="text-xs text-slate-600 dark:text-slate-400 text-center">
        {Math.round(progress)}%
      </p>
    )}
  </div>
);

// Loading button states
export const LoadingButton: React.FC<{
  isLoading: boolean;
  loadingText?: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}> = ({ 
  isLoading, 
  loadingText, 
  children, 
  className,
  disabled,
  onClick,
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        props.variant === 'outline' 
          ? 'border border-slate-300 dark:border-slate-600 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-800'
          : 'bg-blue-600 hover:bg-blue-700 text-white',
        props.size === 'sm' ? 'px-3 py-1.5 text-sm' : '',
        props.size === 'lg' ? 'px-6 py-3 text-lg' : '',
        className
      )}
      disabled={disabled || isLoading}
      onClick={(e) => onClick?.(e)}
    >
      {isLoading && <Spinner size="sm" />}
      <span>{isLoading && loadingText ? loadingText : children}</span>
    </button>
  );
};

// Page loading state
export const PageLoading: React.FC<{ message?: string }> = ({ 
  message = 'Loading...' 
}) => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="flex flex-col items-center space-y-4">
      <Spinner size="lg" />
      <p className="text-lg text-slate-600 dark:text-slate-400">{message}</p>
    </div>
  </div>
);

// Grid loading state with multiple skeletons
export const GridLoading: React.FC<{ 
  count?: number; 
  className?: string;
}> = ({ count = 6, className }) => (
  <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);