'use client';

import React from 'react';

interface HourlyData {
  hour: number;
  views: number;
}

interface EngagementHeatmapProps {
  data: HourlyData[];
}

export const EngagementHeatmap: React.FC<EngagementHeatmapProps> = ({ data }) => {
  const maxViews = Math.max(...data.map(d => d.views));
  
  const getIntensity = (views: number): string => {
    const percentage = (views / maxViews) * 100;
    if (percentage >= 80) return 'bg-[#E669E8]';
    if (percentage >= 60) return 'bg-[#E669E8]/80';
    if (percentage >= 40) return 'bg-[#E669E8]/60';
    if (percentage >= 20) return 'bg-[#E669E8]/40';
    return 'bg-[#E669E8]/20';
  };
  
  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour === 12) return '12 PM';
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };
  
  // Group hours into time periods
  const periods = [
    { label: 'Morning', hours: [6, 7, 8, 9, 10, 11] },
    { label: 'Afternoon', hours: [12, 13, 14, 15, 16, 17] },
    { label: 'Evening', hours: [18, 19, 20, 21, 22, 23] },
    { label: 'Night', hours: [0, 1, 2, 3, 4, 5] }
  ];

  return (
    <div className="space-y-4">
      {/* Heatmap Grid */}
      <div className="grid grid-cols-24 gap-1">
        {data.map((hourData) => (
          <div
            key={hourData.hour}
            className={`aspect-square rounded ${getIntensity(hourData.views)} transition-all hover:ring-2 hover:ring-[#E669E8] cursor-pointer`}
            title={`${formatHour(hourData.hour)}: ${hourData.views} views`}
          >
            <div className="w-full h-full flex items-center justify-center text-xs font-medium text-white/80">
              {hourData.hour}
            </div>
          </div>
        ))}
      </div>
      
      {/* Time Labels */}
      <div className="grid grid-cols-4 gap-2 text-center text-sm text-muted-foreground">
        <div>12 AM - 6 AM</div>
        <div>6 AM - 12 PM</div>
        <div>12 PM - 6 PM</div>
        <div>6 PM - 12 AM</div>
      </div>
      
      {/* Peak Times Summary */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Peak Engagement Times</h4>
        {periods.map((period) => {
          const periodData = data.filter(d => period.hours.includes(d.hour));
          const avgViews = periodData.reduce((sum, d) => sum + d.views, 0) / periodData.length;
          const maxPeriodHour = periodData.reduce((max, d) => d.views > max.views ? d : max);
          
          return (
            <div key={period.label} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded ${getIntensity(avgViews)}`} />
                <span className="text-sm">{period.label}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Peak: {formatHour(maxPeriodHour.hour)} ({maxPeriodHour.views} views)
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-4 text-xs">
        <span className="text-muted-foreground">Activity Level:</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#E669E8]/20 rounded" />
            <span>Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#E669E8]/40 rounded" />
            <span>Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#E669E8]/60 rounded" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#E669E8]/80 rounded" />
            <span>Very High</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-[#E669E8] rounded" />
            <span>Peak</span>
          </div>
        </div>
      </div>
    </div>
  );
};