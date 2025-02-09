// components/ui/mini-graph.tsx
import React from 'react';
import { useTheme } from 'next-themes';

interface MiniGraphProps {
  data: number[];
  height?: number;
  width?: number;
}

export function MiniGraph({ data, height = 20, width = 50 }: MiniGraphProps) {
  const { theme } = useTheme();
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1; // Prevent division by zero

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={theme === 'dark' ? '#60A5FA' : '#3B82F6'}
        strokeWidth="1.5"
      />
    </svg>
  );
}