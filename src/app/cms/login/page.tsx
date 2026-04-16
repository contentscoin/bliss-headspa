"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2,  Lock, User } from "lucide-react";

const ROLE_REDIRECTS: Record<string, string> = {
  super_admin: "/cms/dashboard",
  branch_admin: "/store/my-branch",
  buyer: "/my-vouchers",
  customer: "/",
};

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
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

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!loginId.trim()) {
      setError("아이디를 입력해 주세요.");
      return;
    }
    if (!password) {
      setError("비밀번호를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      await login(loginId.trim(), password);
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
    <div className="flex min-h-screen">
      {/* Left - Brand Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative overflow-hidden items-center justify-center">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full" />
        </div>

        <div className="relative z-10 text-center px-12 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm mb-8">
            <div className="w-2 h-2 rounded-full bg-brand-gold animate-pulse" />
            <span className="text-brand-gold-light text-sm font-medium">Premium Medical Spa</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
            Medical<br />Headspa
          </h1>
          <div className="w-12 h-0.5 bg-brand-gold mx-auto mb-6" />
          <p className="text-white/60 text-base leading-relaxed max-w-sm mx-auto">
            프리미엄 메디컬 헤드스파<br />
            관리자 시스템
          </p>
        </div>
      </div>

      {/* Right - Login Form */}
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <div className="w-full max-w-[400px] space-y-8 animate-slide-up">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-4">
            <h1 className="text-2xl font-bold text-gradient-gold">Medical Headspa</h1>
            <p className="text-sm text-muted-foreground mt-1">관리자 로그인</p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-brand">
            <div className="mb-8 text-center hidden lg:block">
              <h2 className="text-xl font-bold text-foreground">관리자 로그인</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                서비스 관리를 위해 로그인해 주세요
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="loginId">아이디</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="loginId"
                    type="text"
                    required
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="아이디를 입력하세요"
                    className="min-h-[44px] pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    className="min-h-[44px] pl-10"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full min-h-[44px] bg-brand-navy hover:bg-brand-navy-light text-white"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    로그인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Medical Headspa. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
