"use client";

import { useState, use } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ko } from "date-fns/locale";
import { format } from "date-fns";
import {
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const TIME_SLOTS = [
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
];

export default function ReservePage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = use(params);
  const branch = useQuery(api.branches.getById, {
    branchId: branchId as Id<"branches">,
  });

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherVerified, setVoucherVerified] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedReservation, setCompletedReservation] = useState<{
    reservationNo: string;
  } | null>(null);

  // Voucher verification
  const voucher = useQuery(
    api.vouchers.getByCode,
    voucherCode.length >= 4 ? { voucherCode } : "skip"
  );

  const createReservation = useMutation(api.reservations.create);

  const isVoucherValid =
    voucher && voucher.status === "issued" && voucher.expiresAt > Date.now();
  const isVoucherInvalid = voucherCode.length >= 4 && voucher !== undefined && !isVoucherValid;

  const handleVerify = () => {
    if (isVoucherValid) {
      setVoucherVerified(true);
    }
  };

  const isFormComplete =
    customerName.trim() &&
    customerPhone.trim() &&
    customerEmail.trim() &&
    voucherVerified &&
    selectedDate &&
    selectedTime;

  const handleSubmit = async () => {
    if (!isFormComplete || !voucher || !selectedDate) return;
    setIsSubmitting(true);
    try {
      const result = await createReservation({
        branchId: branchId as Id<"branches">,
        voucherId: voucher._id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        reservationDate: format(selectedDate, "yyyy-MM-dd"),
        reservationTime: selectedTime,
      });
      setCompletedReservation({ reservationNo: result.reservationNo });
    } catch (err) {
      alert(err instanceof Error ? err.message : "예약에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (branch === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    );
  }

  if (branch === null) {
    return (
      <div className="container mx-auto px-4 py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">지점을 찾을 수 없습니다.</p>
      </div>
    );
  }

  // Completion screen
  if (completedReservation) {
    return (
      <div className="container mx-auto max-w-md px-4 py-16 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-16 text-green-500" />
        <h1 className="text-2xl font-bold mb-2">예약이 완료되었습니다</h1>
        <p className="text-muted-foreground mb-6">
          아래 예약번호를 확인해 주세요.
        </p>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">예약번호</p>
            <p className="text-2xl font-mono font-bold mt-1">
              {completedReservation.reservationNo}
            </p>
            <Separator className="my-4" />
            <div className="text-sm text-left space-y-1">
              <p>
                <span className="text-muted-foreground">지점:</span>{" "}
                {branch.name}
              </p>
              <p>
                <span className="text-muted-foreground">날짜:</span>{" "}
                {selectedDate && format(selectedDate, "yyyy년 M월 d일")}
              </p>
              <p>
                <span className="text-muted-foreground">시간:</span>{" "}
                {selectedTime}
              </p>
              <p>
                <span className="text-muted-foreground">예약자:</span>{" "}
                {customerName}
              </p>
            </div>
          </CardContent>
        </Card>
        <a
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/80 transition-colors"
        >
          확인
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 space-y-6">
      {/* Step 1: Branch Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">지점 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <MapPin className="size-4 mt-0.5 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium">{branch.name}</p>
              <p className="text-muted-foreground">{branch.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4 shrink-0" />
            <span>{branch.businessHours}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <span>{branch.phone}</span>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Customer Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">예약자 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="홍길동"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰번호</Label>
            <Input
              id="phone"
              placeholder="010-1234-5678"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Voucher */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">바우처 번호</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="BHS-XXXXXXXX"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setVoucherVerified(false);
              }}
              disabled={voucherVerified}
            />
            <Button
              variant="outline"
              onClick={handleVerify}
              disabled={!isVoucherValid || voucherVerified}
            >
              {voucherVerified ? "확인됨" : "검증"}
            </Button>
          </div>
          {voucherVerified && (
            <div className="flex items-center gap-2 text-green-600 text-sm">
              <CheckCircle2 className="size-4" />
              <span>유효한 바우처입니다.</span>
            </div>
          )}
          {isVoucherInvalid && !voucherVerified && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <XCircle className="size-4" />
              <span>
                {voucher === null
                  ? "존재하지 않는 바우처입니다."
                  : voucher.status !== "issued"
                    ? "이미 사용되었거나 취소된 바우처입니다."
                    : "만료된 바우처입니다."}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 4: Date */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">날짜 선택</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            locale={ko}
            disabled={(date) => date <= new Date()}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Step 5: Time */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">시간 선택</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {TIME_SLOTS.map((time) => (
              <Button
                key={time}
                variant={selectedTime === time ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step 6: Summary */}
      {isFormComplete && selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">예약 요약</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">지점</span>
              <span className="font-medium">{branch.name}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">예약자</span>
              <span>{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">연락처</span>
              <span>{customerPhone}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">이메일</span>
              <span>{customerEmail}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">바우처</span>
              <Badge variant="outline">{voucherCode}</Badge>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">날짜</span>
              <span>{format(selectedDate, "yyyy년 M월 d일")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">시간</span>
              <span>{selectedTime}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Submit */}
      <Button
        className="w-full"
        size="lg"
        disabled={!isFormComplete || isSubmitting}
        onClick={handleSubmit}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            예약 중...
          </>
        ) : (
          "예약 확정"
        )}
      </Button>
    </div>
  );
}
