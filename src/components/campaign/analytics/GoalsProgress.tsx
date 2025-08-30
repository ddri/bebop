'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Clock, TrendingUp } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target: number;
  current: number;
  progress: number;
  status: 'pending' | 'in_progress' | 'completed';
}

interface GoalsProgressProps {
  goals: Goal[];
}

export const GoalsProgress: React.FC<GoalsProgressProps> = ({ goals }) => {
  const getStatusIcon = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Target className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: Goal['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-yellow-500';
    if (progress >= 50) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const completedGoals = goals.filter(g => g.status === 'completed').length;
  const overallProgress = goals.reduce((sum, g) => sum + g.progress, 0) / goals.length;

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Goals Overview</CardTitle>
          <CardDescription>
            {completedGoals} of {goals.length} goals completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{overallProgress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-[#E669E8] h-3 rounded-full transition-all"
                style={{ width: `${Math.min(overallProgress, 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(goal.status)}
                  <CardTitle className="text-base">{goal.name}</CardTitle>
                </div>
                {getStatusBadge(goal.status)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`${getProgressColor(goal.progress)} h-2 rounded-full transition-all`}
                      style={{ width: `${Math.min(goal.progress, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{goal.progress.toFixed(1)}% complete</span>
                    {goal.progress < 100 && (
                      <span>{(goal.target - goal.current).toLocaleString()} remaining</span>
                    )}
                  </div>
                </div>

                {/* Trend Indicator */}
                {goal.status === 'in_progress' && (
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    <span className="text-muted-foreground">
                      On track to complete in 5 days
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add New Goal Button */}
      <Card className="border-dashed">
        <CardContent className="flex items-center justify-center py-6">
          <button className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <Target className="w-5 h-5" />
            <span>Add New Goal</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
};