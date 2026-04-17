import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    if (args.activeOnly) {
      return await ctx.db
        .query("branches")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .collect();
    }
    return await ctx.db.query("branches").collect();
  },
});

export const getById = query({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.branchId);
  },
});

export const getByRegion = query({
  args: { region: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("branches")
      .withIndex("by_region", (q) => q.eq("region", args.region))
      .collect();
  },
});

export const create = mutation({
  args: {
    branchCode: v.optional(v.string()),
    name: v.string(),
    region: v.string(),
    address: v.string(),
    phone: v.string(),
    lat: v.number(),
    lng: v.number(),
    businessHours: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("branches", {
      ...args,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    branchId: v.id("branches"),
    branchCode: v.optional(v.string()),
    name: v.optional(v.string()),
    region: v.optional(v.string()),
    address: v.optional(v.string()),
    phone: v.optional(v.string()),
    lat: v.optional(v.number()),
    lng: v.optional(v.number()),
    businessHours: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { branchId, ...updates } = args;
    const existing = await ctx.db.get(branchId);
    if (!existing) throw new Error("Branch not found");

    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(branchId, filtered);
  },
});

export const toggleActive = mutation({
  args: { branchId: v.id("branches") },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.branchId);
    if (!existing) throw new Error("Branch not found");
    await ctx.db.patch(args.branchId, { isActive: !existing.isActive });
  },
});
