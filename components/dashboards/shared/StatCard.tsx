import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { BADGE_VARIANT_CLASSES, type BadgeVariant } from "@/components/common/Badge";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  tone?: BadgeVariant;
}

// A summary tile with a coloured icon chip, used on both dashboard home pages
export function StatCard({ icon, label, value, tone = "neutral" }: StatCardProps) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="flex flex-col items-start gap-4">
        <div
          className={cn(
            "flex size-11 shrink-0 items-center justify-center rounded-full",
            BADGE_VARIANT_CLASSES[tone]
          )}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
