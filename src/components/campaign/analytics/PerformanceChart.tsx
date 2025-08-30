'use client';

import React from 'react';

interface PerformanceData {
  date: string;
  views: number;
  engagement: number;
  shares: number;
}

interface PerformanceChartProps {
  data: PerformanceData[];
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No data available</div>;
  }

  const maxValue = Math.max(
    ...data.flatMap(d => [d.views, d.engagement, d.shares])
  );

  const getHeight = (value: number) => {
    return (value / maxValue) * 100;
  };

  return (
    <div className="space-y-4">
      {/* Chart */}
      <div className="relative h-64">
        <div className="absolute inset-0 flex items-end justify-between gap-1">
          {data.map((day, index) => (
            <div key={index} className="flex-1 flex flex-col items-center justify-end">
              <div className="w-full flex gap-0.5 items-end">
                <div
                  className="flex-1 bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                  style={{ height: `${getHeight(day.views)}%` }}
                  title={`Views: ${day.views}`}
                />
                <div
                  className="flex-1 bg-[#E669E8] rounded-t transition-all hover:bg-[#d15dd3]"
                  style={{ height: `${getHeight(day.engagement)}%` }}
                  title={`Engagement: ${day.engagement}`}
                />
                <div
                  className="flex-1 bg-green-500 rounded-t transition-all hover:bg-green-600"
                  style={{ height: `${getHeight(day.shares)}%` }}
                  title={`Shares: ${day.shares}`}
                />
              </div>
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 inset-y-0 flex flex-col justify-between text-xs text-muted-foreground -ml-8 w-6">
          <span>{Math.round(maxValue)}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>
      </div>
      
      {/* X-axis labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        {data.filter((_, i) => i % Math.ceil(data.length / 7) === 0).map((day, index) => (
          <span key={index}>
            {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </span>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded" />
          <span>Views</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#E669E8] rounded" />
          <span>Engagement</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded" />
          <span>Shares</span>
        </div>
      </div>
    </div>
  );
};