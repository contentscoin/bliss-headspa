"use client";

import { useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Download, Ticket } from "lucide-react";
import StatusBadge from "@/components/shared/StatusBadge";
import EmptyState from "@/components/shared/EmptyState";
import PageHeader from "@/components/shared/PageHeader";

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
        <PageHeader title="내 바우처" />
        <EmptyState
          icon={Ticket}
          title="로그인이 필요합니다"
          description="구매자 계정으로 로그인해 주세요."
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader title="내 바우처" description="구매한 바우처 현황을 확인하세요.">
        <Button
          variant="outline"
          onClick={handleExcelDownload}
          disabled={isExporting}
          className="gap-2"
        >
          <Download className="size-4" />
          {isExporting ? "다운로드 중..." : "엑셀 다운로드"}
        </Button>
      </PageHeader>

      {/* Status Filter Tabs */}
      <div className="flex flex-nowrap overflow-x-auto gap-1.5 pb-1 -mx-1 px-1">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
              statusFilter === tab.value
                ? "bg-brand-navy text-white shadow-sm"
                : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-brand">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">바우처 코드</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">상태</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">발행일</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">만료일</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">사용일</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">사용 지점</th>
            </tr>
          </thead>
          <tbody>
            {filteredVouchers?.map((v) => (
              <tr key={v._id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono text-xs">{v.voucherCode}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} type="voucher" />
                </td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(v.issuedAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{fmtDate(v.expiresAt)}</td>
                <td className="px-4 py-3 text-muted-foreground">{v.usedAt ? fmtDate(v.usedAt) : "-"}</td>
                <td className="px-4 py-3">{getBranchName(v.usedBranchId)}</td>
              </tr>
            ))}
            {filteredVouchers?.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  <Ticket className="size-8 mx-auto mb-2 opacity-30" />
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
