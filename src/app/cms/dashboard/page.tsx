"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const reservationStatusConfig: Record<string, { label: string; className: string }> = {
  confirmed: { label: "확정", className: "bg-blue-100 text-blue-700" },
  completed: { label: "완료", className: "bg-green-100 text-green-700" },
  cancelled: { label: "취소", className: "bg-gray-100 text-gray-500" },
  no_show: { label: "노쇼", className: "bg-red-100 text-red-700" },
};

export default function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats);
  const allReservations = useQuery(api.reservations.listAll);
  const allUsers = useQuery(api.users.listAll);

  const isLoading = stats === undefined || allReservations === undefined || allUsers === undefined;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-xl border p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-3" />
              <div className="h-8 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "전체 지점 수", value: stats?.totalBranches ?? 0, color: "bg-blue-50 text-blue-700" },
    { label: "활성 바우처 수", value: stats?.activeVouchers ?? 0, color: "bg-green-50 text-green-700" },
    { label: "오늘 예약 수", value: stats?.todayReservations ?? 0, color: "bg-amber-50 text-amber-700" },
    { label: "이번 달 예약 수", value: stats?.monthReservations ?? 0, color: "bg-purple-50 text-purple-700" },
    { label: "총 사용자 수", value: allUsers?.length ?? 0, color: "bg-pink-50 text-pink-700" },
  ];

  const recentReservations = [...(allReservations ?? [])]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className={`rounded-xl border p-6 shadow-sm ${card.color}`}
          >
            <p className="text-sm font-medium opacity-80">{card.label}</p>
            <p className="text-3xl font-bold mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      {/* 최근 예약 */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">최근 예약</h2>
        {recentReservations.length === 0 ? (
          <div className="rounded-xl border p-8 text-center text-muted-foreground">
            예약이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium">예약번호</th>
                  <th className="px-4 py-3 text-left font-medium">고객명</th>
                  <th className="px-4 py-3 text-left font-medium">예약일</th>
                  <th className="px-4 py-3 text-left font-medium">상태</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((r) => {
                  const status = reservationStatusConfig[r.status] ?? {
                    label: r.status,
                    className: "bg-gray-100 text-gray-700",
                  };
                  return (
                    <tr key={r._id} className="border-b last:border-0">
                      <td className="px-4 py-3 font-mono text-xs">{r.reservationNo}</td>
                      <td className="px-4 py-3">{r.customerName}</td>
                      <td className="px-4 py-3">{r.reservationDate}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
