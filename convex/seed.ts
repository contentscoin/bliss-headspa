import { internalMutation, mutation } from "./_generated/server";

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

type BranchSeed = {
  name: string;
  region: string;
  address: string;
};

const BRANCHES: BranchSeed[] = [
  // 서울
  { region: "서울", name: "메디컬헤드스파 논현점", address: "서울 강남구 언주로 720 B3" },
  { region: "서울", name: "메디컬헤드스파 압구정점", address: "서울 강남구 논현로 168길 20 (신사동 600-3) 2F 201호" },
  { region: "서울", name: "메디컬헤드스파 강남점", address: "서울 서초구 서초대로 78길 36 강남지웰타워 10F" },
  { region: "서울", name: "메디컬헤드스파 강서마곡점", address: "서울 강서구 강서로 385 우성에스비타워 10F 1001호" },
  { region: "서울", name: "메디컬헤드스파 목동점", address: "서울 양천구 오목로 345 목동 슬로우스퀘어 B113호" },
  { region: "서울", name: "메디컬헤드스파 사당점", address: "서울 서초구 동작대로 70 하나빌딩 2F" },
  { region: "서울", name: "메디컬헤드스파 삼성점", address: "서울 강남구 테헤란로 87길 25 전방빌딩 6F" },
  { region: "서울", name: "메디컬헤드스파 상왕십리점", address: "서울 성동구 왕십리로 410 센트라스상가 L동 3F" },
  { region: "서울", name: "메디컬헤드스파 서래점", address: "서울 서초구 반포동 92-15 2F" },
  { region: "서울", name: "메디컬헤드스파 서울대점", address: "서울 관악구 관악로 164 대우디오슈페리움1단지 3F" },
  { region: "서울", name: "메디컬헤드스파 송파점", address: "서울 송파구 송파대로 201 송파 테라타워 B동" },
  { region: "서울", name: "메디컬헤드스파 수유점", address: "서울 강북구 수유동 229-49 경남아너스빌 3F" },
  { region: "서울", name: "메디컬헤드스파 시청점", address: "서울 중구 남대문로 9길 51 효덕빌딩 517호" },
  { region: "서울", name: "메디컬헤드스파 신용산점", address: "서울 용산구 한강대로 95 래미안용산 더 센트럴 A동 B232호" },
  { region: "서울", name: "메디컬헤드스파 은평점", address: "서울 은평구 통일로 863 유화프라자 401호" },
  { region: "서울", name: "메디컬헤드스파 천호점", address: "서울 강동구 천호대로 1006 브라운스톤천호 408호" },
  { region: "서울", name: "메디컬헤드스파 홍대점", address: "서울 마포구 신촌로2안길 29 2F 저스트빌딩바이케이" },
  // 경기
  { region: "경기", name: "메디컬헤드스파 파주 운정점", address: "경기 파주시 경의로 1240번길 14-31, 8F 801호" },
  { region: "경기", name: "메디컬헤드스파 김포점", address: "경기 김포시 김포한강4로 513 채움테라스 3F 307호" },
  { region: "경기", name: "메디컬헤드스파 부천 상동점", address: "경기 부천시 원미구 상동로 90 메가플러스빌딩 305호" },
  { region: "경기", name: "메디컬헤드스파 부천 중동점", address: "경기 부천시 길주로 300 롯데백화점 5F" },
  { region: "경기", name: "메디컬헤드스파 분당 미금점", address: "경기 성남시 분당구 돌마로 73 우방코아빌딩 505호" },
  { region: "경기", name: "메디컬헤드스파 분당 서현점", address: "경기 성남시 분당구 황새울로 325 서현하우비 302호" },
  { region: "경기", name: "메디컬헤드스파 분당 판교점", address: "경기 성남시 분당구 판교역로 235 H스퀘어 N동 202호" },
  { region: "경기", name: "메디컬헤드스파 평택 서정점", address: "경기 평택시 서정동 847-2 2F" },
  { region: "경기", name: "메디컬헤드스파 평택점", address: "경기 평택시 중앙2로 13 2F 206호 (평택동, 센텀스카이)" },
  { region: "경기", name: "메디컬헤드스파 수원 영통점", address: "경기 수원시 영통구 청명남로 21 아셈프라자 202호" },
  { region: "경기", name: "메디컬헤드스파 수원 인계점", address: "경기 수원시 팔달구 효원로 278 파비오더씨타 424호" },
  { region: "경기", name: "메디컬헤드스파 안산점", address: "경기 안산시 단원구 예술대학로 9 보배프라자 4F" },
  { region: "경기", name: "메디컬헤드스파 일산점", address: "경기 고양시 일산동구 정발산로 38 이스턴시티 502호" },
  { region: "경기", name: "메디컬헤드스파 평촌점", address: "경기 안양시 동안구 시민대로 175 2F 201호" },
  { region: "경기", name: "메디컬헤드스파 화성향남점", address: "경기 화성시 향남읍 하길리 1465 탑스프라자 305호" },
  { region: "경기", name: "메디컬헤드스파 동탄점", address: "경기 화성시 동탄대로5길 15 그랑파사쥬 3028,3029호" },
  // 울산
  { region: "울산", name: "메디컬헤드스파 울산 성남점", address: "울산시 중구 젊음의거리 30-6 3F" },
  { region: "울산", name: "메디컬헤드스파 울산 송정점", address: "울산 북구 송정동 1232-3 에어스타타워 6F 606호" },
  { region: "울산", name: "메디컬헤드스파 울산 우정혁신점", address: "울산광역시 중구 종가로 310, M타워 408호" },
  // 부산
  { region: "부산", name: "메디컬헤드스파 부산 명지점", address: "부산 강서구 명지국제6로 99 대방디엠시티센텀오션1차 A동 203" },
  { region: "부산", name: "메디컬헤드스파 부산 해운대점", address: "부산 해운대구 마린시티2로 33 해운대두산제니스스퀘어 5F B동" },
  // 인천
  { region: "인천", name: "메디컬헤드스파 인천 부평점", address: "인천 부평구 경원대로 1404 그랑프리빌딩 410호" },
  { region: "인천", name: "메디컬헤드스파 인천 송도점", address: "인천 연수구 해돋이로151번길 4 인피니티타워 4F 403호" },
  { region: "인천", name: "메디컬헤드스파 인천 주안점", address: "인천 미추홀구 미추홀대로 719번길 4 부성파인 2F 206호" },
  { region: "인천", name: "메디컬헤드스파 인천 청라점", address: "인천 서구 청라라임로 57 영화블렌하임 2F 201호" },
  { region: "인천", name: "메디컬헤드스파 인천 검단점", address: "인천 서구 이음대로 388 5F 511호 (원당동, ABM타워)" },
  { region: "인천", name: "메디컬헤드스파 인천 영종도점", address: "인천광역시 중구 중산동 1876-13 스카이에비뉴1 6F" },
  // 강원
  { region: "강원", name: "메디컬헤드스파 강원 원주점", address: "강원 원주시 능라동길 51 2F 208호" },
  // 충북
  { region: "충북", name: "메디컬헤드스파 충북 청주점", address: "충북 청주시 흥덕구 대농로 70 센트럴타워 205호" },
  // 충남
  { region: "충남", name: "메디컬헤드스파 천안 쌍용점", address: "충남 천안시 서북구 월봉로 89 코아빌딩 5F" },
  // 세종
  { region: "세종", name: "메디컬헤드스파 세종점", address: "세종특별자치시 호려울로 9 네이버타워 3F" },
  { region: "세종", name: "메디컬헤드스파 세종 새롬점", address: "세종 새롬동 574 크리스마스빌딩 419호" },
  // 대전
  { region: "대전", name: "메디컬헤드스파 대전 (본사)", address: "대전광역시 유성구 반석로 23 제일프라자 10F" },
  { region: "대전", name: "메디컬헤드스파 대전 반석점(직영)", address: "대전 유성구 반석로 23 1003호" },
  { region: "대전", name: "메디컬헤드스파 대전 프리미엄점", address: "대전 서구 계룡로 598 8F" },
  { region: "대전", name: "메디컬헤드스파 대전점", address: "대전 서구 대덕대로 195번길 58 (더프라임시티 206호)" },
  { region: "대전", name: "메디컬헤드스파 서대전점", address: "대전 중구 계룡로 876 메종드메디컬 빌딩 601호" },
  { region: "대전", name: "메디컬헤드스파 유성대덕점", address: "대전 유성구 테크노중앙로 65 남정2빌딩 301호" },
  // 전남
  { region: "전남", name: "메디컬헤드스파 여수점", address: "전남 여수시 시청동1길 17 센트럴타워 4F" },
  { region: "전남", name: "메디컬헤드스파 순천점 (신대지구)", address: "전남 순천시 해룡면 신대리 1992 2F" },
  // 전북
  { region: "전북", name: "메디컬헤드스파 전주 만성점", address: "전북 전주시 덕진구 만성중앙로 54-47 2F 203호" },
  { region: "전북", name: "메디컬헤드스파 전주 서신점", address: "전북 전주시 완산구 여울로 19 4F" },
  { region: "전북", name: "메디컬헤드스파 전주 효천점", address: "전북 전주시 완산구 천잠로 65" },
  // 대구
  { region: "대구", name: "메디컬헤드스파 롯데백화점 대구점", address: "대구광역시 북구 태평로 161 4F" },
  { region: "대구", name: "메디컬헤드스파 롯데백화점 상인점", address: "대구광역시 달서구 월배로 232 롯데백화점 상인점 3F" },
  { region: "대구", name: "메디컬헤드스파 대구점", address: "대구 중구 동성로1길 74 2F" },
];

export const seedData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const existingAdmin = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", "admin"))
      .first();

    if (existingAdmin) {
      return "시드 데이터가 이미 존재합니다. 중복 생성을 건너뜁니다.";
    }

    const adminPasswordHash = await hashPassword("1234");
    await ctx.db.insert("users", {
      email: "admin",
      passwordHash: adminPasswordHash,
      name: "관리자",
      phone: "010-0000-0000",
      role: "super_admin",
    });

    const buyerPasswordHash = await hashPassword("buyer1234");
    await ctx.db.insert("users", {
      email: "buyer@blissheadspa.com",
      passwordHash: buyerPasswordHash,
      name: "바우처구매자",
      phone: "010-1111-1111",
      role: "buyer",
    });

    return "기본 계정 생성 완료 (admin / buyer)";
  },
});

/**
 * 모든 더미 지점/지점관리자/관련 예약을 삭제하고
 * 엑셀 기준 63개 지점과 MH001~MH063 지점관리자 계정(비번 1234)을 새로 생성합니다.
 * super_admin / buyer / customer 계정은 보존합니다.
 */
export const resetBranches = mutation({
  args: {},
  handler: async (ctx) => {
    // 1) 기존 예약 모두 삭제 (지점 의존)
    const reservations = await ctx.db.query("reservations").collect();
    for (const r of reservations) await ctx.db.delete(r._id);

    // 2) 기존 SMS 로그 중 예약 연결된 것 정리 (참조 무결성)
    const smsLogs = await ctx.db.query("smsLogs").collect();
    for (const log of smsLogs) {
      if (log.relatedReservationId) await ctx.db.delete(log._id);
    }

    // 3) 기존 branch_admin 사용자 + 그들의 세션 삭제
    const branchAdmins = await ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "branch_admin"))
      .collect();
    for (const u of branchAdmins) {
      const sessions = await ctx.db
        .query("sessions")
        .withIndex("by_user", (q) => q.eq("userId", u._id))
        .collect();
      for (const s of sessions) await ctx.db.delete(s._id);
      await ctx.db.delete(u._id);
    }

    // 4) 기존 지점 모두 삭제
    const oldBranches = await ctx.db.query("branches").collect();
    for (const b of oldBranches) await ctx.db.delete(b._id);

    // 5) 새 지점 + 지점관리자 생성
    const passwordHash = await hashPassword("1234");
    const created: Array<{ code: string; name: string }> = [];

    for (let i = 0; i < BRANCHES.length; i++) {
      const seed = BRANCHES[i];
      const code = `MH${String(i + 1).padStart(3, "0")}`;

      const branchId = await ctx.db.insert("branches", {
        branchCode: code,
        name: seed.name,
        region: seed.region,
        address: seed.address,
        phone: "",
        lat: 0,
        lng: 0,
        businessHours: "10:00-20:00",
        isActive: true,
      });

      await ctx.db.insert("users", {
        email: code,
        passwordHash,
        name: `${seed.name} 관리자`,
        phone: "",
        role: "branch_admin",
        branchId,
      });

      created.push({ code, name: seed.name });
    }

    return {
      message: `지점 ${created.length}개 및 지점관리자 계정 생성 완료 (비밀번호: 1234)`,
      created,
    };
  },
});
