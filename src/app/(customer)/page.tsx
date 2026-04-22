"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MapPin, Clock, Phone, ArrowRight, Sparkles, Shield, Calendar, Star } from "lucide-react";
import KakaoMap from "@/components/shared/KakaoMap";
import EmptyState from "@/components/shared/EmptyState";
import FAQSection from "@/components/shared/FAQSection";

const REGIONS = ["전체", "서울", "경기", "부산", "대구", "광주", "대전", "인천", "제주"];

export default function CustomerMainPage() {
  const [selectedRegion, setSelectedRegion] = useState("전체");

  const allBranches = useQuery(api.branches.list, { activeOnly: true });
  const filteredBranches = useQuery(
    api.branches.getByRegion,
    selectedRegion !== "전체" ? { region: selectedRegion } : "skip"
  );

  const branches = selectedRegion === "전체" ? allBranches : filteredBranches;
  const isLoading = branches === undefined;

  return (
    <div className="animate-fade-in">
      {/* ===== HERO SECTION ===== */}
      <section className="relative bg-gradient-hero text-white overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-brand-gold/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
          <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] border border-white/[0.03] rounded-full" />
        </div>

        <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm mb-6 animate-slide-down">
              <div className="w-1.5 h-1.5 rounded-full bg-brand-gold animate-pulse" />
              <span className="text-brand-gold-light text-xs font-medium tracking-wide uppercase">
                Premium Medical Spa
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight mb-4">
              전문적인 두피 케어,<br />
              <span className="text-gradient-gold">프리미엄 헤드스파</span>
            </h1>

            <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
              바우처 하나로 전국 어디서든 메디컬 헤드스파를 경험하세요.
              전문 관리사의 1:1 맞춤 두피 케어 서비스를 제공합니다.
            </p>

            <a
              href="#branches"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-gold text-brand-navy font-semibold text-sm hover:bg-brand-gold-light transition-colors shadow-gold"
            >
              지점 선택하기
              <ArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="py-12 sm:py-16 bg-gradient-warm">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 stagger-children">
            {[
              {
                icon: Shield,
                title: "전문 메디컬 케어",
                desc: "의료 전문가가 설계한 두피 관리 프로그램",
              },
              {
                icon: Star,
                title: "프리미엄 바우처",
                desc: "바우처 한 장으로 전국 지점 이용 가능",
              },
              {
                icon: Calendar,
                title: "간편 예약",
                desc: "원하는 날짜와 시간에 손쉽게 예약",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border shadow-brand card-hover"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-gold/10 shrink-0">
                  <feature.icon className="size-5 text-brand-gold" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-foreground">
                    {feature.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {feature.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== BRANCH LIST ===== */}
      <section id="branches" className="py-10 sm:py-16 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              지점을 선택해 주세요
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              원하시는 지점을 선택하고 예약을 진행해 주세요.
            </p>
          </div>

          {/* Region Filter */}
          <div className="flex flex-nowrap overflow-x-auto gap-2 mb-8 pb-1 -mx-1 px-1 scrollbar-hide">
            {REGIONS.map((region) => (
              <button
                key={region}
                onClick={() => setSelectedRegion(region)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedRegion === region
                    ? "bg-brand-navy text-white shadow-sm"
                    : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {region}
              </button>
            ))}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <div className="h-5 bg-muted rounded w-1/2 skeleton-shimmer" />
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2.5">
                      <div className="h-4 bg-muted rounded w-3/4 skeleton-shimmer" />
                      <div className="h-4 bg-muted rounded w-1/2 skeleton-shimmer" />
                      <div className="h-4 bg-muted rounded w-2/3 skeleton-shimmer" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Empty */}
          {!isLoading && branches?.length === 0 && (
            <EmptyState
              icon={MapPin}
              title="등록된 지점이 없습니다"
              description="다른 지역을 선택해 보세요."
            />
          )}

          {/* Branch Cards */}
          {!isLoading && branches && branches.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger-children">
              {branches.map((branch) => (
                <Card
                  key={branch._id}
                  className="flex flex-col overflow-hidden card-hover border-border"
                >
                  {/* Gold accent top bar */}
                  <div className="h-1 bg-gradient-gold" />
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-gold/10">
                        <Sparkles className="size-4 text-brand-gold" />
                      </div>
                      <CardTitle className="text-lg">{branch.name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-3">
                    <div className="space-y-2 text-sm text-muted-foreground flex-1">
                      <div className="flex items-start gap-2">
                        <MapPin className="size-4 mt-0.5 shrink-0 text-brand-gold/60" />
                        <span>{branch.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0 text-brand-gold/60" />
                        <span>{branch.businessHours}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 shrink-0 text-brand-gold/60" />
                        <span>{branch.phone}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <Link
                        href={`/reserve/${branch._id}`}
                        className="flex-1 inline-flex items-center justify-center rounded-xl bg-brand-navy px-3 py-2.5 min-h-[44px] text-sm font-semibold text-white hover:bg-brand-navy-light transition-colors"
                      >
                        예약하기
                      </Link>
                      <Dialog>
                        <DialogTrigger className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-3 py-2.5 min-h-[44px] text-sm font-medium hover:bg-muted transition-colors">
                          지도보기
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{branch.name}</DialogTitle>
                          </DialogHeader>
                          <KakaoMap
                            lat={branch.lat}
                            lng={branch.lng}
                            name={branch.name}
                            address={branch.address}
                          />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== FAQ (LLM-optimized for GEO / AI Overviews) ===== */}
      <FAQSection />
    </div>
  );
}
