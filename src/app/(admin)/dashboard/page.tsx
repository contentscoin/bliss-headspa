"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export default function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats);

  const cards = [
    { label: "전체 지점 수", value: stats?.totalBranches ?? "-", color: "bg-blue-50 text-blue-700" },
    { label: "활성 바우처 수", value: stats?.activeVouchers ?? "-", color: "bg-green-50 text-green-700" },
    { label: "오늘 예약 수", value: stats?.todayReservations ?? "-", color: "bg-amber-50 text-amber-700" },
    { label: "이번 달 예약 수", value: stats?.monthReservations ?? "-", color: "bg-purple-50 text-purple-700" },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">관리자 대시보드</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
    </div>
  );
}
