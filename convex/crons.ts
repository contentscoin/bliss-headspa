import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// 매일 자정 (KST) = 15:00 UTC: 만료된 바우처 자동 처리
crons.daily("expire vouchers", { hourUTC: 15, minuteUTC: 0 }, internal.vouchers.expireOverdue);

// 매일 오전 9시 (KST) = 00:00 UTC: 다음날 예약 리마인더
crons.daily("send reminders", { hourUTC: 0, minuteUTC: 0 }, internal.reservations.sendReminders);

export default crons;
