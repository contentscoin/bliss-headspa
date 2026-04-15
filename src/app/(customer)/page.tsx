"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MapPin, Clock, Phone } from "lucide-react";

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">지점을 선택해 주세요</h1>
      <p className="text-sm text-muted-foreground mb-6">
        원하시는 지점을 선택하고 예약을 진행해 주세요.
      </p>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {REGIONS.map((region) => (
          <Button
            key={region}
            variant={selectedRegion === region ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedRegion(region)}
          >
            {region}
          </Button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-4 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!isLoading && branches?.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <MapPin className="mx-auto mb-3 size-10 opacity-50" />
          <p className="text-lg font-medium">등록된 지점이 없습니다</p>
          <p className="text-sm mt-1">다른 지역을 선택해 보세요.</p>
        </div>
      )}

      {/* Branch Cards */}
      {!isLoading && branches && branches.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <Card key={branch._id} className="flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">{branch.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-3">
                <div className="space-y-2 text-sm text-muted-foreground flex-1">
                  <div className="flex items-start gap-2">
                    <MapPin className="size-4 mt-0.5 shrink-0" />
                    <span>{branch.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="size-4 shrink-0" />
                    <span>{branch.businessHours}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="size-4 shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <Link
                    href={`/reserve/${branch._id}`}
                    className="flex-1 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
                  >
                    예약하기
                  </Link>
                  <Dialog>
                    <DialogTrigger
                      className="inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-muted transition-colors"
                    >
                        지도보기
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{branch.name}</DialogTitle>
                      </DialogHeader>
                      <div className="aspect-[4/3] rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm">
                        <div className="text-center">
                          <MapPin className="mx-auto mb-2 size-8 opacity-50" />
                          <p>Kakao Map</p>
                          <p className="text-xs mt-1">{branch.address}</p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
