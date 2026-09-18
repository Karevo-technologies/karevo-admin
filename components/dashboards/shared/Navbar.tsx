"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Search01Icon, Notification01Icon, Menu01Icon } from "@hugeicons/core-free-icons";
import { useAuth } from "@/context/AuthContext";
import { ThemeToggle } from "@/components/dashboards/shared/ThemeToggle";
import { ADMIN_ROLE_LABELS } from "@/lib/rbac";

function getInitials(name: string) {
  const words = name.split(" ").filter(Boolean);
  return ((words[0]?.[0] ?? "") + (words[words.length - 1]?.[0] ?? "")).toUpperCase();
}

interface NavbarProps {
  /** Page a global search shortcut should link to; omitted when no search page exists for the role */
  searchHref?: string;
  /** Opens the mobile nav drawer; omitted hides the hamburger button */
  onMenuClick?: () => void;
}

// Top bar shown on every authenticated dashboard page: search, notifications, theme, identity
export function Navbar({ searchHref, onMenuClick }: NavbarProps) {
  const { user } = useAuth();
  const router = useRouter();
  const isMac =
    typeof navigator !== "undefined" && /Mac|iPhone|iPod|iPad/.test(navigator.userAgent);

  useEffect(() => {
    if (!searchHref) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        router.push(searchHref);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchHref, router]);

  return (
    <header className="z-10 flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 shadow-sm sm:gap-4 sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {onMenuClick && (
          <button
            type="button"
            aria-label="Open menu"
            onClick={onMenuClick}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} />
          </button>
        )}
        {searchHref && (
          <>
            <Link
              href={searchHref}
              aria-label="Search"
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            >
              <HugeiconsIcon icon={Search01Icon} size={18} />
            </Link>
            <Link
              href={searchHref}
              className="hidden h-9 w-full max-w-xs items-center gap-2 rounded-full border border-border bg-muted/50 px-3.5 text-sm text-muted-foreground transition-colors hover:bg-muted sm:flex"
            >
              <HugeiconsIcon icon={Search01Icon} size={16} />
              <span className="flex-1">Search...</span>
              <kbd
                suppressHydrationWarning
                className="rounded-md bg-background px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/80 ring-1 ring-border"
              >
                {isMac ? "⌘K" : "Ctrl K"}
              </kbd>
            </Link>
          </>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <button
          type="button"
          aria-label="Notifications"
          className="flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <HugeiconsIcon icon={Notification01Icon} size={18} />
        </button>
        <ThemeToggle />
        {user && (
          <div
            className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
            title={`${user.name} · ${ADMIN_ROLE_LABELS[user.role]}`}
          >
            {getInitials(user.name)}
          </div>
        )}
      </div>
    </header>
  );
}
