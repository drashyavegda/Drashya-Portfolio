import Link from 'next/link';
import { Home, TerminalSquare } from 'lucide-react';

export const metadata = { title: '404 — Page not found' };

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center px-6 pt-16">
      <div className="max-w-lg text-center">
        <p className="font-mono text-xs uppercase tracking-[0.4em] text-neon">Error 404</p>
        <h1 className="mt-4 font-display text-6xl font-bold gradient-text sm:text-7xl">404</h1>
        <div className="glass-card mx-auto mt-8 max-w-md p-5 text-left">
          <p className="mb-2 flex items-center gap-2 font-mono text-xs text-muted">
            <TerminalSquare className="h-3.5 w-3.5 text-neon" aria-hidden /> visitor@portfolio:~$
          </p>
          <p className="font-mono text-sm text-red-400">
            segment fault: page not found in this scope.
          </p>
          <p className="mt-1 font-mono text-xs text-muted">
            The link may be broken, or the page was moved. Try debugging via the homepage.
          </p>
        </div>
        <Link href="/" className="btn-primary mt-8">
          <Home className="h-4 w-4" aria-hidden /> Back to Home
        </Link>
      </div>
    </div>
  );
}
