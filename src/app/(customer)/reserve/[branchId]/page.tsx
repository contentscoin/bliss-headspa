import type { Metadata } from "next";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import {
  LocalBusinessSchema,
  BreadcrumbSchema,
  type BranchForSchema,
} from "@/components/shared/StructuredData";
import ReserveClient from "./ReserveClient";

const SITE_URL = "https://medicalheadspa.kr";

type BranchRecord = {
  _id: Id<"branches">;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  businessHours: string;
  region: string;
};

async function fetchBranch(branchId: string): Promise<BranchRecord | null> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) return null;
  try {
    const client = new ConvexHttpClient(convexUrl);
    const branch = await client.query(api.branches.getById, {
      branchId: branchId as Id<"branches">,
    });
    return (branch as BranchRecord | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ branchId: string }>;
}): Promise<Metadata> {
  const { branchId } = await params;
  const branch = await fetchBranch(branchId);

  if (!branch) {
    return {
      title: "지점 정보 없음",
      description: "요청하신 지점을 찾을 수 없습니다.",
    };
  }

  const title = `${branch.name} 예약 | 메디컬 헤드스파 ${branch.region}`;
  const description = `${branch.region} ${branch.name} 두피 스캘프 케어 예약. 주소: ${branch.address}. 영업시간: ${branch.businessHours}. 바우처 코드로 1분 만에 예약하세요.`;
  const url = `${SITE_URL}/reserve/${branchId}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: "메디컬 헤드스파",
      locale: "ko_KR",
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${branch.name} — 메디컬 헤드스파`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
  };
}

export default async function ReservePage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const branch = await fetchBranch(branchId);

  return (
    <>
      {branch && (
        <>
          <LocalBusinessSchema branch={branch as unknown as BranchForSchema} />
          <BreadcrumbSchema
            items={[
              { name: "홈", url: `${SITE_URL}/` },
              {
                name: `${branch.region} 지점`,
                url: `${SITE_URL}/?region=${encodeURIComponent(branch.region)}`,
              },
              { name: branch.name, url: `${SITE_URL}/reserve/${branchId}` },
            ]}
          />
        </>
      )}
      <ReserveClient branchId={branchId} />
    </>
  );
}
