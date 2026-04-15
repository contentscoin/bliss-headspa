"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "확정", className: "bg-blue-100 text-blue-700" },
  completed: { label: "완료", className: "bg-green-100 text-green-700" },
  cancelled: { label: "취소", className: "bg-gray-100 text-gray-500" },
  no_show: { label: "노쇼", className: "bg-red-100 text-red-700" },
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
      toast.success(`상태가 "${statusConfig[status].label}"(으)로 변경되었습니다.`);
    } catch {
      toast.error("상태 변경에 실패했습니다.");
    }
  };

  if (!branchId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">내 지점 예약</h1>
        <p className="text-gray-500">지점 관리자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">내 지점 예약</h1>

      {/* Summary Cards for selected date */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border p-4 bg-blue-50 text-blue-700">
          <p className="text-sm font-medium opacity-80">전체</p>
          <p className="text-2xl font-bold mt-1">{selectedTotal}건</p>
        </div>
        <div className="rounded-xl border p-4 bg-amber-50 text-amber-700">
          <p className="text-sm font-medium opacity-80">확정</p>
          <p className="text-2xl font-bold mt-1">{selectedConfirmed}건</p>
        </div>
        <div className="rounded-xl border p-4 bg-green-50 text-green-700">
          <p className="text-sm font-medium opacity-80">완료</p>
          <p className="text-2xl font-bold mt-1">{selectedCompleted}건</p>
        </div>
        <div className="rounded-xl border p-4 bg-gray-50 text-gray-700">
          <p className="text-sm font-medium opacity-80">취소</p>
          <p className="text-2xl font-bold mt-1">{selectedCancelled}건</p>
        </div>
      </div>

      {/* Date Filter with quick tabs */}
      <div className="mb-4 flex items-end gap-3">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">날짜 선택</label>
          <input
            type="date"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
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
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
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
                      <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    </td>
                  ))}
                </tr>
              ))
            )}
            {reservations?.map((r) => (
              <tr key={r._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono text-xs">{r.reservationNo}</td>
                <td className="px-4 py-3">{r.customerName}</td>
                <td className="px-4 py-3">{r.customerPhone}</td>
                <td className="px-4 py-3">{r.reservationTime}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[r.status]?.className}`}
                  >
                    {statusConfig[r.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1 flex-wrap">
                    {(["confirmed", "completed", "cancelled", "no_show"] as ReservationStatus[])
                      .filter((s) => s !== r.status)
                      .map((s) => (
                        <button
                          key={s}
                          onClick={() => handleStatusChange(r._id, s)}
                          className="rounded px-2 py-1 text-xs font-medium bg-gray-100 hover:bg-gray-200 transition"
                        >
                          {statusConfig[s].label}
                        </button>
                      ))}
                  </div>
                </td>
              </tr>
            ))}
            {reservations?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
