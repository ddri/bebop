"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export default function Media({ pathname }: { pathname: string }) {
  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">Media Library</h1>
        <Button 
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold"
        >
          <Plus className="w-4 h-4 mr-2" />
          Upload Media
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        <div className="col-span-full text-center py-8 text-slate-500">
          No media items yet. Click "Upload Media" to add some.
        </div>
      </div>
    </div>
  );
}