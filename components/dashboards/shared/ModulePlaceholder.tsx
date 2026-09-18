import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";

interface ModulePlaceholderProps {
  icon: IconSvgElement;
  title: string;
  description: string;
  entities: string[];
  screens: string[];
}

// Scaffold for a module that hasn't been built yet — gives whoever picks up
// this route the spec section to build against instead of a blank page.
// Swap this out page by page as each module in docs/SUPER_ADMIN_DASHBOARD.md §4 ships.
export function ModulePlaceholder({
  icon,
  title,
  description,
  entities,
  screens,
}: ModulePlaceholderProps) {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle>Planned screens</CardTitle>
          <CardDescription>From docs/SUPER_ADMIN_DASHBOARD.md — build against this spec.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
            {screens.map((screen) => (
              <li key={screen}>{screen}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <EmptyState
        icon={<HugeiconsIcon icon={icon} size={20} />}
        title="Not built yet"
        message={`Entities: ${entities.join(", ")}`}
      />
    </div>
  );
}
