import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";

// 내부 뮤테이션: SMS 로그 기록
export const logSMS = internalMutation({
  args: {
    type: v.union(
      v.literal("reservation_confirm"),
      v.literal("reservation_notify"),
      v.literal("cancellation"),
      v.literal("reminder")
    ),
    recipientPhone: v.string(),
    message: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed"), v.literal("pending")),
    relatedReservationId: v.optional(v.id("reservations")),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("smsLogs", {
      type: args.type,
      recipientPhone: args.recipientPhone,
      message: args.message,
      status: args.status,
      relatedReservationId: args.relatedReservationId,
      sentAt: Date.now(),
    });
  },
});

// 내부 쿼리: 예약 + 지점 정보 조회
export const getReservationWithBranch = internalQuery({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.db.get(args.reservationId);
    if (!reservation) return null;

    const branch = await ctx.db.get(reservation.branchId);

    return {
      customerName: reservation.customerName,
      customerPhone: reservation.customerPhone,
      reservationNo: reservation.reservationNo,
      reservationDate: reservation.reservationDate,
      reservationTime: reservation.reservationTime,
      branchName: branch?.name ?? "",
      branchPhone: branch?.phone ?? "",
    };
  },
});
