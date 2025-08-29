'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Globe, Twitter, Facebook, Instagram, Linkedin, Youtube, Hash, AtSign } from 'lucide-react';

interface BulkPlatformModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatePlatforms: (platforms: string[]) => Promise<void>;
  itemCount: number;
}

const AVAILABLE_PLATFORMS = [
  { id: 'twitter', name: 'Twitter', icon: Twitter },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'blog', name: 'Blog', icon: Globe },
  { id: 'medium', name: 'Medium', icon: Hash },
  { id: 'devto', name: 'Dev.to', icon: AtSign },
  { id: 'hashnode', name: 'Hashnode', icon: Hash },
];

export const BulkPlatformModal: React.FC<BulkPlatformModalProps> = ({
  isOpen,
  onClose,
  onUpdatePlatforms,
  itemCount
}) => {
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<'replace' | 'add' | 'remove'>('replace');

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(platformId)) {
        newSet.delete(platformId);
      } else {
        newSet.add(platformId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    if (selectedPlatforms.size === 0) {
      alert('Please select at least one platform');
      return;
    }

    setLoading(true);
    try {
      await onUpdatePlatforms(Array.from(selectedPlatforms));
      onClose();
    } catch (error) {
      console.error('Failed to update platforms:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectAll = () => {
    setSelectedPlatforms(new Set(AVAILABLE_PLATFORMS.map(p => p.id)));
  };

  const selectNone = () => {
    setSelectedPlatforms(new Set());
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Platforms for {itemCount} Items</DialogTitle>
          <DialogDescription>
            Select the platforms where this content should be published
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Action Type Selection */}
          <div className="space-y-2">
            <Label>Action</Label>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={actionType === 'replace' ? 'default' : 'outline'}
                onClick={() => setActionType('replace')}
                className="flex-1"
              >
                Replace
              </Button>
              <Button
                size="sm"
                variant={actionType === 'add' ? 'default' : 'outline'}
                onClick={() => setActionType('add')}
                className="flex-1"
              >
                Add
              </Button>
              <Button
                size="sm"
                variant={actionType === 'remove' ? 'default' : 'outline'}
                onClick={() => setActionType('remove')}
                className="flex-1"
              >
                Remove
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              {actionType === 'replace' && 'Replace all existing platforms with selected ones'}
              {actionType === 'add' && 'Add selected platforms to existing ones'}
              {actionType === 'remove' && 'Remove selected platforms from existing ones'}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={selectAll}>
              Select All
            </Button>
            <Button size="sm" variant="outline" onClick={selectNone}>
              Clear All
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setSelectedPlatforms(new Set(['twitter', 'facebook', 'instagram', 'linkedin']))}
            >
              Social Media
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setSelectedPlatforms(new Set(['blog', 'medium', 'devto', 'hashnode']))}
            >
              Blogs
            </Button>
          </div>

          {/* Platform Selection Grid */}
          <div className="grid grid-cols-3 gap-3">
            {AVAILABLE_PLATFORMS.map((platform) => {
              const Icon = platform.icon;
              const isSelected = selectedPlatforms.has(platform.id);
              
              return (
                <div
                  key={platform.id}
                  onClick={() => togglePlatform(platform.id)}
                  className={`
                    flex flex-col items-center justify-center p-3 rounded-lg border cursor-pointer transition-colors
                    ${isSelected 
                      ? 'bg-[#E669E8]/20 border-[#E669E8] text-white' 
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{platform.name}</span>
                  <Checkbox
                    checked={isSelected}
                    className="mt-2"
                    onCheckedChange={() => togglePlatform(platform.id)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              );
            })}
          </div>

          {selectedPlatforms.size > 0 && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm">
                <span className="font-medium">{selectedPlatforms.size}</span> platform{selectedPlatforms.size > 1 ? 's' : ''} selected
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {Array.from(selectedPlatforms).map(id => {
                  const platform = AVAILABLE_PLATFORMS.find(p => p.id === id);
                  return platform ? (
                    <Badge key={id} variant="secondary" className="text-xs">
                      {platform.name}
                    </Badge>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || selectedPlatforms.size === 0}
          >
            {loading ? 'Updating...' : `Update ${itemCount} Items`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};