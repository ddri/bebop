// components/editor/cards/URLDetectorPopup.tsx

import React from 'react';
import { Button } from '@/components/ui/button';
import { CardDefinition } from './types';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
      <Popover>
        <PopoverTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="bg-white dark:bg-slate-800 shadow-md"
          >
            <Icon className="h-4 w-4 mr-2" />
            Transform to {cardType.name}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <div className="space-y-2">
            <h4 className="font-medium">Convert to {cardType.name}</h4>
            <p className="text-sm text-slate-500">
              This URL will be transformed into an embedded {cardType.name.toLowerCase()} card.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTransform()}
              >
                Transform
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}