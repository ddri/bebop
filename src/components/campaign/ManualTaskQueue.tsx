'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2,
  Clock,
  Play,
  Globe,
  FileText,
  Calendar,
  User
} from 'lucide-react';
import { ManualTask } from '@/types/campaigns';

interface ManualTaskQueueProps {
  tasks: ManualTask[];
  onUpdateTaskStatus: (id: string, status: 'todo' | 'in_progress' | 'completed') => Promise<void>;
  onDeleteTask: (id: string) => Promise<void>;
  loading?: boolean;
}

interface TaskItemProps {
  task: ManualTask;
  onUpdateStatus: (id: string, status: 'todo' | 'in_progress' | 'completed') => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdateStatus, onDelete }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: 'todo' | 'in_progress' | 'completed') => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(task.id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusIcon = () => {
    switch (task.status) {
      case 'todo':
        return <Clock className="w-4 h-4 text-slate-400" />;
      case 'in_progress':
        return <Play className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'todo':
        return 'bg-slate-600';
      case 'in_progress':
        return 'bg-yellow-600';
      case 'completed':
        return 'bg-green-600';
    }
  };

  return (
    <Card className="bg-[#1c1c1e] border-slate-700 mb-3">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              {getStatusIcon()}
              <div>
                <h4 className="font-medium text-white">{task.title}</h4>
                {task.description && (
                  <p className="text-sm text-slate-400 mt-1">{task.description}</p>
                )}
              </div>
            </div>
            <Badge className={getStatusColor()}>
              {task.status.replace('_', ' ')}
            </Badge>
          </div>

          {/* Platform & Due Date */}
          <div className="flex items-center gap-4 text-sm text-slate-400">
            {task.platform && (
              <div className="flex items-center gap-1">
                <Globe className="w-3 h-3" />
                {task.platform}
              </div>
            )}
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(task.dueDate).toLocaleDateString()}
              </div>
            )}
          </div>

          {/* Instructions */}
          {task.instructions && (
            <div className="bg-slate-800 p-3 rounded-md">
              <p className="text-sm text-slate-300">{task.instructions}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            {task.status === 'todo' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange('in_progress')}
                disabled={isUpdating}
                className="text-xs"
              >
                Start Task
              </Button>
            )}
            {task.status === 'in_progress' && (
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleStatusChange('completed')}
                disabled={isUpdating}
                className="text-xs"
              >
                Mark Complete
              </Button>
            )}
            {task.status === 'completed' && (
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => handleStatusChange('todo')}
                disabled={isUpdating}
                className="text-xs"
              >
                Reopen
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const ManualTaskQueue: React.FC<ManualTaskQueueProps> = ({
  tasks,
  onUpdateTaskStatus,
  onDeleteTask,
  loading = false
}) => {
  const todoTasks = tasks.filter(task => task.status === 'todo');
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Loading manual tasks...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Todo Column */}
      <div className="space-y-4">
        <Card className="bg-[#2a2a2a] border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-slate-400" />
              To Do
              <Badge variant="secondary" className="ml-auto">
                {todoTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {todoTasks.length > 0 ? (
                todoTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task}
                    onUpdateStatus={onUpdateTaskStatus}
                    onDelete={onDeleteTask}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No pending tasks
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* In Progress Column */}
      <div className="space-y-4">
        <Card className="bg-[#2a2a2a] border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <Play className="w-5 h-5 text-yellow-500" />
              In Progress
              <Badge variant="secondary" className="ml-auto">
                {inProgressTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {inProgressTasks.length > 0 ? (
                inProgressTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task}
                    onUpdateStatus={onUpdateTaskStatus}
                    onDelete={onDeleteTask}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No tasks in progress
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Completed Column */}
      <div className="space-y-4">
        <Card className="bg-[#2a2a2a] border-slate-600">
          <CardHeader className="pb-3">
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              Completed
              <Badge variant="secondary" className="ml-auto">
                {completedTasks.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {completedTasks.length > 0 ? (
                completedTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task}
                    onUpdateStatus={onUpdateTaskStatus}
                    onDelete={onDeleteTask}
                  />
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  No completed tasks
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ManualTaskQueue;