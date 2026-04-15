"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "확정", className: "bg-blue-100 text-blue-700" },
  completed: { label: "완료", className: "bg-green-100 text-green-700" },
  cancelled: { label: "취소", className: "bg-gray-100 text-gray-500" },
  no_show: { label: "노쇼", className: "bg-red-100 text-red-700" },
};

type ReservationStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export default function MyBranchPage() {
  const today = new Date().toISOString().slice(0, 10);
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
  const totalToday = allForToday?.length ?? 0;

  const handleStatusChange = async (
    reservationId: Id<"reservations">,
    status: ReservationStatus
  ) => {
    await updateStatus({ reservationId, status });
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

      {/* Today Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border p-4 bg-blue-50 text-blue-700">
          <p className="text-sm font-medium opacity-80">오늘 전체</p>
          <p className="text-2xl font-bold mt-1">{totalToday}건</p>
        </div>
        <div className="rounded-xl border p-4 bg-amber-50 text-amber-700">
          <p className="text-sm font-medium opacity-80">확정 대기</p>
          <p className="text-2xl font-bold mt-1">{confirmedToday}건</p>
        </div>
        <div className="rounded-xl border p-4 bg-green-50 text-green-700">
          <p className="text-sm font-medium opacity-80">완료</p>
          <p className="text-2xl font-bold mt-1">{completedToday}건</p>
        </div>
      </div>

      {/* Date Filter */}
      <div className="mb-4">
        <label className="block text-xs font-medium mb-1 text-gray-500">날짜 선택</label>
        <input
          type="date"
          className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
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
