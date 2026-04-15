import { action, internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// SMS 발송 Action (외부 API 호출 - 현재는 placeholder 구현)
export const sendSMS = action({
  args: {
    phone: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("reservation_confirm"),
      v.literal("reservation_notify"),
      v.literal("cancellation"),
      v.literal("reminder")
    ),
    reservationId: v.optional(v.id("reservations")),
  },
  handler: async (ctx, args) => {
    // TODO: 실제 NHN Cloud TOAST / Aligo API 호출
    // 현재는 console.log로 대체
    console.log(`[SMS] To: ${args.phone}, Message: ${args.message}`);

    // 발송 로그 기록
    await ctx.runMutation(internal.sms.logSMS, {
      type: args.type,
      recipientPhone: args.phone,
      message: args.message,
      status: "sent",
      relatedReservationId: args.reservationId,
    });

    return { success: true };
  },
});

// 예약 확인 SMS (고객 + 점주)
export const sendReservationConfirm = internalAction({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.runQuery(internal.sms.getReservationWithBranch, {
      reservationId: args.reservationId,
    });
    if (!reservation) return;

    const { customerName, customerPhone, reservationNo, reservationDate, reservationTime, branchName, branchPhone } =
      reservation;

    const [month, day] = reservationDate.split("-").slice(1);

    // 고객에게 예약 확인 SMS
    const customerMsg = `[블리스헤드스파] ${branchName} ${parseInt(month)}/${parseInt(day)} ${reservationTime} 예약이 확정되었습니다. 예약번호: ${reservationNo}`;
    await ctx.runAction(internal.sms.sendSMSInternal, {
      phone: customerPhone,
      message: customerMsg,
      type: "reservation_confirm",
      reservationId: args.reservationId,
    });

    // 점주에게 예약 접수 SMS
    if (branchPhone) {
      const ownerMsg = `[예약접수] ${customerName}님 ${parseInt(month)}/${parseInt(day)} ${reservationTime} 예약 접수되었습니다.`;
      await ctx.runAction(internal.sms.sendSMSInternal, {
        phone: branchPhone,
        message: ownerMsg,
        type: "reservation_notify",
        reservationId: args.reservationId,
      });
    }
  },
});

// 예약 취소 SMS
export const sendCancellationSMS = internalAction({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.runQuery(internal.sms.getReservationWithBranch, {
      reservationId: args.reservationId,
    });
    if (!reservation) return;

    const msg = `[블리스헤드스파] 예약이 취소되었습니다. 예약번호: ${reservation.reservationNo}`;
    await ctx.runAction(internal.sms.sendSMSInternal, {
      phone: reservation.customerPhone,
      message: msg,
      type: "cancellation",
      reservationId: args.reservationId,
    });
  },
});

// Internal SMS 발송 (다른 action에서 호출용)
export const sendSMSInternal = internalAction({
  args: {
    phone: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("reservation_confirm"),
      v.literal("reservation_notify"),
      v.literal("cancellation"),
      v.literal("reminder")
    ),
    reservationId: v.optional(v.id("reservations")),
  },
  handler: async (ctx, args) => {
    console.log(`[SMS] To: ${args.phone}, Message: ${args.message}`);

    await ctx.runMutation(internal.sms.logSMS, {
      type: args.type,
      recipientPhone: args.phone,
      message: args.message,
      status: "sent",
      relatedReservationId: args.reservationId,
    });

    return { success: true };
  },
});

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
