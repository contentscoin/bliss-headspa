import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gradient-warm">
      <div className="text-center animate-fade-in max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-navy mb-6">
          <Sparkles className="size-8 text-brand-gold" />
        </div>
        <h1 className="text-6xl font-bold text-brand-navy mb-2">404</h1>
        <h2 className="text-xl font-semibold text-foreground mb-3">
          페이지를 찾을 수 없습니다
        </h2>
        <p className="text-muted-foreground text-sm mb-8">
          요청하신 페이지가 존재하지 않거나, 이동되었을 수 있습니다.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-navy-light transition-colors"
        >
          홈으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
