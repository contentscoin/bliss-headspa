"use node";

import { action, internalAction } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { SolapiMessageService } from "solapi";

function getSolapiClient(): SolapiMessageService {
  const apiKey = process.env.SOLAPI_API_KEY;
  const apiSecret = process.env.SOLAPI_API_SECRET;
  if (!apiKey || !apiSecret) {
    throw new Error("SOLAPI_API_KEY 또는 SOLAPI_API_SECRET이 설정되지 않았습니다.");
  }
  return new SolapiMessageService(apiKey, apiSecret);
}

function getSenderNumber(): string {
  const from = process.env.SOLAPI_SENDER_NUMBER;
  if (!from) throw new Error("SOLAPI_SENDER_NUMBER가 설정되지 않았습니다.");
  return from;
}

// SMS 발송 Action (public)
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
    let status: "sent" | "failed" = "sent";

    try {
      const client = getSolapiClient();
      await client.sendOne({
        to: args.phone.replace(/-/g, ""),
        from: getSenderNumber(),
        text: args.message,
      });
    } catch (err) {
      console.error("[SMS 발송 실패]", err);
      status = "failed";
    }

    await ctx.runMutation(internal.smsHelpers.logSMS, {
      type: args.type,
      recipientPhone: args.phone,
      message: args.message,
      status,
      relatedReservationId: args.reservationId,
    });

    return { success: status === "sent" };
  },
});

// 예약 확인 SMS (고객 + 점주)
export const sendReservationConfirm = internalAction({
  args: { reservationId: v.id("reservations") },
  handler: async (ctx, args) => {
    const reservation = await ctx.runQuery(internal.smsHelpers.getReservationWithBranch, {
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
    const reservation = await ctx.runQuery(internal.smsHelpers.getReservationWithBranch, {
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
    let status: "sent" | "failed" = "sent";

    try {
      const client = getSolapiClient();
      await client.sendOne({
        to: args.phone.replace(/-/g, ""),
        from: getSenderNumber(),
        text: args.message,
      });
    } catch (err) {
      console.error("[SMS 발송 실패]", err);
      status = "failed";
    }

    await ctx.runMutation(internal.smsHelpers.logSMS, {
      type: args.type,
      recipientPhone: args.phone,
      message: args.message,
      status,
      relatedReservationId: args.reservationId,
    });

    return { success: status === "sent" };
  },
});
