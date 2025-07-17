'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Pencil, FileText, Library } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Home() {
  const pathname = usePathname();

  return (
    <Layout pathname={pathname}>
      <div className="max-w-7xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold mb-4 text-white">Welcome to Bebop</h1>
        <p className="text-xl text-slate-300 mb-12">
          Your content management system for writing and publishing technical content.
        </p>

        {/* Three Column Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Write Mode Card */}
          <div className="bg-[#1c1c1e] rounded-lg p-6 border-0 flex flex-col">
            <div className="flex items-center justify-center mb-4">
              <Pencil className="h-8 w-8 text-[#E669E8]" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-white">Write Mode</h2>
            <p className="text-slate-300 mb-6 flex-grow">
              Our focused writing environment with live preview and rich media support
            </p>
            <Link
              href="/write"
              className="block w-full bg-[#2f2f2d] hover:bg-[#E669E8] text-white py-3 px-4 rounded-md transition-colors border border-slate-700"
            >
              Start Writing
            </Link>
          </div>

          {/* Topics Card */}
          <div className="bg-[#1c1c1e] rounded-lg p-6 border-0 flex flex-col">
            <div className="flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-[#E669E8]" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-white">Topics</h2>
            <p className="text-slate-300 mb-6 flex-grow">
              Manage and organize all your written content
            </p>
            <Link
              href="/topics"
              className="block w-full bg-[#2f2f2d] hover:bg-[#E669E8] text-white py-3 px-4 rounded-md transition-colors border border-slate-700"
            >
              View Topics
            </Link>
          </div>

          {/* Collections Card */}
          <div className="bg-[#1c1c1e] rounded-lg p-6 border-0 flex flex-col">
            <div className="flex items-center justify-center mb-4">
              <Library className="h-8 w-8 text-[#E669E8]" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 text-white">Collections</h2>
            <p className="text-slate-300 mb-6 flex-grow">
              Group topics together and publish them anywhere
            </p>
            <Link
              href="/collections"
              className="block w-full bg-[#2f2f2d] hover:bg-[#E669E8] text-white py-3 px-4 rounded-md transition-colors border border-slate-700"
            >
              Manage Collections
            </Link>
          </div>
        </div>

        {/* Quick Tips */}
        <div className="bg-[#1c1c1e] rounded-lg p-6 text-left border-0">
          <h2 className="text-2xl font-semibold mb-4 text-white">Quick Tips</h2>
          <p className="text-slate-300 mb-4">Here&apos;s the basic idea of Bebop:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-300">
            <li>Write your content</li>
            <li>Organize it into topics</li>
            <li>Group topics into collections</li>
            <li>Publish anywhere</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
}