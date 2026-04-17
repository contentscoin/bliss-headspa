import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export const login = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    const passwordHash = await hashPassword(args.password);
    if (user.passwordHash !== passwordHash) {
      throw new Error("아이디 또는 비밀번호가 올바르지 않습니다.");
    }

    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7일

    await ctx.db.insert("sessions", {
      userId: user._id,
      token,
      expiresAt,
    });

    return {
      token,
      user: {
        _id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
      },
    };
  },
});

export const register = mutation({
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("이��� 등록된 아이디입니다.");
    }

    const passwordHash = await hashPassword(args.password);

    const userId = await ctx.db.insert("users", {
      email: args.email,
      passwordHash,
      name: args.name,
      phone: args.phone,
      role: args.role,
    });

    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await ctx.db.insert("sessions", {
      userId,
      token,
      expiresAt,
    });

    return {
      token,
      user: {
        _id: userId,
        email: args.email,
        name: args.name,
        phone: args.phone,
        role: args.role,
      },
    };
  },
});

export const getSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session) return null;

    if (session.expiresAt < Date.now()) {
      return null;
    }

    const user = await ctx.db.get(session.userId);
    if (!user) return null;

    return {
      _id: user._id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      branchId: user.branchId,
    };
  },
});

export const changePassword = mutation({
  args: {
    sessionToken: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.newPassword.length < 4) {
      throw new Error("새 비밀번호는 최소 4자 이상이어야 합니다.");
    }
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      throw new Error("세션이 만료되었습니다. 다시 로그인해 주세요.");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) throw new Error("사용자를 찾을 수 없습니다.");

    const currentHash = await hashPassword(args.currentPassword);
    if (user.passwordHash !== currentHash) {
      throw new Error("현재 비밀번호가 올바르지 않습니다.");
    }

    const newHash = await hashPassword(args.newPassword);
    await ctx.db.patch(user._id, { passwordHash: newHash });

    return { ok: true };
  },
});

export const adminResetPassword = mutation({
  args: {
    userId: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.newPassword.length < 4) {
      throw new Error("비밀번호는 최소 4자 이상이어야 합니다.");
    }
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("사용자를 찾을 수 없습니다.");
    const hash = await hashPassword(args.newPassword);
    await ctx.db.patch(user._id, { passwordHash: hash });
    return { ok: true };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
