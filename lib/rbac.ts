export type AdminRole = "super_admin" | "compliance_officer" | "ops_support" | "analyst";

export const ADMIN_ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  compliance_officer: "Compliance Officer",
  ops_support: "Ops / Support",
  analyst: "Analyst",
};

// One entry per module in the build sequencing (see docs/SUPER_ADMIN_DASHBOARD.md §4, §8)
export type AdminModule =
  | "overview"
  | "orgs_doctors"
  | "users"
  | "records_consent"
  | "compliance_security"
  | "support_config";

// Mirrors the RBAC table in docs/SUPER_ADMIN_DASHBOARD.md §3
const ROLE_MODULES: Record<AdminRole, AdminModule[]> = {
  super_admin: [
    "overview",
    "orgs_doctors",
    "users",
    "records_consent",
    "compliance_security",
    "support_config",
  ],
  compliance_officer: ["overview", "records_consent", "compliance_security"],
  ops_support: ["overview", "orgs_doctors", "users", "support_config"],
  analyst: ["overview"],
};

// Enforced here for UI gating; the real backend must reject these server-side too (§3 implementation notes)
export function canAccessModule(role: AdminRole, module: AdminModule): boolean {
  return ROLE_MODULES[role].includes(module);
}
