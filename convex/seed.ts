import { internalMutation } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const seedData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Check if admin already exists to prevent duplicate seeding
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin"))
      .first();

    if (existingAdmin) {
      return "시드 데이터가 이미 존재합니다. 중복 생성을 건너뜁니다.";
    }

    const created: string[] = [];

    // Create super_admin user (login: admin / 1234)
    const adminPasswordHash = await hashPassword("1234");
    await ctx.db.insert("users", {
      email: "admin",
      passwordHash: adminPasswordHash,
      name: "관리자",
      phone: "010-0000-0000",
      role: "super_admin",
    });
    created.push("super_admin 사용자 (admin)");

    // Create sample branch
    await ctx.db.insert("branches", {
      name: "블리스 헤드스파 강남점",
      region: "서울",
      address: "서울특별시 강남구 테헤란로 123",
      phone: "02-1234-5678",
      lat: 37.5012,
      lng: 127.0396,
      businessHours: "10:00-20:00",
      isActive: true,
    });
    created.push("지점 (블리스 헤드스파 강남점)");

    // Create buyer user
    const buyerPasswordHash = await hashPassword("buyer1234");
    await ctx.db.insert("users", {
      email: "buyer@blissheadspa.com",
      passwordHash: buyerPasswordHash,
      name: "바우처구매자",
      phone: "010-1111-1111",
      role: "buyer",
    });
    created.push("buyer 사용자 (buyer@blissheadspa.com)");

    return `시드 데이터 생성 완료: ${created.join(", ")}`;
  },
});
