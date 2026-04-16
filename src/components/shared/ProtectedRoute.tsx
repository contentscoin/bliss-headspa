"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";

type UserRole = "customer" | "branch_admin" | "buyer" | "super_admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export default function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      // 점주 영역이면 점주 로그인, 그 외는 CMS 로그인
      const loginPath = pathname.startsWith("/store")
        ? "/store/login"
        : "/cms/login";
      router.replace(loginPath);
    }
  }, [isLoading, isAuthenticated, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-muted border-t-brand-gold animate-spin" />
          <p className="text-sm text-muted-foreground">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!allowedRoles.includes(user!.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">접근 권한 없음</h1>
        <p className="text-muted-foreground">이 페이지에 접근할 권한이 없습니다.</p>
        <button
          onClick={() => router.back()}
          className="text-primary underline"
        >
          이전 페이지로 돌아가기
        </button>
      </div>
    );
  }

  return <>{children}</>;
}
