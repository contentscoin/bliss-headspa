import { Badge } from "@/components/ui/badge";

type ReservationStatus = "confirmed" | "completed" | "cancelled" | "no_show";
type VoucherStatus = "issued" | "used" | "expired" | "cancelled";

const RESERVATION_STATUS: Record<ReservationStatus, { label: string; className: string }> = {
  confirmed: {
    label: "예약확정",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  completed: {
    label: "이용완료",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  cancelled: {
    label: "취소",
    className: "bg-muted text-muted-foreground border-border",
  },
  no_show: {
    label: "노쇼",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

const VOUCHER_STATUS: Record<VoucherStatus, { label: string; className: string }> = {
  issued: {
    label: "발행됨",
    className: "bg-blue-50 text-blue-700 border-blue-200",
  },
  used: {
    label: "사용됨",
    className: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  expired: {
    label: "만료됨",
    className: "bg-muted text-muted-foreground border-border",
  },
  cancelled: {
    label: "취소됨",
    className: "bg-red-50 text-red-700 border-red-200",
  },
};

interface StatusBadgeProps {
  status: string;
  type: "reservation" | "voucher";
  className?: string;
}

export default function StatusBadge({ status, type, className = "" }: StatusBadgeProps) {
  const config = type === "reservation"
    ? RESERVATION_STATUS[status as ReservationStatus]
    : VOUCHER_STATUS[status as VoucherStatus];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge
      variant="outline"
      className={`${config.className} font-medium ${className}`}
    >
      {config.label}
    </Badge>
  );
}
