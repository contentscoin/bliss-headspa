"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Building2, Ticket, CalendarCheck, Users, TrendingUp } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import PageHeader from "@/components/shared/PageHeader";

export default function DashboardPage() {
  const stats = useQuery(api.dashboard.getStats);
  const allReservations = useQuery(api.reservations.listAll);
  const allUsers = useQuery(api.users.listAll);

  const isLoading = stats === undefined || allReservations === undefined || allUsers === undefined;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="대시보드" description="전체 현황을 한눈에 확인하세요." />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="rounded-2xl border border-border bg-card p-5 shadow-brand">
              <div className="h-4 bg-muted rounded w-2/3 mb-3 skeleton-shimmer" />
              <div className="h-8 bg-muted rounded w-1/3 skeleton-shimmer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: "전체 지점", value: stats?.totalBranches ?? 0, icon: Building2, accent: "bg-blue-50 text-blue-600" },
    { label: "활성 바우처", value: stats?.activeVouchers ?? 0, icon: Ticket, accent: "bg-emerald-50 text-emerald-600" },
    { label: "오늘 예약", value: stats?.todayReservations ?? 0, icon: CalendarCheck, accent: "bg-amber-50 text-amber-600" },
    { label: "이번 달 예약", value: stats?.monthReservations ?? 0, icon: TrendingUp, accent: "bg-purple-50 text-purple-600" },
    { label: "총 사용자", value: allUsers?.length ?? 0, icon: Users, accent: "bg-rose-50 text-rose-600" },
  ];

  const recentReservations = [...(allReservations ?? [])]
    .sort((a, b) => b._creationTime - a._creationTime)
    .slice(0, 5);

  return (
    <div className="space-y-8 animate-fade-in">
      <PageHeader title="대시보드" description="전체 현황을 한눈에 확인하세요." />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 stagger-children">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-border bg-card p-5 shadow-brand card-hover"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${card.accent}`}>
                <card.icon className="size-4" />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Reservations */}
      <div>
        <h2 className="text-lg font-bold mb-4">최근 예약</h2>
        {recentReservations.length === 0 ? (
          <div className="rounded-2xl border border-border p-8 text-center text-muted-foreground bg-card">
            예약이 없습니다.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-brand">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">예약번호</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">고객명</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">예약일</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map((r) => (
                  <tr key={r._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs">{r.reservationNo}</td>
                    <td className="px-4 py-3">{r.customerName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.reservationDate}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.status} type="reservation" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
