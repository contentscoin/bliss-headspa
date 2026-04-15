import { action, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

interface VoucherExportRow {
  voucherCode: string;
  status: string;
  issuedAt: number;
  expiresAt: number;
  usedAt?: number;
  branchName: string;
}

// 바우처 목록 조회 (internal query for action)
export const getVouchersForExport = internalQuery({
  args: { buyerId: v.id("users") },
  handler: async (ctx, args) => {
    const vouchers = await ctx.db
      .query("vouchers")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .collect();

    const results: VoucherExportRow[] = [];
    for (const voucher of vouchers) {
      let branchName = "";
      if (voucher.usedBranchId) {
        const branch = await ctx.db.get(voucher.usedBranchId);
        branchName = branch?.name ?? "";
      }
      results.push({
        voucherCode: voucher.voucherCode,
        status: voucher.status,
        issuedAt: voucher.issuedAt,
        expiresAt: voucher.expiresAt,
        usedAt: voucher.usedAt,
        branchName,
      });
    }
    return results;
  },
});

const statusLabels: Record<string, string> = {
  issued: "발행됨",
  used: "사용됨",
  expired: "만료됨",
  cancelled: "취소됨",
};

function formatDate(ts?: number): string {
  if (!ts) return "";
  const d = new Date(ts);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// CSV 생성 Action
export const exportVouchers = action({
  args: { buyerId: v.id("users") },
  handler: async (ctx, args): Promise<string> => {
    const vouchers = await ctx.runQuery(internal.voucherExport.getVouchersForExport, {
      buyerId: args.buyerId,
    });

    const header = "바우처코드,상태,발행일,만료일,사용일,사용지점";
    const rows = vouchers.map(
      (row: VoucherExportRow) =>
        `${row.voucherCode},${statusLabels[row.status] ?? row.status},${formatDate(row.issuedAt)},${formatDate(row.expiresAt)},${formatDate(row.usedAt)},${row.branchName}`
    );

    return [header, ...rows].join("\n");
  },
});
