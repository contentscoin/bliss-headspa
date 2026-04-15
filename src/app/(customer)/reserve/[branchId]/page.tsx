export default function ReservePage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">예약하기</h1>
      <p className="text-gray-600">날짜와 시간을 선택해 주세요.</p>
    </div>
  );
}
