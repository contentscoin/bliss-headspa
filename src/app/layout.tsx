import type { Metadata } from "next";
import ConvexClientProvider from "./ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Medical Headspa | 메디컬 헤드스파",
    template: "%s | Medical Headspa",
  },
  description: "프리미엄 메디컬 헤드스파 바우처 예약 플랫폼. 전국 지점에서 전문적인 두피 케어를 경험하세요.",
  keywords: ["메디컬 헤드스파", "두피 케어", "바우처", "예약", "헤드스파"],
  openGraph: {
    title: "Medical Headspa | 프리미엄 두피 케어",
    description: "프리미엄 메디컬 헤드스파 바우처 예약 플랫폼",
    type: "website",
    locale: "ko_KR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
