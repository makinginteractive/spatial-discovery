# P3XIV Rebrand + Footer Design Spec

**Date:** 2026-05-09
**Status:** Approved

---

## Goal

Rebrand the store from "Maison Écho" to P3XIV / Press On, shift the design system to a stark black-and-white palette with Barlow Condensed ExtraBold as the display typeface, update the homepage nav, and add a compliant footer (always-visible slim policy bar + on-demand info panel). Interior page layout is a follow-up phase — build canvas first, decide with real context.

---

## 1. Design System — Typography

**Display font:** Barlow Condensed ExtraBold (weight 800)
- Load from Google Fonts: `Barlow+Condensed:wght@700;800`
- Replaces Playfair Display as `font-display` in Tailwind config
- All existing `font-display` usages pick up the new font automatically — no class changes needed

**Body font:** Inter (unchanged)

**Files:**
- `app/root.tsx` — swap Google Fonts `<link>` from Playfair Display to Barlow Condensed
- `tailwind.config.ts` — update `fontFamily.display` to `['Barlow Condensed', 'sans-serif']`

---

## 2. Design System — Color

Updated in `app/styles/app.css` CSS custom properties. Stark black/white — no warm tones.

| Token | New value |
|---|---|
| `--background` | `#ffffff` |
| `--foreground` | `#000000` |
| `--card` | `#ffffff` |
| `--card-foreground` | `#000000` |
| `--border` | `#e2e2e2` |
| `--muted` | `#f5f5f5` |
| `--muted-foreground` | `#8a8a8a` |
| `--accent` | `#000000` |
| `--accent-foreground` | `#ffffff` |
| `--primary` | `#000000` |
| `--primary-foreground` | `#ffffff` |
| `--ring` | `#000000` |
| `--destructive` | unchanged |

The grain overlay stays — reads as raw paper texture on white.

---

## 3. Brand Rename

**Store name:** "Maison Écho" → **P3XIV**
**Parent entity:** Press On (LLC)

| File | What changes |
|---|---|
| `app/routes/_index.tsx` | Meta title, header display name span |
| `app/routes/search.tsx` | Meta title suffix |
| `app/routes/blogs.$blogHandle._index.tsx` | Meta title suffix, description copy, "Journal" fallback → "Blog" |
| `app/routes/blogs.$blogHandle.$articleHandle.tsx` | Meta title suffix |
| `app/routes/pages.$handle.tsx` | Meta title suffix |
| `app/routes/products.$handle.tsx` | Meta title suffix |
| `app/routes/collections.$handle.tsx` | Meta title suffix |

**Description copy:** "Dispatches from the field" → "Objects for the purposeful life."
**Copyright:** © 2025 Press On

---

## 4. Homepage Header (top bar)

Replaces current layout of: `[P3XIV + tagline] ··· [nav links]`

**Left:** `P3XIV` in `font-display` — clicking goes to `/`
**Right:** Two plain text links — `Contact` → `/pages/contact`, `Returns` → `/policies/refund-policy`

Tagline ("EDITION 01") removed from top bar. Search pill stays centered.

---

## 5. Bottom Nav Pill — Redesigned

Replaces current: `FIELD | COLLECTIONS | CONTACT | · | cart`

**New order:**
```
[ 👤 | Shop | Collections | Blog | · | 🛒 ]
```

- **Account icon (👤):** On hover (desktop) / tap (mobile) shows a small dropdown: `Log In` and `Create Account` links. Uses existing Hydrogen account routes (`/account/login`, `/account`).
- **Shop:** Links to `/collections/all`
- **Collections:** Links to `/collections`
- **Blog:** Links to `/blogs/news`
- **Divider · :** existing `w-px h-4 bg-border` separator
- **Cart icon:** existing cart icon + badge, opens CartDrawer

FIELD filter button removed from the pill (canvas filtering deprioritised for now).

---

## 6. Info Panel Trigger

A standalone `↑` button sits **below** the nav pill, centered, separate from it. Not inside the pill.

```
        [ 👤 | Shop | Collections | Blog | · | 🛒 ]
                          ↑
              ─────────────────────────
              Privacy · Shipping · ...   ← policy bar
```

- Positioned: `fixed bottom-[44px] left-1/2 -translate-x-1/2 z-20` (sits above policy bar, below nav pill)
- Style: `text-[9px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors`
- When info panel open, shows `↓`

---

## 7. Slim Policy Bar (always visible)

**Component:** `app/components/PolicyBar.tsx` (new)

- Fixed `bottom-0 inset-x-0`, z-10 (behind nav pill at z-20)
- Height: 28px, `border-t border-border bg-background`
- Content: `Privacy · Shipping · Returns · Terms · © 2025 Press On`
- Links: `/policies/privacy-policy`, `/policies/shipping-policy`, `/policies/refund-policy`, `/policies/terms-of-service`
- Text: `text-[9px] uppercase tracking-[0.25em] text-muted-foreground`

---

## 8. Info Panel

**State:** `infoOpen: boolean` added to `_index.tsx`

**Behavior:**
- `fixed bottom-0 inset-x-0 z-50`
- Slides up: `translate-y-full` → `translate-y-0`, `duration-500`
- Height: `55vh`, min-height `360px`
- Dark panel (`bg-black`)
- Dismisses: tap backdrop or `↓` button

**Layout:**
```
┌─────────────────────────────────────────────┐
│                                             │
│  P3XIV              INSTAGRAM               │
│  Press On           TIKTOK                  │
│  hello@press-on.com                         │
│                                             │
│─────────────────────────────────────────────│
│  Privacy · Shipping · Returns · Terms       │
│  © 2025 Press On                           │
└─────────────────────────────────────────────┘
```

- "P3XIV": `font-display text-5xl text-white`
- "Press On": `text-[10px] uppercase tracking-[0.4em] text-white/50`
- Email: `text-sm text-white/70 mt-4` — hardcoded for now
- Social links: `font-display text-2xl text-white hover:text-white/60` — Instagram + TikTok, hardcoded URLs for now
- Bottom strip: policy links in `text-[9px] text-white/40`, copyright

**Component:** `InfoPanel` inline sub-component in `_index.tsx`

---

## Out of Scope — Phase 2

- Interior page layout (product, collection, blog pages) — header + footer system decided after seeing rebrand live
- Social URLs + contact email via `site_settings` metaobject
- Canvas collection filtering (FIELD button removed for now, can return)
- Newsletter capture
