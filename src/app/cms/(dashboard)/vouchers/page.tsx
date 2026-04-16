"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import type { Id } from "../../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import StatusBadge from "@/components/shared/StatusBadge";
import PageHeader from "@/components/shared/PageHeader";

const statusLabels: Record<string, string> = {
  issued: "발행됨",
  used: "사용됨",
  expired: "만료됨",
  cancelled: "취소됨",
};

type StatusFilter = "all" | "issued" | "used" | "expired" | "cancelled";

export default function VouchersPage() {
  const allVouchers = useQuery(api.vouchers.listAll);
  const buyers = useQuery(api.users.listByRole, { role: "buyer" });
  const branches = useQuery(api.branches.list, {});
  const createVoucher = useMutation(api.vouchers.create);
  const cancelVoucher = useMutation(api.vouchers.cancel);

  const [filter, setFilter] = useState<StatusFilter>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [buyerId, setBuyerId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [count, setCount] = useState("1");

  const vouchers =
    filter === "all"
      ? allVouchers
      : allVouchers?.filter((v) => v.status === filter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerId) return;
    try {
      await createVoucher({
        buyerId: buyerId as Id<"users">,
        expiresAt: new Date(expiresAt).getTime(),
        count: parseInt(count) || 1,
      });
      toast.success("바우처가 발행되었습니다");
      setDialogOpen(false);
      setBuyerId("");
      setExpiresAt("");
      setCount("1");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "오류가 발생했습니다");
    }
  };

  const getBranchName = (branchId?: Id<"branches">) => {
    if (!branchId || !branches) return "-";
    return branches.find((b) => b._id === branchId)?.name ?? "-";
  };

  const getBuyerName = (id: Id<"users">) => {
    if (!buyers) return "-";
    return buyers.find((b) => b._id === id)?.name ?? "-";
  };

  const fmtDate = (ts: number) => new Date(ts).toLocaleDateString("ko-KR");

  if (allVouchers === undefined) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">바우처 관리</h1>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="바우처 관리" description="바우처 발행 및 현황을 관리합니다.">
        <Button onClick={() => setDialogOpen(true)}>바우처 발행</Button>
      </PageHeader>

      {/* Status Filter */}
      <div className="flex flex-nowrap overflow-x-auto gap-1.5 pb-1">
        {(["all", "issued", "used", "expired", "cancelled"] as StatusFilter[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
                filter === s
                  ? "bg-brand-navy text-white shadow-sm"
                  : "bg-secondary text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {s === "all" ? "전체" : statusLabels[s]}
            </button>
          )
        )}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-brand">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium">바우처 코드</th>
              <th className="px-4 py-3 text-left font-medium">구매자</th>
              <th className="px-4 py-3 text-left font-medium">상태</th>
              <th className="px-4 py-3 text-left font-medium">발행일</th>
              <th className="px-4 py-3 text-left font-medium">만료일</th>
              <th className="px-4 py-3 text-left font-medium">사용 지점</th>
              <th className="px-4 py-3 text-left font-medium">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vouchers?.map((v) => (
              <tr key={v._id} className="hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 font-mono">{v.voucherCode}</td>
                <td className="px-4 py-3">{getBuyerName(v.buyerId)}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={v.status} type="voucher" />
                </td>
                <td className="px-4 py-3">{fmtDate(v.issuedAt)}</td>
                <td className="px-4 py-3">{fmtDate(v.expiresAt)}</td>
                <td className="px-4 py-3">{getBranchName(v.usedBranchId)}</td>
                <td className="px-4 py-3">
                  {v.status === "issued" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        try {
                          await cancelVoucher({ voucherId: v._id });
                          toast.success("바우처가 취소되었습니다");
                        } catch (err) {
                          toast.error(err instanceof Error ? err.message : "오류가 발생했습니다");
                        }
                      }}
                    >
                      취소
                    </Button>
                  )}
                </td>
              </tr>
            ))}
            {vouchers?.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  바우처가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Dialog */}
      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-card rounded-2xl shadow-brand-lg border border-border w-full max-w-md p-6 mx-4">
            <h2 className="text-xl font-bold mb-4">바우처 발행</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">구매자</label>
                <select
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={buyerId}
                  onChange={(e) => setBuyerId(e.target.value)}
                  required
                >
                  <option value="">선택</option>
                  {buyers?.map((b) => (
                    <option key={b._id} value={b._id}>
                      {b.name} ({b.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">만료일</label>
                <input
                  type="date"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">수량</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setDialogOpen(false)}
                >
                  취소
                </Button>
                <Button type="submit">발행</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
