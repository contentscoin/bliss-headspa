"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SmsStatus = "sent" | "failed" | "pending";
type SmsType = "reservation_confirm" | "reservation_notify" | "cancellation" | "reminder";

const typeLabels: Record<string, string> = {
  reservation_confirm: "예약확인",
  reservation_notify: "예약접수",
  cancellation: "취소",
  reminder: "리마인더",
};

const statusConfig: Record<string, { label: string; className: string }> = {
  sent: { label: "발송완료", className: "bg-green-100 text-green-700" },
  failed: { label: "실패", className: "bg-red-100 text-red-700" },
  pending: { label: "대기중", className: "bg-yellow-100 text-yellow-700" },
};

export default function SmsLogsPage() {
  const [statusFilter, setStatusFilter] = useState<SmsStatus | "">("");
  const [typeFilter, setTypeFilter] = useState<SmsType | "">("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const logs = useQuery(api.smsLogs.listFiltered, {
    ...(statusFilter ? { status: statusFilter } : {}),
    ...(typeFilter ? { type: typeFilter } : {}),
    ...(search ? { search } : {}),
  });

  const handleSearch = () => {
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setSearch("");
    setSearchInput("");
  };

  const hasFilters = statusFilter || typeFilter || search;

  if (logs === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">SMS 로그</h1>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SMS 로그</h1>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          className="min-h-[40px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as SmsStatus | "")}
        >
          <option value="">전체 상태</option>
          <option value="sent">발송완료</option>
          <option value="failed">실패</option>
          <option value="pending">대기중</option>
        </select>

        <select
          className="min-h-[40px] rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as SmsType | "")}
        >
          <option value="">전체 유형</option>
          <option value="reservation_confirm">예약확인</option>
          <option value="reservation_notify">예약접수</option>
          <option value="cancellation">취소</option>
          <option value="reminder">리마인더</option>
        </select>

        <div className="flex gap-1.5">
          <Input
            placeholder="수신번호 또는 메시지 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="min-h-[40px] w-56"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearch}
            className="min-h-[40px] px-3"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="min-h-[40px] text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            초기화
          </Button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          {logs.length}건
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-xl border p-12 text-center text-muted-foreground">
          {hasFilters ? "조건에 맞는 SMS 로그가 없습니다." : "발송된 SMS가 없습니다."}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">수신번호</th>
                <th className="px-4 py-3 text-left font-medium">유형</th>
                <th className="px-4 py-3 text-left font-medium">상태</th>
                <th className="px-4 py-3 text-left font-medium">메시지</th>
                <th className="px-4 py-3 text-left font-medium">발송시간</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const status = statusConfig[log.status] ?? {
                  label: log.status,
                  className: "bg-gray-100 text-gray-700",
                };
                return (
                  <tr key={log._id} className="border-b last:border-0">
                    <td className="px-4 py-3">{log.recipientPhone}</td>
                    <td className="px-4 py-3">
                      <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                        {typeLabels[log.type] ?? log.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate">
                      {log.message}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {new Date(log.sentAt).toLocaleString("ko-KR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
