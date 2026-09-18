import type { ReactNode } from "react";
import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type BadgeVariant = "pending" | "approved" | "declined" | "viewed" | "neutral";

export const BADGE_VARIANT_CLASSES: Record<BadgeVariant, string> = {
  pending: "bg-[#FEF3CD] text-[#856404] dark:bg-amber-400/15 dark:text-amber-300",
  approved: "bg-[#E8F4F2] text-[#00594F] dark:bg-emerald-400/15 dark:text-emerald-300",
  declined: "bg-[#FDECEA] text-[#C0392B] dark:bg-red-400/15 dark:text-red-300",
  viewed: "bg-[#EAF2FB] text-[#1A3A5C] dark:bg-blue-400/15 dark:text-blue-300",
  neutral: "bg-muted text-muted-foreground",
};

interface BadgeProps {
  label: string;
  variant: BadgeVariant;
  icon?: ReactNode;
}

// A small coloured pill built on the shadcn Badge, used for statuses and verification state
export function Badge({ label, variant, icon }: BadgeProps) {
  return (
    <ShadcnBadge
      variant="outline"
      className={cn("gap-1 border-transparent font-semibold", BADGE_VARIANT_CLASSES[variant])}
    >
      {icon}
      {label}
    </ShadcnBadge>
  );
}
