'use client';

import { Suspense, lazy } from 'react';

// Lazy load the BlockNote editor
const LazyBlockNoteEditor = lazy(() =>
  import('./lazy-blocknote-editor').then((module) => ({
    default: module.LazyBlockNoteEditor,
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
          <div className="flex min-h-[400px] items-center justify-center bg-muted/20">
            <div className="space-y-2 text-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-primary border-b-2" />
              <p className="text-muted-foreground text-sm">Loading editor...</p>
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
