'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Clock, FileText, FolderOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SearchResult {
  id: string;
  type: 'topic' | 'collection';
  name: string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  matches: string[];
}

interface SearchBarProps {
  className?: string;
  onResultSelect?: (result: SearchResult) => void;
  placeholder?: string;
  showQuickResults?: boolean;
  maxQuickResults?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  className,
  onResultSelect,
  placeholder = 'Search topics and collections... (⌘K)',
  showQuickResults = true,
  maxQuickResults = 5
}) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=${maxQuickResults}`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setShowResults(true);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setShowResults(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input changes with debouncing
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (showQuickResults) {
        performSearch(query);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, showQuickResults, maxQuickResults]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || results.length === 0) {
      if (e.key === 'Enter' && query.trim()) {
        // Navigate to full search results
        router.push(`/search?q=${encodeURIComponent(query)}`);
        setShowResults(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleResultSelect(results[selectedIndex]);
        } else if (query.trim()) {
          // Navigate to full search results
          router.push(`/search?q=${encodeURIComponent(query)}`);
          setShowResults(false);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle result selection
  const handleResultSelect = (result: SearchResult) => {
    if (onResultSelect) {
      onResultSelect(result);
    } else {
      // Default navigation behavior
      if (result.type === 'topic') {
        router.push(`/topics?highlight=${result.id}`);
      } else {
        router.push(`/collections?highlight=${result.id}`);
      }
    }
    setShowResults(false);
    setQuery('');
    inputRef.current?.blur();
  };

  // Close results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Clear search
  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Get result icon
  const getResultIcon = (type: 'topic' | 'collection') => {
    return type === 'topic' ? (
      <FileText className="h-4 w-4 text-slate-400" />
    ) : (
      <FolderOpen className="h-4 w-4 text-slate-400" />
    );
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100">
          {part}
        </span>
      ) : part
    );
  };

  return (
    <div className={cn('relative w-full max-w-md', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-10 pr-10 py-2 text-sm',
            'bg-slate-800 border border-slate-700 rounded-lg',
            'text-white placeholder:text-slate-400',
            'focus:outline-none focus:ring-2 focus:ring-[#E669E8] focus:border-transparent',
            'transition-colors duration-200'
          )}
        />
        {query && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-400 border-t-transparent" />
          </div>
        )}
      </div>

      {/* Quick Results Dropdown */}
      {showResults && showQuickResults && (
        <div
          ref={resultsRef}
          className={cn(
            'absolute top-full left-0 right-0 mt-2 z-50',
            'bg-slate-800 border border-slate-700 rounded-lg shadow-xl',
            'max-h-96 overflow-y-auto'
          )}
        >
          {results.length > 0 ? (
            <>
              {results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className={cn(
                    'w-full p-3 text-left hover:bg-slate-700 transition-colors',
                    'border-b border-slate-700 last:border-b-0',
                    'focus:outline-none focus:bg-slate-700',
                    selectedIndex === index && 'bg-slate-700'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {getResultIcon(result.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-white text-sm truncate">
                          {highlightMatch(result.name, query)}
                        </h4>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          result.type === 'topic' 
                            ? 'bg-blue-500/20 text-blue-400' 
                            : 'bg-green-500/20 text-green-400'
                        )}>
                          {result.type}
                        </span>
                      </div>
                      {result.description && (
                        <p className="text-xs text-slate-300 truncate">
                          {highlightMatch(result.description, query)}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        <span className="text-xs text-slate-500">
                          {new Date(result.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {results.length === maxQuickResults && (
                <div className="p-3 text-center border-t border-slate-700">
                  <button
                    onClick={() => {
                      router.push(`/search?q=${encodeURIComponent(query)}`);
                      setShowResults(false);
                    }}
                    className="text-sm text-[#E669E8] hover:text-[#d15dd3] font-medium"
                  >
                    View all results
                  </button>
                </div>
              )}
            </>
          ) : query && !isLoading ? (
            <div className="p-4 text-center text-slate-400">
              <p className="text-sm">No results found for "{query}"</p>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};