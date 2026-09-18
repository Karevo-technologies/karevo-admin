import {
  Home01Icon,
  Building01Icon,
  UserMultiple02Icon,
  File01Icon,
  ShieldCheckIcon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import type { AdminModule } from "@/lib/rbac";

export interface NavEntry {
  module: AdminModule;
  href: string;
  label: string;
  icon: IconSvgElement;
  exact?: boolean;
}

// One entry per module in docs/SUPER_ADMIN_DASHBOARD.md §4 — the single source of truth
// for both the sidebar (filtered per role by lib/rbac.ts) and each page's own RBAC gate.
export const NAV_ENTRIES: NavEntry[] = [
  { module: "overview", href: "/", label: "Overview", icon: Home01Icon, exact: true },
  { module: "orgs_doctors", href: "/orgs-doctors", label: "Orgs & Doctors", icon: Building01Icon },
  { module: "users", href: "/users", label: "Users", icon: UserMultiple02Icon },
  { module: "records_consent", href: "/records", label: "Records & Consent", icon: File01Icon },
  {
    module: "compliance_security",
    href: "/compliance",
    label: "Compliance & Security",
    icon: ShieldCheckIcon,
  },
  { module: "support_config", href: "/support", label: "Support & Config", icon: Settings01Icon },
];
