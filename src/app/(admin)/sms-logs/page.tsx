"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

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
  const logs = useQuery(api.smsLogs.listAll);

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

  if (logs.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">SMS 로그</h1>
        <div className="rounded-xl border p-12 text-center text-muted-foreground">
          발송된 SMS가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SMS 로그</h1>
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
    </div>
  );
}
