"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import type { IconSvgElement } from "@hugeicons/react";
import { useAuth } from "@/context/AuthContext";

export interface SidebarItem {
  href: string;
  label: string;
  icon: IconSvgElement;
  /** Require an exact path match instead of a prefix match — set on a dashboard's home item */
  exact?: boolean;
}

interface SidebarProps {
  items: SidebarItem[];
  /** Shown under the wordmark, e.g. "Organization Dashboard" */
  dashboardLabel: string;
  /** Controls the mobile slide-in drawer; the trigger lives in Navbar's hamburger button */
  mobileOpen: boolean;
  onMobileOpenChange: (open: boolean) => void;
}

interface SidebarNavProps {
  items: SidebarItem[];
  dashboardLabel: string;
  pathname: string | null;
  onLogout: () => void;
  /** Called after a nav link is clicked — used to close the mobile drawer */
  onNavigate?: () => void;
  closeButton?: ReactNode;
}

function SidebarNav({
  items,
  dashboardLabel,
  pathname,
  onLogout,
  onNavigate,
  closeButton,
}: SidebarNavProps) {
  return (
    <>
      <div className="mb-6 flex items-center justify-between gap-2.5 px-2">
        <div className="flex items-center gap-2.5">
          <Image src="/karevo-mark.png" alt="" width={26} height={26} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-semibold text-foreground">Karevo</span>
              <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-accent-foreground uppercase">
                Beta
              </span>
            </div>
            <p className="truncate text-[10px] font-medium tracking-[0.08em] text-muted-foreground uppercase">
              {dashboardLabel}
            </p>
          </div>
        </div>
        {closeButton}
      </div>

      <ul className="flex-1 space-y-1">
        {items.map((item) => {
          const active = item.exact ? pathname === item.href : pathname?.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <HugeiconsIcon icon={item.icon} size={18} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={Logout01Icon} size={18} />
          Log out
        </button>
      </div>
    </>
  );
}

// Left-hand navigation shell, reused by both the organization and admin dashboards.
// Renders as a fixed column at sm+, and as a slide-in drawer (opened via Navbar's
// hamburger button) below that, since there's no room for a permanent sidebar on mobile.
export function Sidebar({ items, dashboardLabel, mobileOpen, onMobileOpenChange }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.replace("/auth/login");
  };

  return (
    <>
      <nav className="hidden h-full w-64 shrink-0 flex-col border-r border-border bg-card p-4 sm:flex">
        <SidebarNav
          items={items}
          dashboardLabel={dashboardLabel}
          pathname={pathname}
          onLogout={handleLogout}
        />
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => onMobileOpenChange(false)}
          />
          <nav className="absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col bg-card p-4 shadow-lg">
            <SidebarNav
              items={items}
              dashboardLabel={dashboardLabel}
              pathname={pathname}
              onLogout={handleLogout}
              onNavigate={() => onMobileOpenChange(false)}
              closeButton={
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={() => onMobileOpenChange(false)}
                  className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} />
                </button>
              }
            />
          </nav>
        </div>
      )}
    </>
  );
}
