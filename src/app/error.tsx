"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-muted-foreground mb-4">!</h1>
        <h2 className="text-xl font-semibold mb-2">문제가 발생했습니다</h2>
        <p className="text-muted-foreground mb-8">
          일시적인 오류가 발생했습니다. 다시 시도해 주세요.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          다시 시도
        </button>
      </div>
    </div>
  );
}
