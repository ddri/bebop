
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Globe, Box } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-xl font-bold">Bebop.</div>
            <div>
              <Link href="/collections">
                <Button variant="link" className="text-white hover:text-yellow-300">
                  Try Bebop <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl font-bold mb-6">
              Write, Organize, Publish
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              A content management platform for developers and technical writers. 
              Create collections of content and publish them anywhere.
            </p>
            <Link href="/collections">
              <Button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-6 text-lg rounded-lg">
                Try Bebop Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center">
            <div className="bg-slate-800 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Markdown Support</h3>
            <p className="text-slate-300">
              Write in Markdown with a live preview and easy formatting tools.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-slate-800 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Box className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Collections</h3>
            <p className="text-slate-300">
            Organize your content into collections and stage them for specific campaigns.
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-slate-800 w-16 h-16 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Globe className="h-8 w-8 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Publish Anywhere</h3>
            <p className="text-slate-300">
            Publish directly to Bebop hosting, or push to external sites like Hashnode, Medium, or your company blog.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-slate-400">
            <p>Built with vegemite by an Australian in Seattle</p>
          </div>
        </div>
      </footer>
    </div>
  );
}