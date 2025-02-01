import React from 'react';
import { Button } from '@/components/ui/button';
import { CardDefinition } from './types';

interface URLDetectorPopupProps {
  cardType: CardDefinition;
  url: string;
  onTransform: () => void;
  position: { x: number; y: number };
}

export function URLDetectorPopup({ 
  cardType, 
  url, 
  onTransform,
  position 
}: URLDetectorPopupProps) {
  const Icon = cardType.icon;

  return (
    <div 
      className="absolute z-50"
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      }}
    >
      <Button
        size="sm"
        variant="outline"
        onClick={onTransform}
        className="bg-white dark:bg-slate-800 shadow-md"
      >
        <Icon className="h-4 w-4 mr-2" />
        Convert to {cardType.name}
      </Button>
    </div>
  );
}