"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
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

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  if (!allowedRoles.includes(user!.role)) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">접근 권한 없음</h1>
        <p className="text-gray-600">이 페이지에 접근할 권한이 없습니다.</p>
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
