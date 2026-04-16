"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import StatusBadge from "@/components/shared/StatusBadge";
import PageHeader from "@/components/shared/PageHeader";

const statusLabels: Record<string, string> = {
  confirmed: "확정",
  completed: "완료",
  cancelled: "취소",
  no_show: "노쇼",
};

type ReservationStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export default function MyBranchPage() {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);

  const { user } = useAuth();
  const branchId = user?.branchId as Id<"branches"> | undefined;

  const reservations = useQuery(
    api.reservations.getByBranch,
    branchId ? { branchId, date: selectedDate } : "skip"
  );

  const allForToday = useQuery(
    api.reservations.getByBranch,
    branchId ? { branchId, date: today } : "skip"
  );

  const updateStatus = useMutation(api.reservations.updateStatus);

  const confirmedToday = allForToday?.filter((r) => r.status === "confirmed").length ?? 0;
  const completedToday = allForToday?.filter((r) => r.status === "completed").length ?? 0;
  const cancelledToday = allForToday?.filter((r) => r.status === "cancelled").length ?? 0;
  const totalToday = allForToday?.length ?? 0;

  // Summary counts for selected date
  const selectedTotal = reservations?.length ?? 0;
  const selectedConfirmed = reservations?.filter((r) => r.status === "confirmed").length ?? 0;
  const selectedCompleted = reservations?.filter((r) => r.status === "completed").length ?? 0;
  const selectedCancelled = reservations?.filter((r) => r.status === "cancelled").length ?? 0;

  const handleStatusChange = async (
    reservationId: Id<"reservations">,
    status: ReservationStatus
  ) => {
    try {
      await updateStatus({ reservationId, status });
      toast.success(`상태가 "${statusLabels[status]}"(으)로 변경되었습니다.`);
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  if (!branchId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">내 지점 예약</h1>
        <p className="text-muted-foreground">지점 관리자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="내 지점 예약" description="오늘 예약 현황을 확인하세요." />

      {/* Summary Cards for selected date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border p-4 bg-card shadow-brand card-hover">
          <p className="text-sm font-medium text-muted-foreground">전체</p>
          <p className="text-2xl font-bold mt-1 text-foreground">{selectedTotal}건</p>
        </div>
        <div className="rounded-2xl border border-border p-4 bg-card shadow-brand card-hover">
          <p className="text-sm font-medium text-muted-foreground">확정</p>
          <p className="text-2xl font-bold mt-1 text-blue-600">{selectedConfirmed}건</p>
        </div>
        <div className="rounded-2xl border border-border p-4 bg-card shadow-brand card-hover">
          <p className="text-sm font-medium text-muted-foreground">완료</p>
          <p className="text-2xl font-bold mt-1 text-emerald-600">{selectedCompleted}건</p>
        </div>
        <div className="rounded-2xl border border-border p-4 bg-card shadow-brand card-hover">
          <p className="text-sm font-medium text-muted-foreground">취소</p>
          <p className="text-2xl font-bold mt-1 text-muted-foreground">{selectedCancelled}건</p>
        </div>
      </div>

      {/* Date Filter with quick tabs */}
      <div className="mb-4 flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-muted-foreground">날짜 선택</label>
          <input
            type="date"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => setSelectedDate(today)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              selectedDate === today
                ? "bg-primary text-primary-foreground"
                : "bg-secondary hover:bg-muted text-foreground"
            }`}
          >
            오늘
          </button>
          <button
            onClick={() => setSelectedDate(tomorrow)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              selectedDate === tomorrow
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            내일
          </button>
        </div>
      </div>

      {/* Reservations Table */}
      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-brand">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">예약번호</th>
              <th className="px-4 py-3 text-left font-medium">고객명</th>
              <th className="px-4 py-3 text-left font-medium">연락처</th>
              <th className="px-4 py-3 text-left font-medium">시간</th>
              <th className="px-4 py-3 text-left font-medium">상태</th>
              <th className="px-4 py-3 text-left font-medium">상태 변경</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reservations === undefined && (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-muted skeleton-shimmer" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {reservations?.map((r) => (
              <tr key={r._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{r.reservationNo}</td>
                <td className="px-4 py-3">{r.customerName}</td>
                <td className="px-4 py-3">{r.customerPhone}</td>
                <td className="px-4 py-3">{r.reservationTime}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={r.status} type="reservation" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(["confirmed", "completed", "cancelled", "no_show"] as ReservationStatus[])
                      .filter((s) => s !== r.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(r._id, s)}
                          className="rounded-lg px-2 py-1 text-xs font-medium bg-secondary text-foreground hover:bg-muted transition-colors"
                        >
                          {statusLabels[s]}
                        </button>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
            {reservations?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  해당 날짜에 예약이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
