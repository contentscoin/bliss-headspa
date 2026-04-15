import { query, mutation, internalAction, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

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

    // 예약 확인 SMS 발송 (비동기)
    await ctx.scheduler.runAfter(0, internal.sms.sendReservationConfirm, {
      reservationId,
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

    // 취소 SMS 발송 (비동기)
    await ctx.scheduler.runAfter(0, internal.sms.sendCancellationSMS, {
      reservationId: args.reservationId,
    });
  },
});

// Cron: 내일 예약 리마인더 SMS 발송
export const sendReminders = internalAction({
  handler: async (ctx) => {
    // 내일 날짜 계산 (KST)
    const now = new Date();
    const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
    const tomorrow = new Date(kst);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;

    const reservations = await ctx.runQuery(internal.reservations.getConfirmedByDate, {
      date: tomorrowStr,
    });

    for (const r of reservations) {
      const [month, day] = r.reservationDate.split("-").slice(1);
      const msg = `[블리스헤드스파] 내일 ${parseInt(month)}/${parseInt(day)} ${r.reservationTime} 예약이 있습니다. 예약번호: ${r.reservationNo}`;
      await ctx.runAction(internal.sms.sendSMSInternal, {
        phone: r.customerPhone,
        message: msg,
        type: "reminder",
        reservationId: r._id,
      });
    }
  },
});

// Internal query: 특정 날짜의 confirmed 예약 조회
export const getConfirmedByDate = internalQuery({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const reservations = await ctx.db
      .query("reservations")
      .withIndex("by_date", (q) => q.eq("reservationDate", args.date))
      .collect();
    return reservations.filter((r) => r.status === "confirmed");
  },
});
