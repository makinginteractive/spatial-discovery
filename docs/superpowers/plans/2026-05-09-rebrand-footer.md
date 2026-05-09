# P3XIV Rebrand + Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand from "Maison Écho" to P3XIV/Press On, switch to black-and-white with Barlow Condensed ExtraBold, redesign the homepage nav pill, and add a slim policy bar + on-demand info panel.

**Architecture:** All color and font changes live in `app/styles/app.css` via CSS custom properties — no Tailwind config file exists. Font is loaded via Google Fonts `<link>` tags added to `app/root.tsx`. The homepage canvas route (`_index.tsx`) receives all nav/footer UI additions as inline sub-components. A new `PolicyBar` component handles the always-visible compliance strip.

**Tech Stack:** Shopify Hydrogen, React Router 7, Tailwind CSS v4 (utility-first via `@theme inline`), Google Fonts (Barlow Condensed)

---

## File Map

| File | Change |
|---|---|
| `app/root.tsx` | Add Google Fonts preconnect + stylesheet link |
| `app/styles/app.css` | Replace Fraunces @font-face + `--font-display`, update all color variables |
| `app/components/PolicyBar.tsx` | **New** — slim always-visible policy/copyright strip |
| `app/routes/_index.tsx` | Meta title, header (brand + top-right links), bottom nav redesign, info panel, policy bar |
| `app/routes/search.tsx` | Meta title suffix |
| `app/routes/blogs.$blogHandle._index.tsx` | Meta title, description copy, "Journal" → "Blog" |
| `app/routes/blogs.$blogHandle.$articleHandle.tsx` | Meta title suffix |
| `app/routes/products.$handle.tsx` | Meta title suffix + inline brand name |
| `app/routes/collections.$handle.tsx` | Meta title suffix + inline brand name |
| `app/routes/pages.$handle.tsx` | Meta title suffix + inline brand name |

---

## Task 1: Load Barlow Condensed from Google Fonts

**Files:**
- Modify: `app/root.tsx` (links function, lines 53–65)

- [ ] **Step 1: Add font preconnect and stylesheet to the links() array**

Open `app/root.tsx`. The `links()` function currently returns an array with two preconnect entries and a favicon. Add three new entries for Google Fonts:

```tsx
export function links() {
  return [
    {rel: 'preconnect', href: 'https://cdn.shopify.com'},
    {rel: 'preconnect', href: 'https://shop.app'},
    // Google Fonts — Barlow Condensed
    {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
    {
      rel: 'preconnect',
      href: 'https://fonts.gstatic.com',
      crossOrigin: 'anonymous' as const,
    },
    {
      rel: 'stylesheet',
      href: 'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800&display=swap',
    },
    {rel: 'icon', type: 'image/svg+xml', href: favicon},
  ];
}
```

- [ ] **Step 2: Verify the link renders in HTML**

Run the dev server: `npm run dev`
Open browser → view page source → confirm `<link rel="stylesheet" href="https://fonts.googleapis.com/...Barlow+Condensed...">` is present in the `<head>`.

---

## Task 2: Update Font Variable in CSS

**Files:**
- Modify: `app/styles/app.css` (lines 30, 57–63, 81)

- [ ] **Step 1: Replace the Fraunces @font-face block with a comment**

Find this block in `app/styles/app.css` (around line 57):
```css
@font-face {
  font-family: "Fraunces";
  font-style: normal;
  font-weight: 100 900;
  font-display: swap;
  src: url("https://fonts.gstatic.com/s/fraunces/v37/6NUh8FyLNQOQZAnv9bYVvHQOWHaq3KE6JtQjSNUMLg.woff2") format("woff2");
}
```

Delete it entirely. Barlow Condensed is now loaded via the Google Fonts `<link>` tag added in Task 1.

- [ ] **Step 2: Update `--font-display` in the `@theme inline` block**

Find (line ~30):
```css
--font-display: "Fraunces", "Times New Roman", serif;
```
Replace with:
```css
--font-display: "Barlow Condensed", sans-serif;
```

- [ ] **Step 3: Remove the Fraunces-specific font-feature-settings**

Find (line ~81):
```css
.font-display { font-family: var(--font-display); font-feature-settings: "ss01"; }
```
Replace with:
```css
.font-display { font-family: var(--font-display); font-weight: 800; letter-spacing: -0.01em; }
```

`font-feature-settings: "ss01"` was Fraunces-specific. `font-weight: 800` locks in ExtraBold globally for display text. `letter-spacing: -0.01em` tightens Barlow Condensed at large sizes.

- [ ] **Step 4: Verify in browser**

With dev server running, open the homepage. The "P3XIV" header text (currently "Maison Écho") and all product titles should render in Barlow Condensed ExtraBold — tall, condensed, bold. If it still looks like a serif, hard-refresh (Cmd+Shift+R).

- [ ] **Step 5: Commit**

```bash
git add app/root.tsx app/styles/app.css
git commit -m "feat: switch display font to Barlow Condensed ExtraBold"
```

---

## Task 3: Update Color System

**Files:**
- Modify: `app/styles/app.css` (the `:root` block, lines 34–53)

- [ ] **Step 1: Replace the `:root` color variable block**

Find the entire `:root { ... }` block and replace it with:

```css
:root {
  --radius: 0.25rem;
  --background: #ffffff;
  --foreground: #000000;
  --card: #ffffff;
  --card-foreground: #000000;
  --popover: #ffffff;
  --popover-foreground: #000000;
  --primary: #000000;
  --primary-foreground: #ffffff;
  --secondary: #f5f5f5;
  --secondary-foreground: #000000;
  --muted: #f5f5f5;
  --muted-foreground: #8a8a8a;
  --accent: #000000;
  --accent-foreground: #ffffff;
  --destructive: oklch(0.55 0.22 27);
  --destructive-foreground: #ffffff;
  --border: #e2e2e2;
  --input: #e2e2e2;
  --ring: #000000;
}
```

- [ ] **Step 2: Verify in browser**

Homepage background should be pure white. Text pure black. The grain texture should read like raw paper. The bottom nav pill should have a white background with light grey border. If anything looks warm/cream, hard-refresh.

- [ ] **Step 3: Commit**

```bash
git add app/styles/app.css
git commit -m "feat: switch to black-and-white color system"
```

---

## Task 4: Brand Rename — Meta Titles and Inline Text

**Files:**
- Modify: `app/routes/_index.tsx`
- Modify: `app/routes/search.tsx`
- Modify: `app/routes/blogs.$blogHandle._index.tsx`
- Modify: `app/routes/blogs.$blogHandle.$articleHandle.tsx`
- Modify: `app/routes/products.$handle.tsx`
- Modify: `app/routes/collections.$handle.tsx`
- Modify: `app/routes/pages.$handle.tsx`

- [ ] **Step 1: Update `_index.tsx` meta title**

Find:
```tsx
export const meta: Route.MetaFunction = () => [
  {title: 'MAISON ÉCHO — An infinite store'},
  {name: 'description', content: 'A spatial, infinite product field. Drift, search, and discover objects of slow design.'},
  {property: 'og:title', content: 'MAISON ÉCHO — An infinite store'},
  {property: 'og:description', content: 'A spatial, infinite product field.'},
];
```
Replace with:
```tsx
export const meta: Route.MetaFunction = () => [
  {title: 'P3XIV — Press On'},
  {name: 'description', content: 'A spatial field of objects for the purposeful life. Drift, discover, press on.'},
  {property: 'og:title', content: 'P3XIV — Press On'},
  {property: 'og:description', content: 'Objects for the purposeful life.'},
];
```

- [ ] **Step 2: Update `search.tsx` meta title**

Find:
```tsx
{title: `${(data as any)?.term ? `"${(data as any).term}" — Search` : 'Search'} — Maison Écho`},
```
Replace with:
```tsx
{title: `${(data as any)?.term ? `"${(data as any).term}" — Search` : 'Search'} — P3XIV`},
```

- [ ] **Step 3: Update `blogs.$blogHandle._index.tsx` meta**

Find:
```tsx
export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.blog.title ?? 'Journal'} — Maison Écho`},
  {name: 'description', content: `Dispatches from the field — ${data?.blog.title}`},
];
```
Replace with:
```tsx
export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.blog.title ?? 'Blog'} — P3XIV`},
  {name: 'description', content: `Objects for the purposeful life — ${data?.blog.title}`},
];
```

- [ ] **Step 4: Update `blogs.$blogHandle.$articleHandle.tsx` meta**

Find:
```tsx
{title: `${data?.article.title ?? 'Article'} — Maison Écho`},
```
Replace with:
```tsx
{title: `${data?.article.title ?? 'Article'} — P3XIV`},
```

- [ ] **Step 5: Update `products.$handle.tsx` meta + inline text**

Meta title — find:
```tsx
{title: `${data?.product.title ?? 'Product'} — Maison Écho`},
```
Replace with:
```tsx
{title: `${data?.product.title ?? 'Product'} — P3XIV`},
```

Inline back link — find:
```tsx
← Maison Écho
```
Replace with:
```tsx
← P3XIV
```

- [ ] **Step 6: Update `collections.$handle.tsx` meta + inline text**

Meta title — find:
```tsx
{title: `${data?.collection.title ?? 'Collection'} — Maison Écho`},
```
Replace with:
```tsx
{title: `${data?.collection.title ?? 'Collection'} — P3XIV`},
```

Inline brand name — find:
```tsx
Maison Écho
```
Replace with:
```tsx
P3XIV
```

- [ ] **Step 7: Update `pages.$handle.tsx` meta + inline text**

Meta title — find:
```tsx
{title: `${data?.page.title ?? 'Page'} — Maison Écho`},
```
Replace with:
```tsx
{title: `${data?.page.title ?? 'Page'} — P3XIV`},
```

Inline back link — find:
```tsx
← Maison Écho
```
Replace with:
```tsx
← P3XIV
```

- [ ] **Step 8: Commit**

```bash
git add app/routes/_index.tsx app/routes/search.tsx \
  'app/routes/blogs.$blogHandle._index.tsx' \
  'app/routes/blogs.$blogHandle.$articleHandle.tsx' \
  'app/routes/products.$handle.tsx' \
  'app/routes/collections.$handle.tsx' \
  'app/routes/pages.$handle.tsx'
git commit -m "feat: rename brand from Maison Écho to P3XIV across all routes"
```

---

## Task 5: Redesign Homepage Header

**Files:**
- Modify: `app/routes/_index.tsx` (the `<header>` block, lines ~155–181)

The current header has: brand name + tagline left, nav links right.
New header: `P3XIV` left (links home), `Contact` + `Returns` right.

- [ ] **Step 1: Replace the `<header>` block**

Find the entire `<header>` element (from `<header className=` to `</header>`) and replace with:

```tsx
{/* Top bar */}
<header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-5 sm:px-10 h-16 pointer-events-none">
  <a
    href="/"
    className={`${searchOpen ? 'hidden sm:block' : 'block'} font-display text-2xl tracking-tight pointer-events-auto hover:opacity-70 transition-opacity`}
  >
    P3XIV
  </a>
  <nav className={`${searchOpen ? 'hidden sm:flex' : 'flex'} items-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground pointer-events-auto`}>
    <a href="/pages/contact" className="hover:text-foreground transition-colors">Contact</a>
    <a href="/policies/refund-policy" className="hover:text-foreground transition-colors">Returns</a>
  </nav>
</header>
```

- [ ] **Step 2: Remove the tagline/activeType state and references**

Search `_index.tsx` for `activeType` references. The `activeType` state drives the old canvas filter (FIELD button + Collections dropdown). Since we're removing canvas filtering from the nav in this task, keep the state for now but the header no longer references it. Just confirm the header no longer mentions `activeType` or `settings.tagline`.

- [ ] **Step 3: Verify in browser**

Header should show "P3XIV" left in bold Barlow Condensed. "Contact" and "Returns" right in small caps. Search pill still floats in the center. On mobile when search is open, both hide correctly.

---

## Task 6: Redesign Bottom Nav Pill

**Files:**
- Modify: `app/routes/_index.tsx` (the bottom nav `<div>` block, lines ~305–415)

Current pill: `FIELD | COLLECTIONS | CONTACT | · | cart`
New pill: `AccountIcon | Shop | Collections | Blog | · | cart`

- [ ] **Step 1: Add `accountOpen` state and `AccountIcon` SVG**

After the existing state declarations (around line 69), add:
```tsx
const [accountOpen, setAccountOpen] = useState(false);
const accountRef = useRef<HTMLDivElement>(null);
```

After the existing `CartIcon` function (near the end of the file), add:

```tsx
function AccountIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  );
}
```

- [ ] **Step 2: Add outside-click handler for account dropdown**

After the existing `searchOpen` outside-click `useEffect`, add:
```tsx
useEffect(() => {
  if (!accountOpen) return;
  function handleOutside(e: MouseEvent) {
    if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
      setAccountOpen(false);
    }
  }
  document.addEventListener('mousedown', handleOutside);
  return () => document.removeEventListener('mousedown', handleOutside);
}, [accountOpen]);
```

- [ ] **Step 3: Replace the bottom nav pill content**

Find the bottom nav section. It currently contains the FIELD button, Collections button, menuItems filter, divider, and cart. Replace the entire inner content of the pill `<div>` with:

```tsx
{/* Account */}
<div ref={accountRef} className="relative">
  <button
    onClick={() => setAccountOpen((o) => !o)}
    onMouseEnter={() => setAccountOpen(true)}
    onMouseLeave={() => setAccountOpen(false)}
    className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
    aria-label="Account"
  >
    <AccountIcon />
  </button>
  {accountOpen && (
    <div
      className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-card border border-border rounded-xl shadow-lg overflow-hidden min-w-[140px]"
      onMouseEnter={() => setAccountOpen(true)}
      onMouseLeave={() => setAccountOpen(false)}
    >
      <a
        href="/account/login"
        className="block px-4 py-2.5 text-[10px] uppercase tracking-[0.25em] hover:bg-muted transition-colors"
      >
        Log In
      </a>
      <a
        href="/account/login?flow=register"
        className="block px-4 py-2.5 text-[10px] uppercase tracking-[0.25em] hover:bg-muted transition-colors border-t border-border"
      >
        Create Account
      </a>
    </div>
  )}
</div>

<a
  href="/collections/all"
  className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors rounded-full"
>
  Shop
</a>

<a
  href="/collections"
  className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors rounded-full"
>
  Collections
</a>

<a
  href="/blogs/news"
  className="px-4 py-2 text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors rounded-full"
>
  Blog
</a>

<div className="w-px h-4 bg-border mx-1" />

{/* Cart */}
<Suspense
  fallback={
    <button
      onClick={() => setCartOpen(true)}
      className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
      aria-label="Open cart"
    >
      <CartIcon />
    </button>
  }
>
  <Await resolve={rootData?.cart}>
    {(cart) => {
      const count = cart?.totalQuantity ?? 0;
      return (
        <button
          onClick={() => setCartOpen(true)}
          className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
          aria-label="Open cart"
        >
          <CartIcon />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent text-accent-foreground text-[9px] rounded-full flex items-center justify-center px-1 font-sans font-medium leading-none">
              {count}
            </span>
          )}
        </button>
      );
    }}
  </Await>
</Suspense>
```

- [ ] **Step 4: Remove now-unused state and handlers**

Remove or comment out these now-unused items from `_index.tsx`:
- `collectionsOpen` state
- `openCollections` function
- `scheduleClose` function
- `handleTypeSelect` function
- `handleFieldClick` function
- `productTypes` memo (no longer needed by nav)
- `closeTimerRef` ref
- `displayedProducts` memo (keep if canvas still uses it — only remove if canvas no longer filters)

> Note: Keep `activeType` and `displayedProducts` if the `InfiniteCanvas` still uses them for filtering. Remove only the nav UI that drove them.

- [ ] **Step 5: Verify in browser**

Bottom nav pill shows: person icon | SHOP | COLLECTIONS | BLOG | · | cart icon. Hovering/tapping the person icon shows a dropdown above with "Log In" and "Create Account". Cart badge still works.

- [ ] **Step 6: Commit**

```bash
git add app/routes/_index.tsx
git commit -m "feat: redesign homepage bottom nav pill — account, shop, collections, blog"
```

---

## Task 7: Create PolicyBar Component

**Files:**
- Create: `app/components/PolicyBar.tsx`
- Modify: `app/routes/_index.tsx` (import + render)

- [ ] **Step 1: Create `app/components/PolicyBar.tsx`**

```tsx
const POLICIES = [
  {label: 'Privacy', href: '/policies/privacy-policy'},
  {label: 'Shipping', href: '/policies/shipping-policy'},
  {label: 'Returns', href: '/policies/refund-policy'},
  {label: 'Terms', href: '/policies/terms-of-service'},
];

export function PolicyBar() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-10 h-7 bg-background border-t border-border flex items-center justify-center gap-4 px-4">
      {POLICIES.map((p, i) => (
        <span key={p.href} className="flex items-center gap-4">
          {i > 0 && <span className="text-border select-none">·</span>}
          <a
            href={p.href}
            className="text-[9px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground transition-colors"
          >
            {p.label}
          </a>
        </span>
      ))}
      <span className="text-border select-none">·</span>
      <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/60">
        © {new Date().getFullYear()} Press On
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Import and render in `_index.tsx`**

Add import at the top of `_index.tsx`:
```tsx
import {PolicyBar} from '~/components/PolicyBar';
```

Inside the `<main>` return, before `<ProductOverlay>` and `<CartDrawer>`, add:
```tsx
<PolicyBar />
```

- [ ] **Step 3: Verify layout**

The policy bar should sit at the very bottom of the viewport at all times. The floating nav pill (z-20) sits above it. The bar is 28px tall — it won't be obscured by the nav pill because the pill floats centered above it. On mobile, confirm the bar text is legible and doesn't overlap the pill.

- [ ] **Step 4: Commit**

```bash
git add app/components/PolicyBar.tsx app/routes/_index.tsx
git commit -m "feat: add always-visible PolicyBar with policy links and copyright"
```

---

## Task 8: Info Panel + ↑ Trigger Button

**Files:**
- Modify: `app/routes/_index.tsx` (state, ↑ button, InfoPanel sub-component)

- [ ] **Step 1: Add `infoOpen` state**

After the existing `const [cartOpen, setCartOpen] = useState(false);` line, add:
```tsx
const [infoOpen, setInfoOpen] = useState(false);
```

- [ ] **Step 2: Add the ↑ trigger button below the nav pill**

The bottom nav wrapper currently has the pill inside a centered `<div>`. Add the trigger button as a sibling directly below it:

Find the outer wrapper of the bottom nav (the `fixed bottom-...` div). Inside it, after the pill `<div>`, add:

```tsx
{/* Info panel trigger */}
<button
  onClick={() => setInfoOpen((o) => !o)}
  className="mt-1.5 text-[9px] uppercase tracking-[0.3em] text-muted-foreground hover:text-foreground transition-colors"
  aria-label={infoOpen ? 'Close info' : 'Open info'}
>
  {infoOpen ? '↓' : '↑'}
</button>
```

- [ ] **Step 3: Add the `InfoPanel` sub-component**

After the `PolicyBar` import and before the `export default function Index()`, add this component at the bottom of the file (after `CartIcon`):

```tsx
function InfoPanel({open, onClose}: {open: boolean; onClose: () => void}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 transition-opacity duration-500 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed bottom-0 inset-x-0 z-50 bg-black transition-transform duration-500 ${open ? 'translate-y-0' : 'translate-y-full'}`}
        style={{height: 'clamp(360px, 55vh, 520px)'}}
      >
        <div className="flex flex-col h-full px-6 sm:px-10 py-8">
          {/* Main content */}
          <div className="flex-1 flex items-start justify-between gap-8">
            {/* Left: Brand */}
            <div>
              <p className="font-display text-5xl sm:text-7xl text-white leading-none">P3XIV</p>
              <p className="text-[10px] uppercase tracking-[0.4em] text-white/50 mt-2">Press On</p>
              <a
                href="mailto:hello@press-on.co"
                className="block text-sm text-white/60 hover:text-white transition-colors mt-5"
              >
                hello@press-on.co
              </a>
            </div>
            {/* Right: Social */}
            <div className="flex flex-col items-end gap-3 pt-1">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl sm:text-2xl text-white hover:text-white/60 transition-colors"
              >
                Instagram
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-xl sm:text-2xl text-white hover:text-white/60 transition-colors"
              >
                TikTok
              </a>
            </div>
          </div>
          {/* Bottom: Policy strip */}
          <div className="border-t border-white/10 pt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            {[
              {label: 'Privacy', href: '/policies/privacy-policy'},
              {label: 'Shipping', href: '/policies/shipping-policy'},
              {label: 'Returns', href: '/policies/refund-policy'},
              {label: 'Terms', href: '/policies/terms-of-service'},
            ].map((p) => (
              <a
                key={p.href}
                href={p.href}
                className="text-[9px] uppercase tracking-[0.25em] text-white/40 hover:text-white/70 transition-colors"
              >
                {p.label}
              </a>
            ))}
            <span className="text-[9px] uppercase tracking-[0.2em] text-white/25 ml-auto">
              © {new Date().getFullYear()} Press On
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
```

- [ ] **Step 4: Render InfoPanel in the return**

Inside `<main>`, after `<CartDrawer>` and `<PolicyBar>`, add:
```tsx
<InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
```

- [ ] **Step 5: Verify in browser**

- `↑` button appears below the nav pill, above the policy bar
- Clicking it slides up the dark panel from the bottom — P3XIV large on the left, Instagram/TikTok on the right, policy links at the bottom
- Clicking outside or pressing `↓` dismisses it
- Canvas is visible above the panel (partial view, `55vh` panel)
- Policy bar is still visible at bottom when panel is closed

- [ ] **Step 6: Commit**

```bash
git add app/routes/_index.tsx
git commit -m "feat: add info panel with social links, triggered by ↑ button"
```

---

## Task 9: Push and Verify Live

- [ ] **Step 1: Push to Oxygen**

```bash
git push
```

- [ ] **Step 2: Wait for Oxygen deploy**

Check Shopify admin → Hydrogen → Deployments. Wait for the new build to show "Active" (~2–3 minutes).

- [ ] **Step 3: Verify live checklist**

Open the live store URL and confirm:
- [ ] Font is Barlow Condensed ExtraBold (tall, condensed, bold)
- [ ] Background is pure white, text pure black
- [ ] Header shows "P3XIV" left, "Contact" + "Returns" right
- [ ] Bottom nav shows account icon, Shop, Collections, Blog, cart
- [ ] Account icon hover shows "Log In" / "Create Account" dropdown
- [ ] Policy bar always visible at very bottom
- [ ] `↑` button below nav pill triggers info panel
- [ ] Info panel shows P3XIV, Press On, email, Instagram, TikTok, policy links
- [ ] Info panel dismisses on tap-outside or `↓`
- [ ] All meta titles say "P3XIV" not "Maison Écho"

---

## Self-Review

**Spec coverage check:**
- ✅ Task 1–2: Barlow Condensed ExtraBold font
- ✅ Task 3: Color system
- ✅ Task 4: Brand rename across all 7 route files
- ✅ Task 5: Homepage header (P3XIV left, Contact + Returns right)
- ✅ Task 6: Bottom nav pill (Account | Shop | Collections | Blog | · | Cart)
- ✅ Task 7: PolicyBar component, always visible
- ✅ Task 8: Info panel + ↑ trigger below pill
- ✅ Task 9: Deploy + verify

**No placeholders found.**

**Type/name consistency:** `infoOpen`/`setInfoOpen`, `accountOpen`/`setAccountOpen`, `InfoPanel`, `PolicyBar`, `AccountIcon`, `CartIcon` — all consistent across tasks.
