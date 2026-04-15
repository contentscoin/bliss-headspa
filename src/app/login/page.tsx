"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ROLE_REDIRECTS: Record<string, string> = {
  super_admin: "/dashboard",
  branch_admin: "/my-branch",
  buyer: "/my-vouchers",
  customer: "/",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(ROLE_REDIRECTS[user.role] ?? "/");
    }
  }, [isAuthenticated, user, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("올바른 이메일 형식을 입력해 주세요.");
      return;
    }
    if (password.length < 6) {
      setError("비밀번호는 최소 6자 이상이어야 합니다.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success("로그인되었습니다");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "로그인에 실패했습니다.";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-6 px-4">
        <div className="rounded-lg border bg-white p-8 shadow-sm">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold">BLISS HEADSPA</h1>
            <p className="mt-2 text-gray-600">로그인</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                이메일
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일을 입력하세요"
                className="w-full min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                비밀번호
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="w-full min-h-[44px] rounded-md border border-gray-300 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? "로그인 중..." : "로그인"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
