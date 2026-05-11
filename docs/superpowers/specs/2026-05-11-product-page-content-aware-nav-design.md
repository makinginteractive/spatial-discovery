# Product Page & Content-Aware Nav Design

## Goal

Add a consistent top bar and a content-aware bottom pill to every interior page, replacing per-route headers with shared components. On the product page, lock the image so it stays visible as content scrolls on mobile.

---

## Architecture

Two new shared components — `SiteHeader` and `NavPill` — replace the ad-hoc headers in each route. `SiteHeader` is identical on every page. `NavPill` accepts a discriminated-union `mode` prop that controls what context it shows. The homepage keeps its existing `_index.tsx` nav (unchanged); interior pages import the two components.

The PolicyBar (already built) is untouched. It stays `fixed bottom-0` with the ↑ trigger on the left.

---

## Components

### `app/components/SiteHeader.tsx`

Fixed or static top bar rendered on every interior page (product, collection, blog, article, search, pages, policies).

**Left:** `P3XIV` link → `/`
**Center:** Search input (same styling as existing SearchFormPredictive, but embedded inline — `<form action="/search">`)
**Right:** `Contact` link → `/pages/contact` · `Returns` link → `/policies/refund-policy`

```tsx
export function SiteHeader() { ... }
```

No props needed. All links are static. Does not replace the homepage header — homepage keeps its own header in `_index.tsx`.

---

### `app/components/NavPill.tsx`

Content-aware bottom pill. Replaces the pill that currently exists only on the homepage. This component is placed on interior pages; the homepage continues rendering its own pill from `_index.tsx` (no changes to homepage).

**Positioning:** `fixed bottom-8 inset-x-0 z-20 flex justify-center pointer-events-none` (bottom-8 clears the 28px PolicyBar). Children use `pointer-events-auto`.

**Mode prop (discriminated union):**

```ts
type NavPillProps =
  | { mode: 'product';    title: string; price: string; currency: string; variantId: string; availableForSale: boolean }
  | { mode: 'collection'; title: string }
  | { mode: 'article';    title: string };
```

**Rendered content per mode:**

| Mode | Pill contents |
|---|---|
| `product` | Account icon · [Product title, truncated 20 chars] · Add to Bag $price · · · Cart |
| `collection` | Account icon · [Collection name, truncated 24 chars] · · · Cart |
| `article` | Account icon · [Article/Blog title, truncated 24 chars] · · · Cart |

**Account icon:** Same icon-only button as homepage — links to `/account`. No dropdown on interior pages (keeps pill simple).

**Cart:** Icon + count bubble. Uses `useRouteLoaderData('root')` to read `cart?.totalQuantity`.

**"Add to Bag $price":** A `CartForm` (from `@shopify/hydrogen`) with `action={CartForm.ACTIONS.LinesAdd}`. Only rendered in `product` mode when `availableForSale` is true. When unavailable, shows `Sold Out` (disabled, muted). Flash-to-green "✓ Added" on success (same pattern as existing product page ATC, 2500ms).

**Truncation:** CSS `truncate max-w-[10rem]` on the title span. Title is display-only in collection/article modes.

**Separator `·`:** Static `<span className="text-border select-none">·</span>` between sections.

**Pill shape/styling:** Matches existing homepage pill — `bg-background border border-border rounded-full px-4 h-10 flex items-center gap-3 text-xs uppercase tracking-widest shadow-sm`.

---

## Mobile Product Image

On mobile (single-column layout), the product image currently sits at `aspect-square` and scrolls with the page. Change it to `h-[55vh] w-full object-contain` so the image occupies ~55% of the viewport and the title/ATC content begins visibly below.

On desktop the image stays in the left column (`sticky top-12`) — no change.

Implementation: In `products.$handle.tsx`, replace the image container div's `aspect-square` class with `h-[55vh] md:aspect-square md:h-auto`.

---

## Body ATC Button

The existing "Add to bag" / "Sold out" button in the product page body stays. Both the body button and the pill ATC coexist (user chose "both"). No change to the body ATC.

---

## Routes Updated

| Route file | Change |
|---|---|
| `products.$handle.tsx` | Import SiteHeader, NavPill(product). Replace per-route `<header>`. Mobile image height. |
| `collections.$handle.tsx` | Import SiteHeader, NavPill(collection, title=collection.title). Replace per-route header. |
| `collections._index.tsx` | Import SiteHeader, NavPill(collection, title="All"). |
| `collections.all.tsx` | Import SiteHeader, NavPill(collection, title="All"). |
| `blogs.$blogHandle.$articleHandle.tsx` | Import SiteHeader, NavPill(article, title=article.title). |
| `blogs.$blogHandle._index.tsx` | Import SiteHeader, NavPill(article, title=blog.title). |
| `blogs._index.tsx` | Import SiteHeader only (no contextual title needed — NavPill(article, title="Journal")). |
| `search.tsx` | Import SiteHeader only, no NavPill. |
| `pages.$handle.tsx` | Import SiteHeader only, no NavPill. |
| `policies.$handle.tsx` | Import SiteHeader only, no NavPill. |

`_index.tsx` (homepage): **No changes.** Its own header and pill are untouched.

---

## Error Handling

- Cart data absent: pill renders cart icon without bubble.
- `availableForSale` false on product mode: pill shows "Sold Out" button (disabled).
- CartForm fetch error: pill reverts to "Add to Bag" state (no special error UI, matches existing body ATC behavior).

---

## Testing

- Product page mobile: image is ~55vh, content scrolls under it, pill shows title + price + ATC.
- Product page desktop: image is sticky, two-column layout unchanged.
- Collection page: pill shows collection name, no ATC.
- Article page: pill shows article title, no ATC.
- Cart count: add item on product page, count increments in pill.
- "Add to bag" in pill: item added, pill flashes green, count increments.
- PolicyBar ↑ trigger: still works on all pages.
- Homepage: no regression — pill and header unchanged.
