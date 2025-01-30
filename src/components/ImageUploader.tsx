import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Image as ImageIcon, Loader2 } from 'lucide-react';

interface ImageUploaderProps {
  onImageInsert: (markdownText: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageInsert }) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Reset state
    setError(null);
    setUploading(true);
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      setUploading(false);
      event.target.value = ''; // Reset input
      return;
    }
    
    // Validate file size (e.g., 5MB limit)
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > MAX_SIZE) {
      setError('Image must be less than 5MB');
      setUploading(false);
      event.target.value = ''; // Reset input
      return;
    }
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const mediaItem = await response.json();
      if (!mediaItem.url) {
        throw new Error('No URL returned from upload');
      }
      
      // Insert the markdown image syntax
      // Use the original filename as the alt text, but clean it up first
      const altText = file.name
        .replace(/\.[^/.]+$/, '') // Remove extension
        .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
        .replace(/\s+/g, ' ') // Remove extra spaces
        .trim();
      
      onImageInsert(`\n![${altText}](${mediaItem.url})\n`);
      
      // Reset input for next upload
      event.target.value = '';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div className="relative inline-block">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        title="Insert Image"
        disabled={uploading}
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        {uploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <ImageIcon className="h-4 w-4" />
        )}
      </Button>
      
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleUpload}
        disabled={uploading}
      />
      
      {error && (
        <Alert 
          variant="destructive" 
          className="absolute top-full mt-2 w-64 z-50"
        >
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ImageUploader;