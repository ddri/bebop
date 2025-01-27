// src/components/Layout.tsx
import Link from 'next/link';

interface LayoutProps {
  children: React.ReactNode;
  pathname: string;
}

export default function Layout({ children, pathname }: LayoutProps) {
  // Don't show the navigation on the landing page
  if (pathname === '/') {
    return children;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Navigation Bar */}
      <nav className="bg-slate-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-xl font-bold hover:text-yellow-300"
            >
              Bebop
            </Link>
            <div className="flex space-x-6">
              <Link 
                href="/collections" 
                className={`${pathname === '/collections' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
              >
                Collections
              </Link>
              <Link 
                href="/topics" 
                className={`${pathname === '/topics' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
              >
                Topics
              </Link>
              <Link 
                href="#" 
                className="hover:text-yellow-300"
              >
                Media
              </Link>
              <Link 
                href="/settings" 
                className={`${pathname === '/settings' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="container mx-auto p-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
}