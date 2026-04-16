import { query } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("smsLogs").order("desc").collect();
  },
});

export const listFiltered = query({
  args: {
    status: v.optional(
      v.union(v.literal("sent"), v.literal("failed"), v.literal("pending"))
    ),
    type: v.optional(
      v.union(
        v.literal("reservation_confirm"),
        v.literal("reservation_notify"),
        v.literal("cancellation"),
        v.literal("reminder")
      )
    ),
    search: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let logs;
    if (args.status) {
      logs = await ctx.db
        .query("smsLogs")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    } else {
      logs = await ctx.db.query("smsLogs").order("desc").collect();
    }

    if (args.type) {
      logs = logs.filter((l) => l.type === args.type);
    }
    if (args.search) {
      const q = args.search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.recipientPhone.includes(q) ||
          l.message.toLowerCase().includes(q)
      );
    }
    return logs;
  },
});
