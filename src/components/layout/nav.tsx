import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { cookies } from 'next/headers';

export async function MainNav() {
  const cookieStore = await cookies();
  const token = cookieStore.get('ig_token');
  const isAuthenticated = !!token;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-4 pl-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold sm:inline-block">
              InstaPilot
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            <Link href="/" className="transition-colors hover:text-foreground/80 text-foreground">
              Dashboard
            </Link>
            <Link href="/settings" className="transition-colors hover:text-foreground/80 text-foreground/60">
              Settings
            </Link>
          </nav>
        </div>
        <div className="flex items-center pr-4">
          {isAuthenticated ? (
            <Button variant="outline" asChild>
              <Link href="/api/auth/logout">Disconnect Instagram</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/api/auth/instagram">Connect Instagram</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
