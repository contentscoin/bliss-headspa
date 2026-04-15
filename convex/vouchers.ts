import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function generateVoucherCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "BHS-";
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("vouchers").collect();
  },
});

export const getByCode = query({
  args: { voucherCode: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vouchers")
      .withIndex("by_code", (q) => q.eq("voucherCode", args.voucherCode))
      .first();
  },
});

export const listByBuyer = query({
  args: { buyerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vouchers")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .collect();
  },
});

export const listByStatus = query({
  args: {
    status: v.union(
      v.literal("issued"),
      v.literal("used"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("vouchers")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .collect();
  },
});

export const create = mutation({
  args: {
    buyerId: v.id("users"),
    expiresAt: v.number(),
    count: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const total = args.count ?? 1;
    const ids = [];

    for (let i = 0; i < total; i++) {
      let code = generateVoucherCode();
      let existing = await ctx.db
        .query("vouchers")
        .withIndex("by_code", (q) => q.eq("voucherCode", code))
        .first();
      while (existing) {
        code = generateVoucherCode();
        existing = await ctx.db
          .query("vouchers")
          .withIndex("by_code", (q) => q.eq("voucherCode", code))
          .first();
      }

      const id = await ctx.db.insert("vouchers", {
        voucherCode: code,
        buyerId: args.buyerId,
        status: "issued",
        issuedAt: now,
        expiresAt: args.expiresAt,
      });
      ids.push({ id, voucherCode: code });
    }

    return ids;
  },
});

export const use = mutation({
  args: {
    voucherId: v.id("vouchers"),
    branchId: v.id("branches"),
  },
  handler: async (ctx, args) => {
    const voucher = await ctx.db.get(args.voucherId);
    if (!voucher) throw new Error("Voucher not found");
    if (voucher.status !== "issued") throw new Error("바우처가 사용 가능한 상태가 아닙니다.");
    if (voucher.expiresAt < Date.now()) throw new Error("만료된 바우처입니다.");

    await ctx.db.patch(args.voucherId, {
      status: "used",
      usedAt: Date.now(),
      usedBranchId: args.branchId,
    });
  },
});

export const cancel = mutation({
  args: { voucherId: v.id("vouchers") },
  handler: async (ctx, args) => {
    const voucher = await ctx.db.get(args.voucherId);
    if (!voucher) throw new Error("Voucher not found");
    if (voucher.status === "used") throw new Error("이미 사용된 바우처는 취소할 수 없습니다.");

    await ctx.db.patch(args.voucherId, { status: "cancelled" });
  },
});
