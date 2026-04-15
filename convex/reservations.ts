import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

function generateReservationNo(): string {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RSV-${ymd}-${rand}`;
}

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("reservations").collect();
  },
});

export const getByBranch = query({
  args: {
    branchId: v.id("branches"),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("reservations")
      .withIndex("by_branch", (q) => q.eq("branchId", args.branchId))
      .collect();

    if (args.date) {
      return results.filter((r) => r.reservationDate === args.date);
    }
    return results;
  },
});

export const getByReservationNo = query({
  args: { reservationNo: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reservations")
      .withIndex("by_reservationNo", (q) =>
        q.eq("reservationNo", args.reservationNo)
      )
      .first();
  },
});

export const getByCustomerPhone = query({
  args: { customerPhone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("reservations")
      .withIndex("by_customerPhone", (q) =>
        q.eq("customerPhone", args.customerPhone)
      )
      .collect();
  },
});

export const create = mutation({
  args: {
    branchId: v.id("branches"),
    voucherId: v.id("vouchers"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    reservationDate: v.string(),
    reservationTime: v.string(),
  },
  handler: async (ctx, args) => {
    const voucher = await ctx.db.get(args.voucherId);
    if (!voucher) throw new Error("Voucher not found");
    if (voucher.status !== "issued") throw new Error("바우처가 사용 가능한 상태가 아닙니다.");
    if (voucher.expiresAt < Date.now()) throw new Error("만료된 바우처입니다.");

    const branch = await ctx.db.get(args.branchId);
    if (!branch) throw new Error("Branch not found");
    if (!branch.isActive) throw new Error("비활성 지점입니다.");

    const reservationNo = generateReservationNo();

    const reservationId = await ctx.db.insert("reservations", {
      reservationNo,
      branchId: args.branchId,
      voucherId: args.voucherId,
      customerName: args.customerName,
      customerPhone: args.customerPhone,
      customerEmail: args.customerEmail,
      reservationDate: args.reservationDate,
      reservationTime: args.reservationTime,
      status: "confirmed",
    });

    await ctx.db.patch(args.voucherId, {
      status: "used",
      usedAt: Date.now(),
      usedBranchId: args.branchId,
    });

    return { reservationId, reservationNo };
  },
});

export const updateStatus = mutation({
  args: {
    reservationId: v.id("reservations"),
    status: v.union(
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.reservationId);
    if (!existing) throw new Error("Reservation not found");
    await ctx.db.patch(args.reservationId, { status: args.status });
  },
});

export const cancel = mutation({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) throw new Error("Reservation not found");
    if (reservation.status === "cancelled") throw new Error("이미 취소된 예약입니다.");

    await ctx.db.patch(args.reservationId, { status: "cancelled" });

    await ctx.db.patch(reservation.voucherId, {
      status: "issued",
      usedAt: undefined,
      usedBranchId: undefined,
    });
  },
});
