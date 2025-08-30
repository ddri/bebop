'use client';

import React from 'react';
import { Twitter, Facebook, Instagram, Linkedin, Globe, Hash } from 'lucide-react';

interface PlatformData {
  platform: string;
  views: number;
  engagement: number;
  shares: number;
  percentage: number;
}

interface PlatformBreakdownProps {
  platforms: PlatformData[];
}

const getPlatformIcon = (platform: string) => {
  const icons: Record<string, React.ElementType> = {
    'Twitter': Twitter,
    'Facebook': Facebook,
    'Instagram': Instagram,
    'LinkedIn': Linkedin,
    'Blog': Globe,
    'Medium': Hash
  };
  return icons[platform] || Globe;
};

const getPlatformColor = (platform: string) => {
  const colors: Record<string, string> = {
    'Twitter': 'bg-blue-400',
    'Facebook': 'bg-blue-600',
    'Instagram': 'bg-pink-500',
    'LinkedIn': 'bg-blue-700',
    'Blog': 'bg-green-500',
    'Medium': 'bg-gray-600'
  };
  return colors[platform] || 'bg-gray-400';
};

export const PlatformBreakdown: React.FC<PlatformBreakdownProps> = ({ platforms }) => {
  const totalViews = platforms.reduce((sum, p) => sum + p.views, 0);
  
  return (
    <div className="space-y-6">
      {/* Donut Chart */}
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            {(() => {
              let cumulativePercentage = 0;
              return platforms.map((platform, index) => {
                const strokeDasharray = `${platform.percentage * 3.14159 * 2} ${100 * 3.14159 * 2}`;
                const strokeDashoffset = -cumulativePercentage * 3.14159 * 2;
                cumulativePercentage += platform.percentage;
                
                return (
                  <circle
                    key={index}
                    cx="96"
                    cy="96"
                    r="64"
                    fill="none"
                    stroke={
                      platform.platform === 'Twitter' ? '#60A5FA' :
                      platform.platform === 'Facebook' ? '#2563EB' :
                      platform.platform === 'Instagram' ? '#EC4899' :
                      platform.platform === 'LinkedIn' ? '#1E40AF' :
                      platform.platform === 'Blog' ? '#10B981' :
                      '#6B7280'
                    }
                    strokeWidth="32"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all hover:opacity-80"
                  />
                );
              });
            })()}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p className="text-2xl font-bold">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Total Views</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Platform List */}
      <div className="space-y-3">
        {platforms.map((platform) => {
          const Icon = getPlatformIcon(platform.platform);
          
          return (
            <div key={platform.platform} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{platform.platform}</span>
                  <span className="text-sm text-muted-foreground">
                    {platform.percentage.toFixed(1)}%
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {platform.views.toLocaleString()} views
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`${getPlatformColor(platform.platform)} h-2 rounded-full transition-all`}
                  style={{ width: `${platform.percentage}%` }}
                />
              </div>
              
              {/* Additional Metrics */}
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Engagement: {platform.engagement.toLocaleString()}</span>
                <span>Shares: {platform.shares.toLocaleString()}</span>
                <span>Eng. Rate: {((platform.engagement / platform.views) * 100).toFixed(1)}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};