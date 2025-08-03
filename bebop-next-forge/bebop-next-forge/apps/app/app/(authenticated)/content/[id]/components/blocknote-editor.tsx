'use client';

import { lazy, Suspense } from 'react';

// Lazy load the BlockNote editor
const LazyBlockNoteEditor = lazy(() => 
  import('./lazy-blocknote-editor').then(module => ({ 
    default: module.LazyBlockNoteEditor 
  }))
);

interface BlockNoteEditorWrapperProps {
  initialContent?: string;
  onChange?: (value: string) => void;
  className?: string;
  placeholder?: string;
}

export const BlockNoteEditorWrapper = ({
  initialContent = '',
  onChange,
  className = '',
  placeholder = 'Start writing...',
}: BlockNoteEditorWrapperProps) => {
  return (
    <Suspense 
      fallback={
        <div className={`rounded-md border ${className}`}>
          <div className="flex items-center justify-center min-h-[400px] bg-muted/20">
            <div className="text-center space-y-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Loading editor...</p>
            </div>
          </div>
        </div>
      }
    >
      <LazyBlockNoteEditor
        initialContent={initialContent}
        onChange={onChange}
        className={className}
        placeholder={placeholder}
      />
    </Suspense>
  );
};
