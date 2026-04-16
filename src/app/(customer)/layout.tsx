"use client";

import Link from "next/link";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold tracking-tight">
            BLISS HEADSPA
          </Link>
          <Link
            href="/lookup"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            예약조회
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground space-y-2">
          <p>&copy; {new Date().getFullYear()} BLISS HEADSPA. All rights reserved.</p>
          <Link
            href="/store/login"
            className="text-muted-foreground/60 hover:text-muted-foreground transition-colors"
          >
            점주 로그인
          </Link>
        </div>
      </footer>
    </div>
  );
}
