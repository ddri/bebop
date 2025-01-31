import Link from 'next/link';

export default function Navigation({ pathname }: { pathname: string }) {
  return (
    <nav className="bg-slate-800 text-white p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <span className="text-xl font-bold">Bebop</span>
          <div className="flex space-x-6">
            <Link 
              href="/collections" 
              className={`${pathname === '/collections' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
            >
              Collections
            </Link>
            <Link 
              href="/" 
              className={`${pathname === '/' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
            >
              Topics
            </Link>
            <Link 
              href="/media" 
              className={`${pathname === '/media' ? 'text-yellow-300' : 'hover:text-yellow-300'}`}
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
  );
}