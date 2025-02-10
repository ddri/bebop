// components/templates/TemplateManager.tsx
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

export function TemplateManager() {
  return (
    <Card className="bg-[#1c1c1e] border-0">
      <CardHeader>
        <CardTitle className="text-white text-2xl">Templates & Documentation</CardTitle>
        <CardDescription className="text-slate-300">
          Import templates and documentation to help you get started with Bebop
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 rounded-lg bg-[#2f2f2d] border border-slate-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-white">Official Bebop Documentation</h3>
              <p className="text-slate-300">Getting started guides and feature documentation</p>
            </div>
            <Button 
              className="bg-[#E669E8] hover:bg-[#d15dd3] text-white"
              onClick={() => {
                // Import handler
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-slate-300">This will create:</p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-center">
              <span className="mr-2">•</span>
              A collection of getting started guides
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Documentation for all Bebop features
            </li>
            <li className="flex items-center">
              <span className="mr-2">•</span>
              Examples of best practices
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}