import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
  },
});

export const listByRole = query({
  args: {
    role: v.union(
      v.literal("customer"),
      v.literal("branch_admin"),
      v.literal("buyer"),
      v.literal("super_admin")
    ),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", args.role))
      .collect();
  },
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const create = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("branch_admin"),
      v.literal("buyer"),
      v.literal("super_admin")
    ),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("이미 등록된 이메일입니다.");

    const { password, ...rest } = args;
    const passwordHash = await hashPassword(password);
    return await ctx.db.insert("users", { ...rest, passwordHash });
  },
});

export const update = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("customer"),
        v.literal("branch_admin"),
        v.literal("buyer"),
        v.literal("super_admin")
      )
    ),
    branchId: v.optional(v.id("branches")),
  },
  handler: async (ctx, args) => {
    const { userId, ...updates } = args;
    const existing = await ctx.db.get(userId);
    if (!existing) throw new Error("User not found");

    const filtered = Object.fromEntries(
      Object.entries(updates).filter(([, v]) => v !== undefined)
    );
    await ctx.db.patch(userId, filtered);
  },
});
