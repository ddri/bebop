'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { FileText, Album, Image, Pencil } from 'lucide-react';
import Layout from '@/components/Layout';

export default function Home() {
  const pathname = usePathname();

  return (
    <Layout pathname={pathname}>
      <div className="max-w-4xl mx-auto">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 dark:text-white">Welcome to Bebop</h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Your content management system for writing and publishing technical content.
          </p>
        </div>

        {/* Getting Started Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow md:col-span-2">
            <CardHeader>
              <Pencil className="h-8 w-8 mb-2 text-yellow-500" />
              <CardTitle>Write Mode</CardTitle>
              <CardDescription>
                Our focused writing environment with live preview and rich media support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/write">
                <Button className="w-full bg-yellow-400 hover:bg-yellow-500 text-black">
                  Start Writing
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <FileText className="h-8 w-8 mb-2 text-yellow-500" />
              <CardTitle>Topics</CardTitle>
              <CardDescription>
                Manage and organize all your written content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/topics">
                <Button className="w-full">
                  View Topics
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Album className="h-8 w-8 mb-2 text-yellow-500" />
              <CardTitle>Collections</CardTitle>
              <CardDescription>
                Group topics together and publish them anywhere
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/collections">
                <Button className="w-full">
                  Manage Collections
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
            <CardDescription>
              Here's the basic idea of Bebop:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">1. Write your content</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Use the Write Mode for a focused writing environment with markdown support, live preview, and media embedding.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">2. Organize with collections</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Group related content into collections. You can reorder them and publish the entire collection together.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">3. Publish anywhere</h3>
              <p className="text-slate-600 dark:text-slate-400">
                Publish your collections directly to blogs like Dev.to, Hashnode, or as standalone web pages.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Tips */}
        <Card>
          <CardHeader>
            <CardTitle>About Bebop</CardTitle>
            <CardDescription>
              Bebop is an open source publishing project by <a href="https://davidryan.tech">David Ryan</a>. This is the 0.2.0 release which adds basic cloud hosting, images, and publish modes to the previous version. See the <a href="https://github.com/ddri/bebop/releases">release notes</a> for more info and the <a href="https://github.com/ddri/bebop">repository</a> for the source.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </Layout>
  );
}