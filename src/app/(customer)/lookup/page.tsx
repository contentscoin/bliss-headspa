"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Loader2, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";

function ReservationCard({
  reservation,
}: {
  reservation: {
    _id: string;
    reservationNo: string;
    branchId: Id<"branches">;
    reservationDate: string;
    reservationTime: string;
    status: string;
    customerName: string;
  };
}) {
  const branch = useQuery(api.branches.getById, {
    branchId: reservation.branchId,
  });

  return (
    <Card className="shadow-brand card-hover overflow-hidden">
      <div className="h-0.5 bg-gradient-gold" />
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-mono">
            {reservation.reservationNo}
          </CardTitle>
          <StatusBadge status={reservation.status} type="reservation" />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">지점명</span>
          <span className="font-medium">
            {branch === undefined ? "..." : branch?.name ?? "-"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">예약자</span>
          <span>{reservation.customerName}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">예약일</span>
          <span>{reservation.reservationDate}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">예약시간</span>
          <span>{reservation.reservationTime}</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LookupPage() {
  const [mode, setMode] = useState<"reservationNo" | "phone">("reservationNo");
  const [reservationNo, setReservationNo] = useState("");
  const [phone, setPhone] = useState("");
  const [searchReservationNo, setSearchReservationNo] = useState("");
  const [searchPhone, setSearchPhone] = useState("");

  const singleResult = useQuery(
    api.reservations.getByReservationNo,
    searchReservationNo ? { reservationNo: searchReservationNo } : "skip"
  );

  const phoneResults = useQuery(
    api.reservations.getByCustomerPhone,
    searchPhone ? { customerPhone: searchPhone } : "skip"
  );

  const handleSearch = () => {
    if (mode === "reservationNo") {
      if (!reservationNo.trim()) {
        toast.error("예약번호를 입력해 주세요.");
        return;
      }
      setSearchReservationNo(reservationNo.trim());
      setSearchPhone("");
    } else {
      if (!phone.trim()) {
        toast.error("전화번호를 입력해 주세요.");
        return;
      }
      setSearchPhone(phone.trim());
      setSearchReservationNo("");
    }
  };

  const isSearching =
    (searchReservationNo && singleResult === undefined) ||
    (searchPhone && phoneResults === undefined);

  const hasSearched = !!(searchReservationNo || searchPhone);

  const reservations: Array<{
    _id: string;
    reservationNo: string;
    branchId: Id<"branches">;
    reservationDate: string;
    reservationTime: string;
    status: string;
    customerName: string;
  }> = [];

  if (searchReservationNo && singleResult) {
    reservations.push(singleResult as typeof reservations[number]);
  }
  if (searchPhone && phoneResults) {
    reservations.push(
      ...(phoneResults as typeof reservations)
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 space-y-6 animate-fade-in">
      <PageHeader
        title="예약 조회"
        description="예약번호 또는 전화번호로 예약 내역을 확인하세요."
      />

      <Tabs
        defaultValue="reservationNo"
        onValueChange={(value) => {
          setMode(value as "reservationNo" | "phone");
          setSearchReservationNo("");
          setSearchPhone("");
        }}
      >
        <TabsList className="w-full">
          <TabsTrigger value="reservationNo" className="flex-1">
            예약번호로 조회
          </TabsTrigger>
          <TabsTrigger value="phone" className="flex-1">
            전화번호로 조회
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reservationNo">
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="예약번호 입력 (예: BHS-XXXXXXXX)"
              value={reservationNo}
              onChange={(e) => setReservationNo(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="min-h-[44px]"
            />
            <Button
              onClick={handleSearch}
              disabled={!!isSearching}
              className="min-h-[44px] shrink-0 bg-brand-navy hover:bg-brand-navy-light"
            >
              {isSearching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="phone">
          <div className="flex gap-2 mt-4">
            <Input
              placeholder="전화번호 입력 (예: 010-1234-5678)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="min-h-[44px]"
            />
            <Button
              onClick={handleSearch}
              disabled={!!isSearching}
              className="min-h-[44px] shrink-0 bg-brand-navy hover:bg-brand-navy-light"
            >
              {isSearching ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Search className="size-4" />
              )}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Results */}
      {hasSearched && !isSearching && reservations.length > 0 && (
        <div className="space-y-3 stagger-children">
          <p className="text-sm text-muted-foreground">
            {reservations.length}건의 예약이 조회되었습니다.
          </p>
          {reservations.map((r) => (
            <ReservationCard key={r._id} reservation={r} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {hasSearched && !isSearching && reservations.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="조회된 예약이 없습니다"
          description={
            mode === "reservationNo"
              ? "예약번호를 다시 확인해 주세요."
              : "전화번호를 다시 확인해 주세요."
          }
        />
      )}
    </div>
  );
}
