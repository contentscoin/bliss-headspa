import type { Metadata, Viewport } from "next";
import ConvexClientProvider from "./ConvexClientProvider";
import { Toaster } from "@/components/ui/sonner";
import {
  OrganizationSchema,
  WebsiteSchema,
} from "@/components/shared/StructuredData";
import "./globals.css";

const SITE_URL = "https://medicalheadspa.kr";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "메디컬 헤드스파 | 전국 두피 스캘프 케어 바우처 예약",
    template: "%s | 메디컬 헤드스파",
  },
  description:
    "전국 지점에서 전문적인 두피 스캘프 케어를 받을 수 있는 메디컬 헤드스파 공식 예약 플랫폼. 바우처 코드로 원하는 지점·날짜·시간을 1분 만에 예약하세요.",
  applicationName: "Medical Headspa",
  keywords: [
    "메디컬 헤드스파",
    "Medical Headspa",
    "두피 스캘프 케어",
    "두피 관리",
    "헤드스파 예약",
    "헤드스파 바우처",
    "강남 헤드스파",
    "서울 헤드스파",
    "두피 마사지",
    "스캘프 클렌징",
  ],
  authors: [{ name: "주식회사 더에이치클럽" }],
  creator: "주식회사 더에이치클럽",
  publisher: "주식회사 더에이치클럽",
  category: "health",
  alternates: {
    canonical: "/",
    languages: { "ko-KR": "/" },
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "메디컬 헤드스파",
    title: "메디컬 헤드스파 | 전국 두피 스캘프 케어 바우처 예약",
    description:
      "전국 지점에서 전문 두피 스캘프 케어를 경험하세요. 바우처 코드로 원하는 지점·날짜·시간을 1분 만에 예약할 수 있는 공식 예약 플랫폼.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "메디컬 헤드스파 — medicalheadspa.kr",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "메디컬 헤드스파 | 전국 두피 스캘프 케어 바우처 예약",
    description:
      "전국 지점 두피 스캘프 케어 바우처를 1분 만에 예약하세요. 메디컬 헤드스파 공식 예약 플랫폼.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/og-image.png",
  },
  other: {
    // Helps AI crawlers and rich snippets understand the business entity
    "og:email": "company@holeinoneclub.kr",
    "og:country-name": "KR",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f2027",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
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
        <OrganizationSchema />
        <WebsiteSchema />
      </head>
      <body className="min-h-full flex flex-col">
        <ConvexClientProvider>{children}</ConvexClientProvider>
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
