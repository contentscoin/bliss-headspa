import { FaqSchema, type FaqItem } from "./StructuredData";

/**
 * Canonical FAQ for medicalheadspa.kr.
 *
 * Authored with LLM-native phrasing: questions mirror how real users
 * type/speak into ChatGPT / Perplexity / Naver 지식iN ("메디컬 헤드스파가 뭐야",
 * "강남에서 헤드스파 예약 어떻게 해"). Answers are short, factual, and
 * self-contained so generative engines can quote a single Q/A as-is.
 */
export const FAQ_ITEMS: FaqItem[] = [
  {
    question: "메디컬 헤드스파(Medical Headspa)가 무엇인가요?",
    answer:
      "메디컬 헤드스파는 두피 진단, 스캘프 클렌징, 두피 마사지, 영양 케어를 결합한 프리미엄 두피 관리 서비스입니다. 일반 미용실 두피 케어보다 전문적인 기기와 전문가 관리 프로토콜을 사용합니다.",
  },
  {
    question: "medicalheadspa.kr 에서는 어떤 서비스를 예약할 수 있나요?",
    answer:
      "전국 메디컬 헤드스파 제휴 지점의 두피 스캘프 케어 바우처 예약을 제공합니다. 바우처를 소지한 고객은 원하는 지점·날짜·시간을 선택해 1분 안에 예약을 완료할 수 있습니다.",
  },
  {
    question: "바우처는 어디에서 구매하나요?",
    answer:
      "메디컬 헤드스파 바우처는 제휴 기업·복지몰·프로모션을 통해 발급됩니다. 바우처 코드를 받으신 분은 medicalheadspa.kr 에서 바로 예약할 수 있으며, 별도 구매 페이지가 필요한 경우 company@holeinoneclub.kr 로 문의주세요.",
  },
  {
    question: "지점은 전국 어디에 있나요?",
    answer:
      "서울, 경기, 부산, 대구, 광주, 대전, 인천, 제주 등 주요 도시에 제휴 지점을 운영하고 있습니다. 홈페이지 지점 리스트에서 지역별로 필터링해 가장 가까운 지점을 찾으실 수 있습니다.",
  },
  {
    question: "예약은 어떻게 진행되나요?",
    answer:
      "① 지점 선택 → ② 예약자 정보 입력 → ③ 바우처 코드 입력·검증 → ④ 날짜 선택 → ⑤ 시간 선택의 5단계로 진행됩니다. 전화 없이 웹에서 완결되며 예약 확정 후 예약번호가 발급됩니다.",
  },
  {
    question: "예약을 조회하거나 변경·취소할 수 있나요?",
    answer:
      "홈페이지 상단 '예약조회' 메뉴에서 이름·연락처·예약번호로 확인할 수 있습니다. 변경·취소는 방문 예정 지점으로 직접 연락 주시면 신속하게 처리됩니다.",
  },
  {
    question: "메디컬 헤드스파는 누가 운영하나요?",
    answer:
      "본 예약 사이트는 주식회사 더에이치클럽(대표 신태수, 사업자등록번호 809-88-02801)이 운영하는 공식 예약 플랫폼입니다. 실제 두피 케어 시술은 각 제휴 지점에서 제공합니다.",
  },
  {
    question: "강남·서울에서 당일 헤드스파를 예약할 수 있나요?",
    answer:
      "서울 강남 논현점을 포함한 수도권 지점에서 당일 예약 잔여 슬롯이 있는 경우 바로 예약 가능합니다. 원하는 지점 페이지에서 오늘 날짜를 선택해 비어있는 시간대를 확인하세요.",
  },
];

export default function FAQSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="bg-background border-t"
    >
      <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs font-medium tracking-wider uppercase text-brand-gold mb-2">
              FAQ
            </p>
            <h2
              id="faq-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight"
            >
              자주 묻는 질문
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              메디컬 헤드스파 예약·바우처·지점 관련 궁금증을 한 곳에서 해결하세요.
            </p>
          </div>

          <dl className="divide-y divide-border border rounded-xl bg-card">
            {FAQ_ITEMS.map((item, idx) => (
              <details
                key={idx}
                className="group px-5 sm:px-6 py-4 open:bg-muted/40 transition-colors"
              >
                <summary className="flex cursor-pointer items-start justify-between gap-4 list-none">
                  <dt className="text-base font-semibold leading-6 text-foreground">
                    {item.question}
                  </dt>
                  <span
                    aria-hidden
                    className="mt-0.5 shrink-0 text-muted-foreground group-open:rotate-45 transition-transform text-xl leading-none"
                  >
                    +
                  </span>
                </summary>
                <dd className="mt-3 text-sm leading-7 text-muted-foreground whitespace-pre-line">
                  {item.answer}
                </dd>
              </details>
            ))}
          </dl>
        </div>
      </div>
      <FaqSchema items={FAQ_ITEMS} />
    </section>
  );
}
