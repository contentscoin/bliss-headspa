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
  Sparkles,
  User,
  Mail,
  Ticket,
} from "lucide-react";
import KakaoMap from "@/components/shared/KakaoMap";
import { toast } from "sonner";

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 11);
  if (digits.length === 0) return "";
  if (digits.startsWith("02")) {
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}-${digits.slice(2)}`;
    if (digits.length <= 9) return `${digits.slice(0, 2)}-${digits.slice(2, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 2)}-${digits.slice(2, 6)}-${digits.slice(6, 10)}`;
  }
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

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

const STEPS = [
  { number: 1, label: "지점 정보" },
  { number: 2, label: "예약자 정보" },
  { number: 3, label: "바우처" },
  { number: 4, label: "날짜" },
  { number: 5, label: "시간" },
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
  const [customerGender, setCustomerGender] = useState<"male" | "female" | "">("");
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherVerified, setVoucherVerified] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTime, setSelectedTime] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedReservation, setCompletedReservation] = useState<{
    reservationNo: string;
  } | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const currentStep = (() => {
    if (!customerName || !customerPhone || !customerEmail || !customerGender) return 2;
    if (!voucherVerified) return 3;
    if (!selectedDate) return 4;
    if (!selectedTime) return 5;
    return 6;
  })();

  const isFormComplete =
    customerName.trim() &&
    customerPhone.trim() &&
    customerEmail.trim() &&
    customerGender &&
    voucherVerified &&
    selectedDate &&
    selectedTime;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!customerName.trim() || customerName.trim().length < 2) {
      newErrors.name = "이름은 2자 이상 입력해 주세요.";
    }
    if (!customerPhone.trim() || !/^(010-\d{4}-\d{4}|0\d{1,2}-\d{3,4}-\d{4})$/.test(customerPhone.trim())) {
      newErrors.phone = "올바른 전화번호 형식을 입력해 주세요.";
    }
    if (!customerEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail.trim())) {
      newErrors.email = "올바른 이메일 형식을 입력해 주세요.";
    }
    if (!customerGender) {
      newErrors.gender = "성별을 선택해 주세요.";
    }
    if (!voucherVerified) {
      newErrors.voucher = "바우처 검증이 필요합니다.";
    }
    if (!selectedDate) {
      newErrors.date = "날짜를 선택해 주세요.";
    }
    if (!selectedTime) {
      newErrors.time = "시간을 선택해 주세요.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !voucher || !selectedDate) return;
    setIsSubmitting(true);
    try {
      const result = await createReservation({
        branchId: branchId as Id<"branches">,
        voucherId: voucher._id,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim(),
        customerGender: customerGender || undefined,
        reservationDate: format(selectedDate, "yyyy-MM-dd"),
        reservationTime: selectedTime,
      });
      setCompletedReservation({ reservationNo: result.reservationNo });
      toast.success("예약이 완료되었습니다");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "예약에 실패했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading
  if (branch === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3 skeleton-shimmer" />
          <div className="h-4 bg-muted rounded w-1/2 skeleton-shimmer" />
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
      <div className="container mx-auto max-w-md px-4 py-16 text-center animate-scale-in">
        <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50">
          <CheckCircle2 className="size-10 text-emerald-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">예약이 완료되었습니다</h1>
        <p className="text-muted-foreground mb-8">
          아래 예약번호를 확인해 주세요.
        </p>
        <Card className="shadow-brand-lg">
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">예약번호</p>
            <p className="text-2xl font-mono font-bold mt-1 text-brand-navy">
              {completedReservation.reservationNo}
            </p>
            <Separator className="my-4" />
            <div className="text-sm text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">지점</span>
                <span className="font-medium">{branch.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">날짜</span>
                <span>{selectedDate && format(selectedDate, "yyyy년 M월 d일")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">시간</span>
                <span>{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">예약자</span>
                <span>{customerName}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="mt-4 rounded-xl bg-brand-gold/10 border border-brand-gold/30 px-4 py-3 text-sm text-left">
          <p className="font-semibold text-brand-navy mb-1">📞 예약 확인 안내</p>
          <p className="text-muted-foreground leading-relaxed">
            예약이 접수되었습니다. 빠른 시간 내에 CS 담당자가 예약 확인을 위해
            연락드릴 예정입니다.
          </p>
        </div>
        <a
          href="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-brand-navy px-3 py-3 text-sm font-semibold text-white hover:bg-brand-navy-light transition-colors"
        >
          확인
        </a>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-lg px-4 py-8 space-y-6 animate-fade-in">
      {/* Progress Indicator */}
      <div className="flex items-center justify-between px-2 mb-2">
        {STEPS.map((step, i) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-colors ${
                  currentStep > step.number
                    ? "bg-brand-gold text-brand-navy"
                    : currentStep === step.number
                      ? "bg-brand-navy text-white"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {currentStep > step.number ? "✓" : step.number}
              </div>
              <span className="text-[10px] text-muted-foreground mt-1 hidden sm:block">
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-0.5 mx-1 transition-colors ${
                  currentStep > step.number ? "bg-brand-gold" : "bg-muted"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Branch Info */}
      <Card className="shadow-brand overflow-hidden">
        <div className="h-1 bg-gradient-gold" />
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="size-4 text-brand-gold" />
            지점 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-start gap-2">
            <div>
              <p className="font-medium">{branch.name}</p>
              <p className="text-muted-foreground">{branch.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="size-4 shrink-0 text-brand-gold/60" />
            <span>{branch.businessHours}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="size-4 shrink-0 text-brand-gold/60" />
            <span>{branch.phone}</span>
          </div>
          <div className="pt-2">
            <KakaoMap
              lat={branch.lat}
              lng={branch.lng}
              name={branch.name}
              address={branch.address}
              height="200px"
            />
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Customer Info */}
      <Card className="shadow-brand">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="size-4 text-brand-gold" />
            예약자 정보
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">이름</Label>
            <Input
              id="name"
              placeholder="홍길동"
              value={customerName}
              onChange={(e) => { setCustomerName(e.target.value); setErrors((prev) => ({ ...prev, name: "" })); }}
              className={`min-h-[44px] ${errors.name ? "border-destructive" : ""}`}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">휴대폰번호</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="010-1234-5678"
                value={customerPhone}
                onChange={(e) => {
                  setCustomerPhone(formatPhone(e.target.value));
                  setErrors((prev) => ({ ...prev, phone: "" }));
                }}
                className={`min-h-[44px] pl-10 ${errors.phone ? "border-destructive" : ""}`}
              />
            </div>
            {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
          </div>
          <div className="space-y-2">
            <Label>성별</Label>
            <div className="grid grid-cols-2 gap-2">
              {([
                ["male", "남성"],
                ["female", "여성"],
              ] as const).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    setCustomerGender(val);
                    setErrors((prev) => ({ ...prev, gender: "" }));
                  }}
                  className={`min-h-[44px] rounded-xl text-sm font-medium transition-all ${
                    customerGender === val
                      ? "bg-brand-navy text-white shadow-sm"
                      : "bg-secondary text-foreground hover:bg-muted border border-border"
                  } ${errors.gender && !customerGender ? "border-destructive" : ""}`}
                >
                  {label}
                </button>
              ))}
            </div>
            {errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">이메일</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="example@email.com"
                value={customerEmail}
                onChange={(e) => { setCustomerEmail(e.target.value); setErrors((prev) => ({ ...prev, email: "" })); }}
                className={`min-h-[44px] pl-10 ${errors.email ? "border-destructive" : ""}`}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Voucher */}
      <Card className="shadow-brand">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Ticket className="size-4 text-brand-gold" />
            바우처 번호
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input
              placeholder="MHS-XXXXXXXX"
              value={voucherCode}
              onChange={(e) => {
                setVoucherCode(e.target.value.toUpperCase());
                setVoucherVerified(false);
              }}
              disabled={voucherVerified}
              className="min-h-[44px] font-mono"
            />
            <Button
              variant="outline"
              onClick={handleVerify}
              disabled={!isVoucherValid || voucherVerified}
              className="min-h-[44px]"
            >
              {voucherVerified ? "확인됨" : "검증"}
            </Button>
          </div>
          {voucherVerified && (
            <div className="flex items-center gap-2 text-emerald-600 text-sm bg-emerald-50 rounded-lg px-3 py-2">
              <CheckCircle2 className="size-4" />
              <span>유효한 바우처입니다.</span>
            </div>
          )}
          {isVoucherInvalid && !voucherVerified && (
            <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg px-3 py-2">
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
          {errors.voucher && <p className="text-sm text-destructive">{errors.voucher}</p>}
        </CardContent>
      </Card>

      {/* Step 4: Date */}
      <Card className="shadow-brand">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="size-4 text-brand-gold" />
            날짜 선택
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(d) => { setSelectedDate(d); setErrors((prev) => ({ ...prev, date: "" })); }}
            locale={ko}
            disabled={(date) => date <= new Date()}
            className="rounded-xl border"
          />
          {errors.date && <p className="text-sm text-destructive mt-2">{errors.date}</p>}
        </CardContent>
      </Card>

      {/* Step 5: Time */}
      <Card className="shadow-brand">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="size-4 text-brand-gold" />
            시간 선택
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {TIME_SLOTS.map((time) => (
              <button
                key={time}
                onClick={() => { setSelectedTime(time); setErrors((prev) => ({ ...prev, time: "" })); }}
                className={`min-h-[44px] rounded-xl text-sm font-medium transition-all ${
                  selectedTime === time
                    ? "bg-brand-navy text-white shadow-sm"
                    : "bg-secondary text-foreground hover:bg-muted border border-border"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
          {errors.time && <p className="text-sm text-destructive mt-2">{errors.time}</p>}
        </CardContent>
      </Card>

      {/* Step 6: Summary */}
      {isFormComplete && selectedDate && (
        <Card className="shadow-brand-lg border-brand-gold/20 animate-scale-in">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="size-4 text-brand-gold" />
              예약 요약
            </CardTitle>
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
              <span className="text-muted-foreground">성별</span>
              <span>{customerGender === "male" ? "남성" : customerGender === "female" ? "여성" : "-"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">이메일</span>
              <span>{customerEmail}</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">바우처</span>
              <Badge variant="outline" className="font-mono">{voucherCode}</Badge>
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
            <Separator />
            <div className="rounded-lg bg-brand-gold/10 border border-brand-gold/30 px-3 py-2 text-xs text-muted-foreground leading-relaxed">
              예약 확정 후 빠른 시간 내에 CS 담당자가 예약 확인을 위해 연락드립니다.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 7: Submit */}
      <Button
        className="w-full min-h-[48px] rounded-xl bg-brand-navy hover:bg-brand-navy-light text-white font-semibold"
        size="lg"
        disabled={isSubmitting}
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
