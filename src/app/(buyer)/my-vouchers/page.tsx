"use client";

import { useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth";

const statusConfig: Record<string, { label: string; className: string }> = {
  issued: { label: "발행됨", className: "bg-blue-100 text-blue-700" },
  used: { label: "사용됨", className: "bg-green-100 text-green-700" },
  expired: { label: "만료됨", className: "bg-gray-100 text-gray-500" },
  cancelled: { label: "취소됨", className: "bg-red-100 text-red-700" },
};

type VoucherStatus = "issued" | "used" | "expired" | "cancelled";

const statusTabs: { label: string; value: VoucherStatus | "all" }[] = [
  { label: "전체", value: "all" },
  { label: "발행", value: "issued" },
  { label: "사용", value: "used" },
  { label: "만료", value: "expired" },
  { label: "취소", value: "cancelled" },
];

export default function MyVouchersPage() {
  const { user } = useAuth();
  const buyerId = user?._id as Id<"users"> | undefined;
  const [statusFilter, setStatusFilter] = useState<VoucherStatus | "all">("all");

  const vouchers = useQuery(
    api.vouchers.listByBuyer,
    buyerId ? { buyerId } : "skip"
  );

  const filteredVouchers = statusFilter === "all"
    ? vouchers
    : vouchers?.filter((v) => v.status === statusFilter);

  const branches = useQuery(api.branches.list, {});

  const getBranchName = (branchId?: Id<"branches">) => {
    if (!branchId || !branches) return "-";
    return branches.find((b) => b._id === branchId)?.name ?? "-";
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("ko-KR");

  const exportVouchers = useAction(api.voucherExport.exportVouchers);
  const [isExporting, setIsExporting] = useState(false);

  const handleExcelDownload = async () => {
    if (!buyerId) return;
    setIsExporting(true);
    try {
      const csv = await exportVouchers({ buyerId });
      const bom = "\uFEFF";
      const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `바우처_목록_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("다운로드 중 오류가 발생했습니다.");
    } finally {
      setIsExporting(false);
    }
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
        <Button variant="outline" onClick={handleExcelDownload} disabled={isExporting}>
          {isExporting ? "다운로드 중..." : "엑셀 다운로드"}
        </Button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex gap-1 mb-4">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-primary text-primary-foreground"
                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
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
            {filteredVouchers?.map((v) => (
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
            {filteredVouchers?.length === 0 && (
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
