"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { label: string; className: string }> = {
  issued: { label: "발행됨", className: "bg-blue-100 text-blue-700" },
  used: { label: "사용됨", className: "bg-green-100 text-green-700" },
  expired: { label: "만료됨", className: "bg-gray-100 text-gray-500" },
  cancelled: { label: "취소됨", className: "bg-red-100 text-red-700" },
};

// TODO: Replace with actual auth context to get the buyer's userId
const PLACEHOLDER_BUYER_ID = "" as Id<"users">;

export default function MyVouchersPage() {
  const buyerId = PLACEHOLDER_BUYER_ID;

  const vouchers = useQuery(
    api.vouchers.listByBuyer,
    buyerId ? { buyerId } : "skip"
  );

  const branches = useQuery(api.branches.list, {});

  const getBranchName = (branchId?: Id<"branches">) => {
    if (!branchId || !branches) return "-";
    return branches.find((b) => b._id === branchId)?.name ?? "-";
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("ko-KR");

  const handleExcelDownload = () => {
    // TODO: 엑셀 다운로드 구현
    alert("엑셀 다운로드 기능은 준비 중입니다.");
  };

  if (!buyerId) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-4">내 바우처</h1>
        <p className="text-gray-500">구매자 계정으로 로그인해 주세요.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">내 바우처</h1>
        <Button variant="outline" onClick={handleExcelDownload}>
          엑셀 다운로드
        </Button>
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">바우처 코드</th>
              <th className="px-4 py-3 text-left font-medium">상태</th>
              <th className="px-4 py-3 text-left font-medium">발행일</th>
              <th className="px-4 py-3 text-left font-medium">만료일</th>
              <th className="px-4 py-3 text-left font-medium">사용일</th>
              <th className="px-4 py-3 text-left font-medium">사용 지점</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vouchers?.map((v) => (
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{v.voucherCode}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[v.status]?.className}`}
                  >
                    {statusConfig[v.status]?.label}
                  </span>
                </td>
                <td className="px-4 py-3">{fmtDate(v.issuedAt)}</td>
                <td className="px-4 py-3">{fmtDate(v.expiresAt)}</td>
                <td className="px-4 py-3">{v.usedAt ? fmtDate(v.usedAt) : "-"}</td>
                <td className="px-4 py-3">{getBranchName(v.usedBranchId)}</td>
              </tr>
            ))}
            {vouchers?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  바우처가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
