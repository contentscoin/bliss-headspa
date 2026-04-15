"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "확정", className: "bg-blue-100 text-blue-700" },
  completed: { label: "완료", className: "bg-green-100 text-green-700" },
  cancelled: { label: "취소", className: "bg-gray-100 text-gray-500" },
  no_show: { label: "노쇼", className: "bg-red-100 text-red-700" },
};

type ReservationStatus = "confirmed" | "completed" | "cancelled" | "no_show";

export default function ReservationsPage() {
  const allReservations = useQuery(api.reservations.listAll);
  const branches = useQuery(api.branches.list, {});
  const updateStatus = useMutation(api.reservations.updateStatus);

  const [branchFilter, setBranchFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState("");

  const reservations = allReservations?.filter((r) => {
    if (branchFilter !== "all" && r.branchId !== branchFilter) return false;
    if (dateFilter && r.reservationDate !== dateFilter) return false;
    return true;
  });

  const getBranchName = (branchId: Id<"branches">) => {
    if (!branches) return "-";
    return branches.find((b) => b._id === branchId)?.name ?? "-";
  };

  const handleStatusChange = async (
    reservationId: Id<"reservations">,
    status: ReservationStatus
  ) => {
    try {
      await updateStatus({ reservationId, status });
      toast.success("상태가 변경되었습니다");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다");
    }
  };

  if (allReservations === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">예약 관리</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">예약 관리</h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4 flex-wrap">
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">지점</label>
          <select
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
          >
            <option value="all">전체 지점</option>
            {branches?.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium mb-1 text-gray-500">날짜</label>
          <input
            type="date"
            className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>
        {(branchFilter !== "all" || dateFilter) && (
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setBranchFilter("all");
                setDateFilter("");
              }}
            >
              필터 초기화
            </Button>
          </div>
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">예약번호</th>
              <th className="px-4 py-3 text-left font-medium">고객명</th>
              <th className="px-4 py-3 text-left font-medium">지점</th>
              <th className="px-4 py-3 text-left font-medium">날짜</th>
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
                <td className="px-4 py-3">{getBranchName(r.branchId)}</td>
                <td className="px-4 py-3">{r.reservationDate}</td>
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
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  예약이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
