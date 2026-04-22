"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
          isHome
            ? "bg-brand-navy/95 border-white/10 backdrop-blur supports-[backdrop-filter]:bg-brand-navy/80"
            : "bg-card/95 border-border backdrop-blur supports-[backdrop-filter]:bg-card/80"
        }`}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
                isHome
                  ? "bg-brand-gold/20"
                  : "bg-brand-navy"
              }`}
            >
              <Sparkles
                className={`size-4 ${
                  isHome ? "text-brand-gold" : "text-brand-gold"
                }`}
              />
            </div>
            <span
              className={`text-lg font-bold tracking-tight ${
                isHome ? "text-white" : "text-foreground"
              }`}
            >
              Medical Headspa
            </span>
          </Link>
          <Link
            href="/lookup"
            className={`text-sm font-medium transition-colors px-3 py-1.5 rounded-lg ${
              isHome
                ? "text-white/70 hover:text-white hover:bg-white/10"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            예약조회
          </Link>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col gap-6">
            {/* Top row: brand + quick links */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-brand-gold" />
                <span className="text-sm font-semibold text-foreground">
                  Medical Headspa
                </span>
              </div>
              <div className="flex items-center gap-6 text-xs text-muted-foreground">
                <Link
                  href="/store/login"
                  className="hover:text-foreground transition-colors"
                >
                  점주 로그인
                </Link>
                <Link
                  href="/cms/login"
                  className="hover:text-foreground transition-colors"
                >
                  관리자
                </Link>
              </div>
            </div>

            {/* Business registration info */}
            <div className="border-t pt-6 text-xs text-muted-foreground leading-relaxed space-y-1.5">
              <p className="font-medium text-foreground">
                주식회사 더에이치클럽 <span className="text-muted-foreground font-normal">| 대표: 신태수</span>
              </p>
              <p>사업자등록번호: 809-88-02801</p>
              <p>
                이메일:{" "}
                <a
                  href="mailto:company@holeinoneclub.kr"
                  className="hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  company@holeinoneclub.kr
                </a>
              </p>
              <p className="text-[11px] pt-1">
                본 사업자는 예약 사이트 운영사이며, 각 지점의 시술·서비스 제공 주체가 아닙니다.
              </p>
              <p className="pt-2">
                © {new Date().getFullYear()} 주식회사 더에이치클럽. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
