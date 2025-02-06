// components/social/icons/BlueskyIcon.tsx
export function BlueskyIcon({ className = "h-4 w-4" }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 36 36" fill="currentColor">
        <path d="M18,0C8.06,0,0,8.06,0,18s8.06,18,18,18s18-8.06,18-18S27.94,0,18,0z M18,33c-8.27,0-15-6.73-15-15S9.73,3,18,3 s15,6.73,15,15S26.27,33,18,33z"/>
      </svg>
    );
  }