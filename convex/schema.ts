import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.string(),
    name: v.string(),
    phone: v.string(),
    role: v.union(
      v.literal("customer"),
      v.literal("branch_admin"),
      v.literal("buyer"),
      v.literal("super_admin")
    ),
    branchId: v.optional(v.id("branches")),
  })
    .index("by_email", ["email"])
    .index("by_role", ["role"])
    .index("by_branch", ["branchId"]),

  branches: defineTable({
    name: v.string(),
    region: v.string(),
    address: v.string(),
    phone: v.string(),
    lat: v.number(),
    lng: v.number(),
    businessHours: v.string(),
    isActive: v.boolean(),
  })
    .index("by_region", ["region"])
    .index("by_name", ["name"])
    .index("by_active", ["isActive"]),

  vouchers: defineTable({
    voucherCode: v.string(),
    buyerId: v.id("users"),
    status: v.union(
      v.literal("issued"),
      v.literal("used"),
      v.literal("expired"),
      v.literal("cancelled")
    ),
    issuedAt: v.number(),
    expiresAt: v.number(),
    usedAt: v.optional(v.number()),
    usedBranchId: v.optional(v.id("branches")),
  })
    .index("by_code", ["voucherCode"])
    .index("by_buyer", ["buyerId"])
    .index("by_status", ["status"]),

  reservations: defineTable({
    reservationNo: v.string(),
    branchId: v.id("branches"),
    voucherId: v.id("vouchers"),
    customerName: v.string(),
    customerPhone: v.string(),
    customerEmail: v.string(),
    reservationDate: v.string(),
    reservationTime: v.string(),
    status: v.union(
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
  })
    .index("by_reservationNo", ["reservationNo"])
    .index("by_branch", ["branchId"])
    .index("by_voucher", ["voucherId"])
    .index("by_date", ["reservationDate"])
    .index("by_status", ["status"])
    .index("by_customerPhone", ["customerPhone"]),

  smsLogs: defineTable({
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
    sentAt: v.number(),
    retryCount: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_reservation", ["relatedReservationId"]),

  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_user", ["userId"]),
});
