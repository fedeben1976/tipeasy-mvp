export type TipStatus =
  | "pending"
  | "processing"
  | "approved"
  | "rejected"
  | "cancelled"
  | "failed"
  | "refunded";

export interface PublicProfile {
  id: string;
  publicSlug: string;
  displayName: string;
  category: string;
  description: string | null;
  city: string | null;
  profileImage: string | null;
  suggestedAmounts: number[];
  allowCustom: boolean;
  minAmount: number;
  maxAmount: number;
  currency: string;
}

export interface TipSummary {
  id: string;
  amount: number;
  currency: string;
  senderName: string | null;
  message: string | null;
  status: TipStatus;
  createdAt: string;
  approvedAt: string | null;
}

export interface DashboardStats {
  todayTotal: number;
  weekTotal: number;
  monthTotal: number;
  todayCount: number;
  lastTip: TipSummary | null;
}
