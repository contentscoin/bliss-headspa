import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const branches = await ctx.db.query("branches").collect();
    const totalBranches = branches.length;

    const vouchers = await ctx.db
      .query("vouchers")
      .withIndex("by_status", (q) => q.eq("status", "issued"))
      .collect();
    const activeVouchers = vouchers.length;

    const today = new Date().toISOString().slice(0, 10);
    const todayReservations = await ctx.db
      .query("reservations")
      .withIndex("by_date", (q) => q.eq("reservationDate", today))
      .collect();
    const todayCount = todayReservations.filter(
      (r) => r.status === "confirmed"
    ).length;

    const now = new Date();
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    const allReservations = await ctx.db.query("reservations").collect();
    const monthCount = allReservations.filter(
      (r) => r.reservationDate >= monthStart
    ).length;

    return {
      totalBranches,
      activeVouchers,
      todayReservations: todayCount,
      monthReservations: monthCount,
    };
  },
});
