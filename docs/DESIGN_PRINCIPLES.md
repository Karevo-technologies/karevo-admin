# Karevo Dashboard Design Principles

This document describes the design system already implemented across the Karevo
dashboards (organization, admin, and any future user type). It isn't a proposal —
it's a record of the conventions the existing code follows, written down so every
new page, modal, or dashboard follows the same rules instead of drifting from them.

If you're adding a new screen, a new user-type dashboard, or a new component: read
this first, then build on the existing pieces in `components/ui/` and
`components/common/` rather than writing new markup from scratch.

## 1. Two layers of components — never raw HTML elements

- **`components/ui/*`** — the base primitives (shadcn/ui on top of `@base-ui/react`):
  `Button`, `Input`, `Label`, `Textarea`, `Select`, `Card`, `Dialog`, `Badge`, `Tabs`,
  `DropdownMenu`, `Spinner`. These carry the raw styling and accessibility behavior.
- **`components/common/*`** — thin app-level wrappers around those primitives that add
  Karevo-specific behavior: `Button` (adds a `loading` prop with a spinner), `Modal`
  (wraps `Dialog` with a title), `Badge` (adds the status color system, see §4),
  `EmptyState`, `LoadingSpinner`.

**Rule:** every feature is built from these two layers. Never write a raw `<input>`,
`<button>`, or `<textarea>` for product UI — use `Input`/`Button`/`Textarea`. This is
the rule the login page (`app/auth/login/page.tsx`) currently breaks, and why it looks
visually out of step with the rest of the app.

Shared cross-dashboard pieces live in `components/dashboards/shared/`: `Sidebar`,
`Navbar`, `StatCard`, `StatusBadge`, `ActivityLogItem`, `ThemeToggle`,
`ProtectedRoute`, `VerifiedBadge`, `ViewSwitcher`. Every dashboard role should reuse
these rather than reimplementing its own nav shell or stat tile.

## 2. Color — tokens only, never hardcoded hex/oklch

All color lives in CSS variables defined once in `app/globals.css`, with a light set
under `:root` and a dark set under `.dark` (switched via `next-themes`, see
`components/theme-provider.tsx` and `ThemeToggle`). Product code references them only
through Tailwind's token classes:

| Token class | Use |
|---|---|
| `bg-background` / `text-foreground` | Page background / default text |
| `bg-card` / `text-card-foreground` | Card and panel surfaces |
| `bg-primary` / `text-primary-foreground` | Primary actions, active nav, avatar chips |
| `bg-accent` / `text-accent-foreground` | Active sidebar item, subtle highlight chips |
| `bg-muted` / `text-muted-foreground` | Secondary text, hover backgrounds, subtle fills |
| `border-border` | All borders |
| `text-destructive` | Form validation errors |

**Rule:** don't write `#4338ca`, `bg-[#faf9f6]`, or any other literal color in a
component. If a token doesn't exist for what you need, add one to `globals.css`
(light **and** dark values) rather than inlining a hex value — an inlined color skips
dark mode entirely.

The only intentional exceptions are brand-specific marks that are never meant to
re-theme: the Twitter-blue checkmark fill in `VerifiedBadge.tsx`, and the semantic
status palette below.

## 3. Typography

Two font families, loaded in `app/layout.tsx` and wired to CSS variables:

- **Inter** (`--font-sans` / `font-sans`) — body text, the default for everything.
- **Space Grotesk** (`--font-heading` / `font-heading`) — applied automatically to
  every `h1`–`h6` via the base layer in `globals.css`; don't apply it manually.

Sizes come from Tailwind's scale (`text-xs`, `text-sm`, `text-base`, `text-xl`,
`text-2xl`, …) paired with `font-medium` / `font-semibold` / `font-bold` for weight.
Avoid arbitrary pixel sizes like `text-[15px]` or `text-[13px]` — they don't map to
the scale and make text inconsistent across pages.

## 4. Status colors — one palette, reused everywhere

`BADGE_VARIANT_CLASSES` in `components/common/Badge.tsx` is the single source of
truth for status coloring:

```ts
pending:  pastel amber   // bg-[#FEF3CD] text-[#856404]  ·  dark: amber-400/15 + amber-300
approved: pastel emerald // bg-[#E8F4F2] text-[#00594F]  ·  dark: emerald-400/15 + emerald-300
declined: pastel red     // bg-[#FDECEA] text-[#C0392B]  ·  dark: red-400/15 + red-300
viewed:   pastel blue    // bg-[#EAF2FB] text-[#1A3A5C]  ·  dark: blue-400/15 + blue-300
neutral:  bg-muted / text-muted-foreground
```

This same map drives `Badge`, `StatusBadge`, `StatCard`'s icon chip tone, and any
inline colored banner or icon circle that needs to communicate a status. When you
need a new status color, add it here once — don't invent a one-off color in a page.

## 5. Icons — Hugeicons only

Every icon in the dashboards comes from `@hugeicons/react` (`HugeiconsIcon`) with
icon data from `@hugeicons/core-free-icons`. `lucide-react` is present only as an
internal dependency of shadcn primitives — never import it directly in product code.

Typical sizes by context: `12` inside a `Badge`, `15–16` inside buttons and inline
banners, `16–18` in the navbar and sidebar, `20–22` in avatars and `EmptyState`
icons.

## 6. Shape and spacing

- **Cards**: `rounded-2xl` (the base `Card` primitive defaults to `rounded-xl`; the
  product convention rounds it up to `rounded-2xl`), used via `Card`/`CardContent` as
  the wrapper for every discrete content block — a stat, a list row, a form, an empty
  state. Don't lay out a bare `<div>` with a manual border where a `Card` fits.
- **Buttons**: the base `Button` primitive defaults to a small `rounded-lg` chrome
  button. Product-facing call-to-action buttons instead apply this override recipe
  directly to get the pill look used throughout the app:

  ```tsx
  <Button className="h-auto rounded-full px-4 py-2.5">Send Record Request</Button>
  ```

  Use `px-5` instead of `px-4` for a modal's primary confirm action, and the
  `variant="outline"` / `variant="ghost"` props for secondary/cancel actions. Icon-only
  circular buttons (navbar, theme toggle, mobile menu) are `size-8`–`size-9` rounded
  circles built directly with utility classes, not the `Button` component.
- **Radius scale**: driven by `--radius` (`0.75rem`) and its derived
  `--radius-sm/md/lg/xl/2xl/3xl/4xl` tokens in `globals.css` — reuse these instead of
  picking an arbitrary `rounded-[Npx]`.

## 7. Recurring patterns

- **Avatar / initials chip**: `flex size-11 items-center justify-center rounded-full
  bg-primary text-sm font-semibold text-primary-foreground` showing the first letters
  of a name. Used for patients (search results, patient profile) and the signed-in
  user (navbar).
- **Empty states**: always the shared `EmptyState` component — icon in a muted circle,
  title, one-line message, optional action button. Never a bare "No data" string.
- **Forms**: `Label` + `Input`/`Textarea`/`Select`, a `touched` boolean set on submit,
  and inline `text-xs text-destructive` messages under the field that failed
  validation (see `RequestForm`, `AddPatientModal`, `UploadRecordModal`). Submit
  buttons use the common `Button`'s `loading` prop instead of hand-rolled disabled
  text.
- **Modals**: always the shared `Modal` wrapper. A create/submit flow that succeeds
  swaps its content for a success state — a `size-14` circle in the `approved` status
  color containing a checkmark icon (`animate-in zoom-in-50`), a one-line confirmation
  message, and a closing action.
- **Inline warning/info banners**: `flex items-start gap-2 rounded-lg border px-3.5
  py-2.5 text-xs` colored with the relevant status tone (see `RecordViewer`'s
  "view-only" banner, `ScanPatientQrModal`'s camera-permission banner).

## 8. Navigation shell

Every authenticated dashboard role uses the same shell:

- `ProtectedRoute` gates the whole layout behind auth.
- `Sidebar` renders a role-specific `SidebarItem[]` list (defined per layout, e.g.
  `app/dashboards/organization/layout.tsx`) as pill nav links — active state is
  `bg-accent text-accent-foreground`, inactive is `text-muted-foreground` with a
  `hover:bg-muted` state. Collapses into a slide-in drawer below the `sm` breakpoint.
- `Navbar` sits above the page content: a `⌘K`/`Ctrl K` search shortcut (when the role
  has a search page), `ViewSwitcher`, `VerifiedBadge` when applicable, notifications,
  `ThemeToggle`, and the signed-in user's initials chip.

A new dashboard role should add its own `layout.tsx` with its own `NAV_ITEMS`, but
reuse `Sidebar` and `Navbar` rather than building a new shell.

## 9. Responsive rules

- Page content is centered with a `mx-auto max-w-2xl` (single-record flows) or
  `max-w-4xl` (dashboard home) container.
- Layouts that sit side-by-side on desktop stack with `flex-col sm:flex-row` /
  `grid-cols-1 sm:grid-cols-*`.
- The sidebar is a fixed column at `sm+` and a full-drawer overlay below it — see
  `Sidebar.tsx` for the exact breakpoint behavior.

## 10. Anti-patterns to avoid

These are mistakes already made once (the login page) — don't repeat them elsewhere:

- ❌ Hardcoded hex/oklch colors in a component (`bg-[#4338ca]`, `text-[#7a847f]`).
- ❌ `lucide-react` icons in product UI (Hugeicons only).
- ❌ Raw `<input>` / `<button>` / `<textarea>` instead of the shared components.
- ❌ Arbitrary pixel font sizes (`text-[15px]`) instead of the Tailwind type scale.
- ❌ A bare `<div>` standing in for `Card`/`CardContent` around a content block.
- ❌ A one-off status color instead of adding it to `BADGE_VARIANT_CLASSES`.

## 11. Checklist for a new page or dashboard role

1. Wrap the route in a `layout.tsx` using `ProtectedRoute` + `Sidebar` + `Navbar`,
   with a role-specific `NAV_ITEMS` array.
2. Build content from `Card`/`CardContent`, `Button`, `Input`/`Label`/`Textarea`/
   `Select`, and `Badge` — not raw elements.
3. Use only theme-token color classes; add a token to `globals.css` (light + dark) if
   you need a color that doesn't exist yet.
4. Use Hugeicons for every icon.
5. Reuse `EmptyState` for empty/zero-data states, and the success-state modal pattern
   (§7) for create/submit flows.
6. Check the page at phone width and in dark mode before calling it done.
