# P3XIV Rebrand + Footer Design Spec

**Date:** 2026-05-09
**Status:** Approved

---

## Goal

Rebrand the store from "Maison Écho" to P3XIV / Press On, shift the design system to a stark black-and-white palette with a stronger directive typeface, rename the blog, and add a compliant footer (always-visible slim policy bar + on-demand info panel).

---

## 1. Design System — Typography

**Display font:** Barlow Condensed ExtraBold (weight 800)
- Load from Google Fonts: `Barlow+Condensed:wght@700;800`
- Replaces Playfair Display as `font-display` in Tailwind config
- Used for: store name, section labels, info panel headings, all current `font-display` usage

**Body font:** Inter (unchanged)

**Implementation:**
- Update `<link>` in `app/root.tsx` to load Barlow Condensed instead of Playfair Display
- Update `tailwind.config.ts` `fontFamily.display` to `['Barlow Condensed', 'sans-serif']`
- No class changes needed — all `font-display` usages pick up the new font automatically

---

## 2. Design System — Color

All values updated in `app/styles/app.css` CSS custom properties:

| Token | Old (warm cream) | New (black/white) |
|---|---|---|
| `--background` | `oklch(0.972 0.012 85)` | `#ffffff` |
| `--foreground` | `oklch(0.18 0.01 60)` | `#000000` |
| `--card` | `oklch(0.985 0.008 85)` | `#ffffff` |
| `--card-foreground` | `oklch(0.18 0.01 60)` | `#000000` |
| `--border` | `oklch(0.88 0.015 80)` | `#e2e2e2` |
| `--muted` | `oklch(0.92 0.018 80)` | `#f5f5f5` |
| `--muted-foreground` | `oklch(0.45 0.015 70)` | `#8a8a8a` |
| `--accent` | `oklch(0.62 0.14 45)` | `#000000` |
| `--accent-foreground` | `oklch(0.985 0.008 85)` | `#ffffff` |
| `--primary` | `oklch(0.18 0.01 60)` | `#000000` |
| `--primary-foreground` | `oklch(0.985 0.008 85)` | `#ffffff` |
| `--ring` | `oklch(0.62 0.14 45)` | `#000000` |
| `--destructive` | unchanged | unchanged |

The grain overlay stays — reads as raw paper texture on white.

---

## 3. Brand Rename

**Store name:** "Maison Écho" → **P3XIV**
**Parent entity:** Press On (LLC)

**Files to update:**

| File | What changes |
|---|---|
| `app/routes/_index.tsx` | Meta title, header `<span>` display name |
| `app/routes/search.tsx` | Meta title suffix |
| `app/routes/blogs.$blogHandle._index.tsx` | Meta title suffix, description copy |
| `app/routes/blogs.$blogHandle.$articleHandle.tsx` | Meta title suffix |
| `app/routes/pages.$handle.tsx` | Meta title suffix (if present) |
| `app/routes/products.$handle.tsx` | Meta title suffix (if present) |
| `app/routes/collections.$handle.tsx` | Meta title suffix (if present) |

**Blog label:** Fallback "Journal" → "Blog" in `blogs.$blogHandle._index.tsx` meta and description.

**Description copy:** "Dispatches from the field" removed/replaced with "Objects for the purposeful life."

---

## 4. Slim Policy Bar (always visible)

**Component:** `app/components/PolicyBar.tsx` (new)

**Behavior:**
- Fixed to `bottom-0 inset-x-0`, sits behind the floating nav pill (z-10, nav is z-20)
- Always visible on the homepage — no toggle, no hiding
- Height: 28px

**Content:**
```
Privacy · Shipping · Returns · Terms · © 2025 Press On
```

**Links:**
| Label | Route |
|---|---|
| Privacy | `/policies/privacy-policy` |
| Shipping | `/policies/shipping-policy` |
| Returns | `/policies/refund-policy` |
| Terms | `/policies/terms-of-service` |

**Styling:**
- `bg-background` (white), `border-t border-border`
- Text: `text-[9px] uppercase tracking-[0.25em] text-muted-foreground`
- Links: `hover:text-foreground transition-colors`

**Rendered in:** `app/routes/_index.tsx` inside `<main>`, above `<CartDrawer>`

---

## 5. Info Panel

**Trigger:** `↑` button added to the bottom floating nav pill, right of the existing cart icon divider.

**State:** `infoOpen: boolean` added to `_index.tsx` alongside existing `cartOpen`.

**Panel behavior:**
- Slides up from bottom: `translate-y-full` → `translate-y-0`, `duration-500`
- Height: `55vh`, min-height `360px`
- Positioned: `fixed bottom-0 inset-x-0 z-50`
- Dismisses: click backdrop or the `↓` button inside the panel

**Panel layout (dark, black background):**

```
┌─────────────────────────────────────────────┐
│ P3XIV                    INSTAGRAM           │
│ Press On                 TIKTOK              │
│ hello@pressondaily.com                       │
│─────────────────────────────────────────────│
│  Privacy · Shipping · Returns · Terms        │
│  © 2025 Press On                            │
└─────────────────────────────────────────────┘
```

**Left column:**
- "P3XIV" in `font-display text-5xl text-white`
- "Press On" in `text-[10px] uppercase tracking-[0.4em] text-white/50 mt-1`
- Contact email in `text-sm text-white/70 mt-4` — hardcoded for now, made dynamic via metaobject later

**Right column:**
- Social links in `font-display text-2xl text-white hover:text-white/60 transition-colors`
- Hardcoded URLs for now — Instagram and TikTok
- Made dynamic via metaobject in a future pass

**Bottom strip:**
- Same policy links as the slim bar, white/muted on dark
- Copyright line

**Component:** Inline in `_index.tsx` as `InfoPanel` sub-component (small enough to not warrant its own file)

---

## 6. Bottom Nav Update

Add `↑` button to the existing bottom nav pill in `_index.tsx`:

```
[ FIELD | COLLECTIONS | CONTACT | · | 🛒 | · | ↑ ]
```

The `↑` sets `infoOpen(true)`. When `infoOpen`, the button shows `↓` and sets `infoOpen(false)`.

---

## Out of Scope (future)

- Social URLs and contact email via `site_settings` metaobject fields
- Newsletter capture in the info panel
- Press mentions / social proof
- Dark mode toggle
