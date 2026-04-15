"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  issued: { label: "발행됨", className: "bg-blue-100 text-blue-700" },
  used: { label: "사용됨", className: "bg-green-100 text-green-700" },
  expired: { label: "만료됨", className: "bg-gray-100 text-gray-500" },
  cancelled: { label: "취소됨", className: "bg-red-100 text-red-700" },
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
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">바우처 관리</h1>
        <Button onClick={() => setDialogOpen(true)}>바우처 발행</Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "issued", "used", "expired", "cancelled"] as StatusFilter[]).map(
          (s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`rounded-full px-3 py-1 text-sm font-medium transition ${
                filter === s
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {s === "all" ? "전체" : statusConfig[s].label}
            </button>
          )
        )}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
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
              <tr key={v._id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono">{v.voucherCode}</td>
                <td className="px-4 py-3">{getBuyerName(v.buyerId)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusConfig[v.status]?.className}`}
                  >
                    {statusConfig[v.status]?.label}
                  </span>
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
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
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
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 mx-4">
            <h2 className="text-xl font-bold mb-4">바우처 발행</h2>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">구매자</label>
                <select
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
