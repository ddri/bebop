import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Pencil, 
  Eye, 
  Globe, 
  Trash2,
  FileText,
  Clock,
  MoreVertical
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Collection } from '@/types/collections';
import { SocialShareMetrics } from '@/types/social';

interface CollectionCardProps {
  collection: Collection;
  metrics?: SocialShareMetrics[];
  onEdit: (collection: Collection) => void;
  onPreview: (collection: Collection) => void;
  onPublish: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

const CollectionCard: React.FC<CollectionCardProps> = ({
  collection,
  metrics = [],
  onEdit,
  onPreview,
  onPublish,
  onDelete
}) => {
  return (
    <Card 
      className="group relative bg-[#1c1c1e] hover:scale-[1.00] hover:border hover:border-[#E669E8] transition-all duration-200 border-0 cursor-pointer"
      onClick={(e) => {
        // Only trigger if we didn't click on a button or dropdown
        if (!(e.target as HTMLElement).closest('button')) {
          onEdit(collection);
        }
      }}
    >
      {/* Status indicator */}
      <div className="absolute top-3 right-3 flex items-center gap-1.5">
        <div className={`h-2 w-2 rounded-full ${
          collection.publishedUrl ? 'bg-green-500' : 'bg-yellow-500'
        }`} 
        title={collection.publishedUrl ? 'Published' : 'Draft'} 
        />
      </div>
      
      {/* Main content */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-4">
          <h3 className="font-semibold text-lg truncate pr-8 text-white">
            {collection.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#E669E8] hover:bg-transparent"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-[#1c1c1e] border-slate-700 text-white">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onPreview(collection);
                }}
                className="hover:bg-[#E669E8] hover:text-white focus:bg-[#E669E8] focus:text-white"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onPublish(collection);
                }}
                className="hover:bg-[#E669E8] hover:text-white focus:bg-[#E669E8] focus:text-white"
              >
                <Globe className="h-4 w-4 mr-2" />
                Publish
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(collection);
                }}
                className="text-red-400 hover:bg-red-500 hover:text-white focus:bg-red-500 focus:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        {collection.description && (
          <div className="h-[60px] mb-4">
            <p className="text-sm text-slate-300 line-clamp-3" title={collection.description}>
              {collection.description}
            </p>
          </div>
        )}
        
        {/* Metrics row */}
        <div className="flex items-center justify-between text-sm text-slate-300">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              {collection.topicIds.length} topics
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {new Date(collection.lastEdited).toLocaleDateString()}
            </div>
          </div>
          
          {/* Social metrics */}
          {metrics.length > 0 && (
            <div className="flex items-center gap-2">
              {metrics.map((metric) => (
                <div 
                  key={metric.platformId}
                  className="flex items-center gap-1 text-xs"
                  title={`${metric.successCount} successful shares on ${metric.platformId}`}
                >
                  <div className={`h-2 w-2 rounded-full ${
                    metric.platformId === 'bluesky' ? 'bg-blue-500' : 
                    metric.platformId === 'mastodon' ? 'bg-purple-500' :
                    'bg-slate-500'
                  }`} />
                  {metric.shareCount}
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CollectionCard;