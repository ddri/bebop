'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Search, FileText, FolderOpen, Clock, ArrowRight, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Layout from '@/components/Layout';
import { SearchBar } from '@/components/SearchBar';
import { cn } from '@/lib/utils';

interface SearchResult {
  id: string;
  type: 'topic' | 'collection';
  name: string;
  description: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
  matches: string[];
}

interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  query: string;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Get initial query from URL
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery) {
      setQuery(urlQuery);
      performSearch(urlQuery);
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setTotalCount(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: SearchResponse = await response.json();
      setResults(data.results || []);
      setTotalCount(data.totalCount || 0);
    } catch (error) {
      console.error('Search error:', error);
      setError('Search failed. Please try again.');
      setResults([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (newQuery: string) => {
    setQuery(newQuery);
    if (newQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(newQuery)}`);
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setTotalCount(0);
    router.push('/search');
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'topic') {
      router.push(`/topics?highlight=${result.id}`);
    } else {
      router.push(`/collections?highlight=${result.id}`);
    }
  };

  const getResultIcon = (type: 'topic' | 'collection') => {
    return type === 'topic' ? (
      <FileText className="h-5 w-5 text-blue-400" />
    ) : (
      <FolderOpen className="h-5 w-5 text-green-400" />
    );
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 dark:bg-yellow-800/50 text-yellow-900 dark:text-yellow-100 px-1 rounded">
          {part}
        </span>
      ) : part
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Layout pathname="/search">
      <div className="max-w-4xl mx-auto">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-4">Search</h1>
          
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
              placeholder="Search topics and collections..."
              className={cn(
                'pl-12 pr-12 py-3 text-base',
                'bg-slate-800 border-slate-700 text-white',
                'focus:ring-2 focus:ring-[#E669E8] focus:border-transparent'
              )}
            />
            {query && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <div className="mt-4">
            <Button
              onClick={() => handleSearch(query)}
              disabled={!query.trim() || loading}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Results */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {query && !loading && totalCount > 0 && (
          <div className="mb-6">
            <p className="text-slate-300">
              Found <span className="font-semibold text-white">{totalCount}</span> results for "
              <span className="font-semibold text-white">{query}</span>"
            </p>
          </div>
        )}

        {query && !loading && totalCount === 0 && !error && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              No results found
            </h3>
            <p className="text-slate-400 mb-4">
              Try adjusting your search terms or check your spelling.
            </p>
            <Button
              onClick={clearSearch}
              variant="outline"
              className="border-slate-700 text-white hover:bg-slate-800"
            >
              Clear search
            </Button>
          </div>
        )}

        {/* Results List */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => (
              <Card
                key={result.id}
                className="bg-[#1c1c1e] border-slate-700 hover:border-[#E669E8] transition-all duration-200 cursor-pointer"
                onClick={() => handleResultClick(result)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {getResultIcon(result.type)}
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-white text-lg">
                          {highlightMatch(result.name, query)}
                        </h3>
                        <Badge
                          variant="secondary"
                          className={cn(
                            'text-xs',
                            result.type === 'topic' 
                              ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                              : 'bg-green-500/20 text-green-400 border-green-500/30'
                          )}
                        >
                          {result.type}
                        </Badge>
                      </div>

                      {result.description && (
                        <p className="text-slate-300 mb-3">
                          {highlightMatch(truncateText(result.description, 150), query)}
                        </p>
                      )}

                      {result.content && result.type === 'topic' && (
                        <div className="mb-3">
                          <p className="text-sm text-slate-400 mb-1">Content preview:</p>
                          <p className="text-slate-300 text-sm">
                            {highlightMatch(truncateText(result.content, 200), query)}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              Updated {new Date(result.updatedAt).toLocaleDateString()}
                            </span>
                          </div>
                          {result.matches.length > 0 && (
                            <div className="flex items-center gap-1">
                              <span>Matches: {result.matches.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E669E8] border-t-transparent mr-3" />
            <span className="text-slate-300">Searching...</span>
          </div>
        )}

        {/* Empty State */}
        {!query && !loading && (
          <div className="text-center py-12">
            <Search className="h-12 w-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">
              Search your content
            </h3>
            <p className="text-slate-400">
              Enter a search term to find topics and collections.
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <Layout pathname="/search">
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#E669E8] border-t-transparent" />
        </div>
      </Layout>
    }>
      <SearchPageContent />
    </Suspense>
  );
}