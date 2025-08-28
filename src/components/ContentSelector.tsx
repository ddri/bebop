'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, X, FileText, Calendar, Clock } from 'lucide-react';
import { useTopics } from '@/hooks/useTopics';

interface ContentSelectorProps {
  selectedTopicId?: string;
  onSelect: (topicId: string) => void;
  placeholder?: string;
  compact?: boolean;
}

export default function ContentSelector({ 
  selectedTopicId, 
  onSelect, 
  placeholder = "Search and select content...",
  compact = false 
}: ContentSelectorProps) {
  const { topics } = useTopics();
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredTopics, setFilteredTopics] = useState(topics || []);
  const searchRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedTopic = topics?.find(t => t.id === selectedTopicId);

  useEffect(() => {
    if (!topics) return;
    
    if (!searchQuery.trim()) {
      // Show recent topics first when no search
      const sortedTopics = [...topics].sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setFilteredTopics(sortedTopics.slice(0, 20)); // Limit to recent 20
    } else {
      // Search in title, description, and content
      const filtered = topics.filter(topic => {
        const query = searchQuery.toLowerCase();
        return (
          topic.name.toLowerCase().includes(query) ||
          topic.description?.toLowerCase().includes(query) ||
          topic.content.toLowerCase().includes(query)
        );
      });
      setFilteredTopics(filtered);
    }
  }, [topics, searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (topicId: string) => {
    onSelect(topicId);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = () => {
    onSelect('');
    setSearchQuery('');
    setIsOpen(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-[#E669E8]/20 text-[#E669E8]">
          {part}
        </mark>
      ) : part
    );
  };

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Input
            ref={searchRef}
            type="text"
            placeholder={selectedTopic ? selectedTopic.name : placeholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            className="bg-[#2f2f2d] border-slate-700 text-white pr-8"
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          {selectedTopic && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-8 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-slate-400 hover:text-white"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-[#2f2f2d] border border-slate-700 rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
            {filteredTopics.length > 0 ? (
              <div className="py-1">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => handleSelect(topic.id)}
                    className="w-full px-3 py-2 text-left hover:bg-[#1c1c1e] transition-colors"
                  >
                    <div className="text-sm font-medium text-white truncate">
                      {highlightMatch(topic.name, searchQuery)}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {formatDate(topic.updatedAt)} • {topic.content.length} chars
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-4 text-center text-slate-400 text-sm">
                {searchQuery ? `No content found for "${searchQuery}"` : 'No content available'}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full content selector with visual cards
  return (
    <div className="space-y-3">
      {/* Search Input */}
      <div className="relative">
        <Input
          ref={searchRef}
          type="text"
          placeholder="Search your content library..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#2f2f2d] border-slate-700 text-white pl-10"
        />
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
      </div>

      {/* Search Results / Content Grid */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        {!searchQuery && (
          <div className="text-xs text-slate-400 mb-2 flex items-center gap-2">
            <Clock className="h-3 w-3" />
            {filteredTopics.length > 0 ? 'Recent Content' : 'No content available'}
          </div>
        )}

        {filteredTopics.length > 0 ? (
          filteredTopics.map((topic) => (
            <Card
              key={topic.id}
              className={`cursor-pointer transition-all border ${
                selectedTopicId === topic.id
                  ? 'border-[#E669E8] bg-[#E669E8]/5'
                  : 'border-slate-700 hover:border-slate-600 bg-[#2f2f2d]'
              }`}
              onClick={() => handleSelect(topic.id)}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-4 w-4 text-slate-400 flex-shrink-0" />
                      <h4 className="font-medium text-white text-sm truncate">
                        {highlightMatch(topic.name, searchQuery)}
                      </h4>
                      {selectedTopicId === topic.id && (
                        <Badge variant="secondary" className="text-xs bg-[#E669E8]/20 text-[#E669E8]">
                          Selected
                        </Badge>
                      )}
                    </div>
                    
                    {topic.description && (
                      <p className="text-xs text-slate-400 line-clamp-1 mb-2">
                        {highlightMatch(topic.description, searchQuery)}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(topic.updatedAt)}
                      </div>
                      <div>
                        {topic.content.length} characters
                      </div>
                    </div>
                  </div>
                  
                  {selectedTopicId === topic.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClear();
                      }}
                      className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                
                {/* Content Preview */}
                {searchQuery && topic.content.toLowerCase().includes(searchQuery.toLowerCase()) && (
                  <div className="mt-2 p-2 bg-[#1c1c1e] rounded text-xs text-slate-300 border-l-2 border-[#E669E8]/30">
                    {highlightMatch(
                      topic.content.slice(0, 120) + (topic.content.length > 120 ? '...' : ''),
                      searchQuery
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : searchQuery ? (
          <div className="text-center py-8 text-slate-400">
            <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content found for &quot;{searchQuery}&quot;</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No content available</p>
            <p className="text-xs mt-1">Create some content in Topics first</p>
          </div>
        )}
      </div>

      {/* Search Stats */}
      {searchQuery && (
        <div className="text-xs text-slate-400 flex justify-between">
          <span>{filteredTopics.length} results found</span>
          {filteredTopics.length > 0 && (
            <span>showing top {Math.min(filteredTopics.length, 20)} matches</span>
          )}
        </div>
      )}
    </div>
  );
}