"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
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
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <Link href="/my-vouchers" className="text-lg font-bold tracking-tight">
              내 바우처
            </Link>
            <div className="flex items-center gap-3">
              {user && (
                <span className="text-sm text-muted-foreground">{user.name}</span>
              )}
              <button
                onClick={() => logout()}
                className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              >
                <LogOut className="size-4" />
                로그아웃
              </button>
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                홈으로
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
