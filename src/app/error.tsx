"use client";

import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-gradient-warm">
      <div className="text-center animate-fade-in max-w-md">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-red-50 mb-6">
          <AlertTriangle className="size-8 text-red-500" />
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-3">
          문제가 발생했습니다
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          페이지를 불러오는 중 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center rounded-xl bg-brand-navy px-6 py-3 text-sm font-semibold text-white hover:bg-brand-navy-light transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
