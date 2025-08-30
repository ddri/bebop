'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  change?: number;
  prefix?: string;
  suffix?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  prefix,
  suffix
}) => {
  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-500';
    if (change < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className="w-4 h-4 text-muted-foreground" />
          {change !== undefined && change !== 0 && (
            <div className={`flex items-center text-xs ${getChangeColor(change)}`}>
              {change > 0 ? (
                <ArrowUp className="w-3 h-3 mr-0.5" />
              ) : (
                <ArrowDown className="w-3 h-3 mr-0.5" />
              )}
              {Math.abs(change)}%
            </div>
          )}
        </div>
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">
            {prefix}{value}{suffix}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};