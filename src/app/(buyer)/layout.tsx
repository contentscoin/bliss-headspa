"use client";

import Link from "next/link";
import { LogOut, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import { useAuth } from "@/lib/auth";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["buyer", "super_admin"]}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b bg-card/95 border-border backdrop-blur supports-[backdrop-filter]:bg-card/80">
          <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
            <Link href="/my-vouchers" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-navy">
                <Sparkles className="size-4 text-brand-gold" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                내 바우처
              </span>
            </Link>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-muted-foreground hidden sm:inline">{user.name}</span>
              )}
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut className="size-4" />
                <span className="hidden sm:inline">로그아웃</span>
              </button>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-lg hover:bg-muted"
              >
                홈으로
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 bg-background">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
