"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/shared/ProtectedRoute";

export default function BuyerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute allowedRoles={["buyer", "super_admin"]}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-14 items-center justify-between px-4">
            <Link href="/my-vouchers" className="text-lg font-bold tracking-tight">
              내 바우처
            </Link>
            <Link
              href="/"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              홈으로
            </Link>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </ProtectedRoute>
  );
}
