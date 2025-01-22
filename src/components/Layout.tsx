import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
  pathname: string;
}

export default function Layout({ children, pathname }: LayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navigation pathname={pathname} />
      <div className="container mx-auto p-8 max-w-7xl">
        {children}
      </div>
    </div>
  );
}