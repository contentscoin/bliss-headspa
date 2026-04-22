import Script from "next/script";

/**
 * JSON-LD structured data helpers.
 *
 * These emit <script type="application/ld+json"> that Google, Bing,
 * Naver, and AI crawlers (ChatGPT, Claude, Perplexity) parse to build
 * knowledge graphs and citations. Keep values factually accurate —
 * LLMs down-weight pages when JSON-LD disagrees with visible content.
 */

const SITE_URL = "https://medicalheadspa.kr";
const BRAND_NAME = "Medical Headspa";
const BRAND_NAME_KO = "메디컬 헤드스파";
const LEGAL_NAME = "주식회사 더에이치클럽";
const FOUNDER = "신태수";
const BIZ_NUMBER = "809-88-02801";
const EMAIL = "company@holeinoneclub.kr";

type JsonLdProps = { id: string; data: Record<string, unknown> };

function JsonLd({ id, data }: JsonLdProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Site-wide Organization schema (emit once in root layout). */
export function OrganizationSchema() {
  return (
    <JsonLd
      id="ld-organization"
      data={{
        "@context": "https://schema.org",
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: BRAND_NAME_KO,
        alternateName: [BRAND_NAME, "medicalheadspa"],
        legalName: LEGAL_NAME,
        url: SITE_URL,
        logo: `${SITE_URL}/og-image.png`,
        email: EMAIL,
        founder: { "@type": "Person", name: FOUNDER },
        taxID: BIZ_NUMBER,
        vatID: BIZ_NUMBER,
        description:
          "전국 지점에서 전문 두피 스캘프 케어와 메디컬 헤드스파 바우처 예약을 제공하는 프리미엄 두피 케어 플랫폼.",
        areaServed: { "@type": "Country", name: "대한민국" },
        contactPoint: {
          "@type": "ContactPoint",
          email: EMAIL,
          contactType: "customer support",
          availableLanguage: ["Korean", "ko-KR"],
        },
      }}
    />
  );
}

/** Site-wide WebSite schema with SearchAction (emit once in root layout). */
export function WebsiteSchema() {
  return (
    <JsonLd
      id="ld-website"
      data={{
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: `${BRAND_NAME_KO} | ${BRAND_NAME}`,
        inLanguage: "ko-KR",
        publisher: { "@id": `${SITE_URL}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: `${SITE_URL}/lookup?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

export type BranchForSchema = {
  _id: string;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lng: number;
  businessHours: string;
  region: string;
};

/** Per-branch LocalBusiness schema (emit on /reserve/[branchId] pages). */
export function LocalBusinessSchema({ branch }: { branch: BranchForSchema }) {
  const url = `${SITE_URL}/reserve/${branch._id}`;
  // businessHours is a free-text field like "10:00-20:00" — parse once here
  const hours = parseHours(branch.businessHours);

  return (
    <JsonLd
      id={`ld-branch-${branch._id}`}
      data={{
        "@context": "https://schema.org",
        "@type": ["HealthAndBeautyBusiness", "LocalBusiness"],
        "@id": `${url}#localbusiness`,
        name: `${BRAND_NAME_KO} ${branch.name}`,
        image: `${SITE_URL}/og-image.png`,
        logo: `${SITE_URL}/og-image.png`,
        url,
        telephone: branch.phone,
        email: EMAIL,
        priceRange: "₩₩",
        address: {
          "@type": "PostalAddress",
          streetAddress: branch.address,
          addressRegion: branch.region,
          addressCountry: "KR",
        },
        geo: {
          "@type": "GeoCoordinates",
          latitude: branch.lat,
          longitude: branch.lng,
        },
        openingHoursSpecification: hours
          ? [
              {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: [
                  "Monday",
                  "Tuesday",
                  "Wednesday",
                  "Thursday",
                  "Friday",
                  "Saturday",
                  "Sunday",
                ],
                opens: hours.opens,
                closes: hours.closes,
              },
            ]
          : undefined,
        parentOrganization: { "@id": `${SITE_URL}#organization` },
        potentialAction: {
          "@type": "ReserveAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: url,
            actionPlatform: [
              "http://schema.org/DesktopWebPlatform",
              "http://schema.org/MobileWebPlatform",
            ],
          },
          result: {
            "@type": "Reservation",
            name: "메디컬 헤드스파 예약",
          },
        },
      }}
    />
  );
}

function parseHours(hoursStr: string): { opens: string; closes: string } | null {
  const m = hoursStr.match(/(\d{1,2}:\d{2})\s*[-~]\s*(\d{1,2}:\d{2})/);
  if (!m) return null;
  return { opens: m[1], closes: m[2] };
}

export type FaqItem = { question: string; answer: string };

/** FAQPage schema — emits on pages that render the matching FAQ UI. */
export function FaqSchema({ items, id = "ld-faq" }: { items: FaqItem[]; id?: string }) {
  return (
    <JsonLd
      id={id}
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: items.map((it) => ({
          "@type": "Question",
          name: it.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: it.answer,
          },
        })),
      }}
    />
  );
}

export type BreadcrumbItem = { name: string; url: string };

/** BreadcrumbList schema for deep pages. */
export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  return (
    <JsonLd
      id="ld-breadcrumbs"
      data={{
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((it, idx) => ({
          "@type": "ListItem",
          position: idx + 1,
          name: it.name,
          item: it.url,
        })),
      }}
    />
  );
}
