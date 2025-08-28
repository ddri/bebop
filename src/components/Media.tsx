"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Plus, Image as ImageIcon, AlertCircle, Clock, MoreVertical, Trash2, Link as LinkIcon } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useMedia } from '@/hooks/useMedia';

export default function Media({ pathname: _pathname }: { pathname: string }) {
  const { mediaItems, loading, error, refreshMedia } = useMedia();
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

// Add these functions back in where the comment "// ... formatFileSize and other functions remain the same ..." was

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    const file = e.target.files[0];
    
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('Only image files are allowed');
      return;
    }

    setUploadError(null);
    setSelectedFile(file);
  }
};

const handleUpload = async () => {
  if (!selectedFile) return;
  
  setUploading(true);
  setUploadError(null);
  
  const formData = new FormData();
  formData.append('file', selectedFile);
  
  try {
    const response = await fetch('/api/media', {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload file');
    }
    
    await refreshMedia();  // Refresh the media list after successful upload
    setUploadDialogOpen(false);
    setSelectedFile(null);
  } catch (err) {
    setUploadError(err instanceof Error ? err.message : 'Failed to upload file');
  } finally {
    setUploading(false);
  }
};

const handleDelete = async (id: string) => {
  try {
    const response = await fetch(`/api/media/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete file');
    }
    
    await refreshMedia();
  } catch (err) {
    console.error('Failed to delete media:', err);
  }
};

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-white">Media Library</h1>
        <Button 
          onClick={() => setUploadDialogOpen(true)}
          className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8 text-slate-300">
            Loading media...
          </div>
        ) : mediaItems.length > 0 ? (
          mediaItems.map((item) => (
            <Card key={item.id} className="bg-[#1c1c1e] border-0 hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="w-full aspect-video bg-[#2f2f2d] rounded-md overflow-hidden relative">
                  <Image
                    src={item.url}
                    alt={item.filename}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-[#E669E8] hover:text-white">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-[#2f2f2d] border-slate-700">
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(item.url);
                      }}
                      className="text-white hover:bg-[#E669E8] hover:text-white"
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Copy URL
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-medium truncate mb-1 text-white">
                  {item.filename}
                </div>
                <div className="flex items-center space-x-4 text-sm text-slate-300">
                  <div className="flex items-center">
                    <ImageIcon className="h-4 w-4 mr-1" />
                    {formatFileSize(item.size)}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(item.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-300">
            <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No media items yet</p>
            <p className="text-sm">Upload your first image to get started</p>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="bg-[#1c1c1e] border-0">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Media</DialogTitle>
            <DialogDescription className="text-slate-300">
              Upload an image to your media library. Max size: 5MB. Supported formats: JPG, PNG, GIF, WebP
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="cursor-pointer bg-[#2f2f2d] border-slate-700 text-white"
            />
            {selectedFile && (
              <p className="text-sm text-slate-300">
                Selected: {selectedFile.name} ({formatFileSize(selectedFile.size)})
              </p>
            )}
            {uploadError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{uploadError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setUploadDialogOpen(false);
                setSelectedFile(null);
                setUploadError(null);
              }}
              disabled={uploading}
              className="text-white border-slate-700 hover:bg-[#2f2f2d]"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || uploading || !!uploadError}
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}