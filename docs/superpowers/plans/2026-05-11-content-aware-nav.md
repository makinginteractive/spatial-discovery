# Content-Aware Nav & Product Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared `SiteHeader` and content-aware `NavPill` to every interior page, and make the mobile product image tall enough to anchor the top of the screen.

**Architecture:** Two new components (`SiteHeader`, `NavPill`) replace per-route headers across product, collection, and blog routes. `NavPill` uses a discriminated union `mode` prop — product pages get an inline ATC button, collection/article pages get a context title only. The homepage (`_index.tsx`) is untouched. Cart count reads from `useRouteLoaderData('root')` + `<Await>`.

**Tech Stack:** Shopify Hydrogen, React Router 7, Tailwind CSS v4 (`@theme inline` — no tailwind.config.ts), TypeScript, `CartForm` from `@shopify/hydrogen`, `Suspense` + `Await` from `react-router`.

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `app/components/SiteHeader.tsx` | **Create** | Fixed top bar: P3XIV → `/`, search form center, Contact + Returns right |
| `app/components/NavPill.tsx` | **Create** | Content-aware fixed bottom pill (product / collection / article modes) |
| `app/routes/products.$handle.tsx` | **Modify** | Replace header, add NavPill(product), mobile image height |
| `app/routes/collections.$handle.tsx` | **Modify** | Replace header, move sort controls, add NavPill(collection) |
| `app/routes/collections._index.tsx` | **Modify** | Replace header, add NavPill(collection, "Collections") |
| `app/routes/blogs.$blogHandle._index.tsx` | **Modify** | Replace header, add NavPill(article, blog.title) |
| `app/routes/blogs.$blogHandle.$articleHandle.tsx` | **Modify** | Replace back-nav in hero, add SiteHeader + NavPill(article) |
| `app/routes/pages.$handle.tsx` | **Modify** | Replace header with SiteHeader |
| `app/routes/search.tsx` | **Modify** | Replace header with SiteHeader |

`app/routes/_index.tsx` — **no changes**.

---

## Task 1: Create SiteHeader

**Files:**
- Create: `app/components/SiteHeader.tsx`

- [ ] **Step 1: Create the file with this exact content**

```tsx
// app/components/SiteHeader.tsx

export function SiteHeader() {
  return (
    <header className="fixed top-0 inset-x-0 z-30 h-16 bg-background/90 backdrop-blur-md border-b border-border flex items-center justify-between px-5 sm:px-10">
      {/* Brand */}
      <a
        href="/"
        className="font-display text-xl tracking-tight hover:opacity-70 transition-opacity"
      >
        P3XIV
      </a>

      {/* Search form — hidden on mobile */}
      <form
        action="/search"
        method="get"
        className="hidden sm:flex items-center gap-2.5 bg-card/70 border border-border rounded-full px-4 h-8 hover:border-accent/60 transition-colors"
      >
        <svg
          width="11" height="11" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          aria-hidden="true"
          className="shrink-0 text-muted-foreground"
        >
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          name="q"
          placeholder="Search…"
          className="bg-transparent text-[11px] uppercase tracking-[0.2em] placeholder:text-muted-foreground/60 focus:outline-none w-[100px]"
        />
      </form>

      {/* Right nav */}
      <nav className="flex items-center gap-5 sm:gap-7 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        <a href="/pages/contact" className="hover:text-foreground transition-colors">
          Contact
        </a>
        <a href="/policies/refund-policy" className="hover:text-foreground transition-colors">
          Returns
        </a>
      </nav>
    </header>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors in `SiteHeader.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/components/SiteHeader.tsx
git commit -m "feat: add SiteHeader shared component"
```

---

## Task 2: Create NavPill

**Files:**
- Create: `app/components/NavPill.tsx`

This component reads cart count from the root loader via `useRouteLoaderData('root')`. Cart data is a deferred Promise — wrap the cart count in `<Suspense><Await>`. In product mode, render a `CartForm` inline ATC button with a 2500ms green flash on success.

- [ ] **Step 1: Create the file with this exact content**

```tsx
// app/components/NavPill.tsx
import {useState, Suspense} from 'react';
import {useRouteLoaderData, Await} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import type {RootLoader} from '~/root';

type NavPillProps =
  | {
      mode: 'product';
      title: string;
      price: string;
      currency: string;
      variantId: string;
      availableForSale: boolean;
    }
  | {mode: 'collection'; title: string}
  | {mode: 'article'; title: string};

export function NavPill(props: NavPillProps) {
  const [added, setAdded] = useState(false);
  const rootData = useRouteLoaderData<RootLoader>('root');

  const priceDisplay =
    props.mode === 'product'
      ? (() => {
          const p = parseFloat(props.price);
          return p % 1 === 0 ? `$${p}` : `$${p.toFixed(2)}`;
        })()
      : '';

  return (
    <div className="fixed bottom-8 inset-x-0 z-20 flex justify-center pointer-events-none">
      <div className="flex items-center bg-card/80 backdrop-blur-md border border-border rounded-full px-1 py-1 shadow-lg gap-0.5 pointer-events-auto">
        {/* Account */}
        <a
          href="/account"
          className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
          aria-label="Account"
        >
          <AccountIcon />
        </a>

        {/* Context title */}
        <span className="px-3 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground max-w-[10rem] truncate select-none">
          {props.title}
        </span>

        {/* Product mode: ATC */}
        {props.mode === 'product' &&
          (props.availableForSale ? (
            <CartForm
              route="/cart"
              action={CartForm.ACTIONS.LinesAdd}
              inputs={{lines: [{merchandiseId: props.variantId, quantity: 1}]}}
            >
              {(fetcher) => {
                const isAdding = fetcher.state !== 'idle';
                if (fetcher.state === 'idle' && fetcher.data && !added) {
                  setAdded(true);
                  setTimeout(() => setAdded(false), 2500);
                }
                return (
                  <button
                    type="submit"
                    disabled={isAdding}
                    className={`px-4 py-2 text-[10px] uppercase tracking-[0.2em] rounded-full transition-colors whitespace-nowrap ${
                      added
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-primary text-primary-foreground hover:bg-accent'
                    }`}
                  >
                    {isAdding ? 'Adding…' : added ? '✓ Added' : `Add to Bag ${priceDisplay}`}
                  </button>
                );
              }}
            </CartForm>
          ) : (
            <span className="px-4 py-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground rounded-full whitespace-nowrap">
              Sold Out
            </span>
          ))}

        <div className="w-px h-4 bg-border mx-0.5" />

        {/* Cart */}
        <Suspense
          fallback={
            <a
              href="/cart"
              className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
              aria-label="Cart"
            >
              <CartIcon />
            </a>
          }
        >
          <Await resolve={rootData?.cart}>
            {(cart) => {
              const count = cart?.totalQuantity ?? 0;
              return (
                <a
                  href="/cart"
                  className="relative px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-full"
                  aria-label="Cart"
                >
                  <CartIcon />
                  {count > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-accent text-accent-foreground text-[9px] rounded-full flex items-center justify-center px-1 font-sans font-medium leading-none">
                      {count}
                    </span>
                  )}
                </a>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

function CartIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="9" cy="21" r="1" />
      <circle cx="20" cy="21" r="1" />
      <path d="M1 1h4l2.68 13.39a2 2 0 001.98 1.61h9.72a2 2 0 001.98-1.61L23 6H6" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg
      width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}
```

- [ ] **Step 2: Typecheck**

```bash
npm run typecheck
```

Expected: no errors in `NavPill.tsx`.

- [ ] **Step 3: Commit**

```bash
git add app/components/NavPill.tsx
git commit -m "feat: add NavPill content-aware bottom component"
```

---

## Task 3: Update Product Page

**Files:**
- Modify: `app/routes/products.$handle.tsx`

Changes:
1. Remove the `<header>` element (lines 66–73)
2. Add `pt-16` to the outer wrapper div so content clears the fixed SiteHeader
3. Change image container from `aspect-square` to `h-[55vh] md:aspect-square md:h-auto` (mobile image fix)
4. Add `pb-28` to the outer wrapper div so content clears the NavPill + PolicyBar
5. Add `<SiteHeader />` at the top of the returned JSX
6. Add `<NavPill mode="product" ... />` after `<Analytics.ProductView />`

- [ ] **Step 1: Update imports at the top of `products.$handle.tsx`**

Replace:
```tsx
import {useState} from 'react';
import {redirect, useLoaderData, Link} from 'react-router';
```
With:
```tsx
import {useState} from 'react';
import {redirect, useLoaderData, Link} from 'react-router';
import {SiteHeader} from '~/components/SiteHeader';
import {NavPill} from '~/components/NavPill';
```

- [ ] **Step 2: Replace the returned JSX in the `Product` component**

The current `return (...)` block starts at line 63 and ends at line 253. Replace the entire return statement with:

```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-16 pb-28">
      <SiteHeader />

      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-12 grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* Image gallery */}
        <div className="space-y-4 md:sticky md:top-20">
          <div className="h-[55vh] md:aspect-square md:h-auto bg-secondary/30 flex items-center justify-center overflow-hidden">
            {images.length > 0 ? (
              <img
                key={images[imgIdx]?.url}
                src={images[imgIdx]?.url}
                alt={images[imgIdx]?.altText ?? product.title}
                className="w-full h-full object-contain animate-in fade-in duration-300"
                width={800}
                height={800}
              />
            ) : selectedVariant?.image ? (
              <img
                src={selectedVariant.image.url}
                alt={selectedVariant.image.altText ?? product.title}
                className="w-full h-full object-contain"
                width={800}
                height={800}
              />
            ) : null}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.url}
                  onClick={() => setImgIdx(i)}
                  className={`shrink-0 w-16 h-16 border transition-colors overflow-hidden ${
                    i === imgIdx ? 'border-foreground' : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.altText ?? ''}
                    className="w-full h-full object-contain"
                    width={64}
                    height={64}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product details */}
        <div className="space-y-8 pt-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-3">
              {product.productType}
            </p>
            <h1 className="font-display text-5xl sm:text-6xl leading-[0.92] tracking-tight mb-6">
              {product.title}
            </h1>
            <div className="flex items-baseline gap-4">
              <span className="font-display text-3xl">
                {price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`}
              </span>
              {compareAt && compareAt > price && (
                <span className="text-muted-foreground line-through text-lg">
                  ${compareAt}
                </span>
              )}
              <span className="text-xs uppercase tracking-widest text-muted-foreground">
                {currency}
              </span>
            </div>
          </div>

          {/* Description */}
          {product.descriptionHtml && (
            <div
              className="text-sm leading-relaxed text-muted-foreground max-w-md prose-p:mb-3"
              dangerouslySetInnerHTML={{__html: product.descriptionHtml}}
            />
          )}

          {/* ATC */}
          <div className="space-y-3 pt-2">
            {selectedVariant?.availableForSale ? (
              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesAdd}
                inputs={{
                  lines: [
                    {
                      merchandiseId: selectedVariant.id,
                      quantity: 1,
                    },
                  ],
                }}
              >
                {(fetcher) => {
                  const isAdding = fetcher.state !== 'idle';
                  if (fetcher.state === 'idle' && fetcher.data && !added) {
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2500);
                  }
                  return (
                    <button
                      type="submit"
                      disabled={isAdding}
                      className={`w-full h-14 text-sm uppercase tracking-[0.25em] transition-colors ${
                        added
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-primary text-primary-foreground hover:bg-accent'
                      }`}
                    >
                      {isAdding
                        ? 'Adding…'
                        : added
                          ? '✓ Added to bag'
                          : 'Add to bag'}
                    </button>
                  );
                }}
              </CartForm>
            ) : (
              <button
                disabled
                className="w-full h-14 text-sm uppercase tracking-[0.25em] bg-muted text-muted-foreground cursor-not-allowed"
              >
                Sold out
              </button>
            )}

            <Link
              to="/"
              className="flex items-center justify-center h-12 border border-border text-xs uppercase tracking-[0.25em] hover:bg-muted transition-colors"
            >
              ← Back to the field
            </Link>
          </div>

          {/* Meta */}
          <dl className="border-t border-border pt-6 space-y-3 text-xs">
            {product.vendor && (
              <div className="flex justify-between">
                <dt className="uppercase tracking-widest text-muted-foreground">Maker</dt>
                <dd>{product.vendor}</dd>
              </div>
            )}
            {selectedVariant?.sku && (
              <div className="flex justify-between">
                <dt className="uppercase tracking-widest text-muted-foreground">SKU</dt>
                <dd className="text-muted-foreground">{selectedVariant.sku}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="uppercase tracking-widest text-muted-foreground">Availability</dt>
              <dd className={selectedVariant?.availableForSale ? 'text-foreground' : 'text-muted-foreground'}>
                {selectedVariant?.availableForSale ? 'In stock' : 'Sold out'}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />

      <NavPill
        mode="product"
        title={product.title}
        price={selectedVariant?.price?.amount ?? '0'}
        currency={currency}
        variantId={selectedVariant?.id ?? ''}
        availableForSale={selectedVariant?.availableForSale ?? false}
      />
    </div>
  );
```

- [ ] **Step 3: Remove the unused `Link` import if it's now unused**

Check: `Link` is still used in the "← Back to the field" anchor and breadcrumb — keep it. The `redirect` import from react-router is also still used in the loader. No removals needed.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Start dev server and verify product page manually**

```bash
npm run dev
```

Navigate to any product page (e.g. `http://localhost:3000/products/<handle>`). Verify:
- SiteHeader appears at top (P3XIV left, search center, Contact/Returns right)
- On mobile: image is ~55% viewport height, content scrolls naturally below
- On desktop: image is square in left column, sticky as you scroll right-column content
- NavPill appears at bottom: Account · [Product Title] · Add to Bag $XX · | · Cart
- Clicking "Add to Bag" in the pill adds to cart and flashes green ✓
- Body "Add to bag" button still works

- [ ] **Step 6: Commit**

```bash
git add app/routes/products.$handle.tsx
git commit -m "feat: add SiteHeader + NavPill(product) to product page, fix mobile image height"
```

---

## Task 4: Update Collection Detail Page

**Files:**
- Modify: `app/routes/collections.$handle.tsx`

The collection canvas is a `fixed inset-0` layout. The existing header has P3XIV on the left and sort controls on the right. The SiteHeader replaces the left side; sort controls move to a separate strip positioned just below the header. The existing bottom nav pill (Field/Collections links) is replaced by `<NavPill mode="collection" />`. The centered search input is removed (SiteHeader has search).

- [ ] **Step 1: Update imports**

Replace:
```tsx
import {useState, useCallback} from 'react';
import {useLoaderData, Link, useNavigate} from 'react-router';
```
With:
```tsx
import {useState, useCallback} from 'react';
import {useLoaderData, Link, useNavigate} from 'react-router';
import {SiteHeader} from '~/components/SiteHeader';
import {NavPill} from '~/components/NavPill';
```

- [ ] **Step 2: Replace the returned JSX in `CollectionDetail`**

Replace the entire `return (...)` block with:

```tsx
  return (
    <div className="fixed inset-0 bg-background text-foreground grain overflow-hidden">
      <SiteHeader />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 30%, oklch(0.972 0.012 85 / 0.0) 50%, oklch(0.85 0.02 75 / 0.55) 100%)',
        }}
      />

      {/* Canvas */}
      <InfiniteCanvas
        products={products}
        query={query}
        onSelect={handleSelect}
        onHover={handleHover}
      />

      {/* Sort controls — positioned below SiteHeader */}
      <div className="absolute top-[68px] right-5 z-20 pointer-events-auto">
        <div className="flex items-center gap-1 bg-card/70 backdrop-blur-md border border-border rounded-full px-3 py-1.5">
          {SORT_OPTIONS.map((opt) => {
            const isActive = opt.value === activeSort.value && opt.reverse === activeSort.reverse;
            return (
              <button
                key={`${opt.value}-${opt.reverse}`}
                onClick={() => setSort(opt.value, opt.reverse)}
                className={`px-3 py-1 text-[10px] uppercase tracking-[0.2em] rounded-full transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hover label */}
      <div
        className={`absolute z-20 left-1/2 -translate-x-1/2 bottom-32 transition-all duration-500 pointer-events-none ${
          hovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
        }`}
      >
        {hovered && (
          <div className="text-center">
            <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-1">
              {hovered.productType}
            </div>
            <div className="font-display text-3xl sm:text-4xl">{hovered.title}</div>
            <div className="text-sm text-muted-foreground mt-1">
              ${parseFloat(hovered.priceRange.minVariantPrice.amount)} · click to open
            </div>
          </div>
        )}
      </div>

      <NavPill mode="collection" title={collection.title} />

      <ProductOverlay product={selected} onClose={() => setSelected(null)} />

      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </div>
  );
```

- [ ] **Step 3: Remove the `query` state and its input since the centered search pill was removed**

The `const [query, setQuery] = useState('');` was used by the now-removed search pill AND passed to `InfiniteCanvas`. Keep the state — `InfiniteCanvas` still receives `query` prop. If you'd like users to search within the canvas on this page, it can be added back later. For now, just keep `query` as empty string constant OR keep the state as-is (InfiniteCanvas will just always receive an empty string). Keep the state declaration as-is — it's harmless.

- [ ] **Step 4: Typecheck**

```bash
npm run typecheck
```

Expected: no errors.

- [ ] **Step 5: Verify in dev server**

Navigate to `http://localhost:3000/collections/<handle>`. Verify:
- SiteHeader appears at top over the canvas
- Sort controls appear just below SiteHeader on the right
- Canvas is visible below
- NavPill appears at bottom: Account · [Collection Name] · | · Cart
- Clicking a product still opens the ProductOverlay

- [ ] **Step 6: Commit**

```bash
git add app/routes/collections.$handle.tsx
git commit -m "feat: add SiteHeader + NavPill(collection) to collection canvas page"
```

---

## Task 5: Update Collections Index Page

**Files:**
- Modify: `app/routes/collections._index.tsx`

- [ ] **Step 1: Update imports**

Add after the existing imports:
```tsx
import {SiteHeader} from '~/components/SiteHeader';
import {NavPill} from '~/components/NavPill';
```

- [ ] **Step 2: Replace the returned JSX in `CollectionsIndex`**

Replace:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground grain overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, oklch(0.85 0.02 75 / 0.4) 100%)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 h-16">
        <Link
          to="/"
          className="font-display text-xl tracking-tight hover:text-accent transition-colors"
        >
          P3XIV
        </Link>
        <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Collections
        </span>
      </header>

      <main className="relative z-10 px-6 sm:px-12 pt-8 pb-24">
```
With:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground grain overflow-hidden pt-16 pb-28">
      <SiteHeader />

      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, oklch(0.85 0.02 75 / 0.4) 100%)',
        }}
      />

      <main className="relative z-10 px-6 sm:px-12 pt-8">
```

Also replace the existing "← Back to the field" link at the bottom — remove it since SiteHeader provides navigation back. The closing `</main>` and `</div>` tags remain unchanged.

- [ ] **Step 3: Add NavPill before the closing outer `</div>`**

Find the closing:
```tsx
    </main>
    </div>
  );
```
Replace with:
```tsx
      </main>

      <NavPill mode="collection" title="Collections" />
    </div>
  );
```

- [ ] **Step 4: Remove the now-unused `Link` import**

Check if `Link` is still used anywhere in the file. The collection cards and "All" card still use `<Link>`. Keep the import.

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 6: Verify in dev server**

Navigate to `http://localhost:3000/collections`. Verify:
- SiteHeader at top
- Grid of collections visible
- NavPill at bottom: Account · Collections · | · Cart

- [ ] **Step 7: Commit**

```bash
git add app/routes/collections._index.tsx
git commit -m "feat: add SiteHeader + NavPill(collection) to collections index"
```

---

## Task 6: Update Blog Listing Page

**Files:**
- Modify: `app/routes/blogs.$blogHandle._index.tsx`

The existing `<header className="absolute top-0 inset-x-0 z-20 ...">` with `← P3XIV` overlays the hero. Replace it with `<SiteHeader />` and add `<NavPill mode="article" title={blog.title} />`.

- [ ] **Step 1: Update imports**

Add after existing imports:
```tsx
import {SiteHeader} from '~/components/SiteHeader';
import {NavPill} from '~/components/NavPill';
```

- [ ] **Step 2: In the `Blog` component, replace the `<header>` element**

Find and remove this block:
```tsx
      {/* Floating nav — sits over the hero image */}
      <header className="absolute top-0 inset-x-0 z-20 flex items-center justify-between px-6 sm:px-12 h-16">
        <Link
          to="/"
          className="font-display text-lg tracking-tight text-white/90 hover:text-white transition-colors drop-shadow"
        >
          ← P3XIV
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60 drop-shadow hidden sm:inline">
          {blog.title}
        </span>
      </header>
```

Add `<SiteHeader />` as the first child of the outer `<div>`, and add `<NavPill>` before the closing `</div>`. The outer `<div>` currently has `className="min-h-screen bg-background text-foreground font-sans"` — add `pb-28` to it:

```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-28">
      <SiteHeader />

      {/* Featured hero — newest article, full bleed */}
      <PaginatedResourceSection<ArticleItemFragment> connection={blog.articles}>
        {({node: article, index}) => {
          if (index === 0) return <FeaturedArticle key={article.id} article={article} />;
          return null;
        }}
      </PaginatedResourceSection>

      {/* Grid section */}
      <section className="max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24">
        {blog.articles.nodes.length > 1 && (
          <div className="flex items-center gap-6 mb-12">
            <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground shrink-0">
              More from the journal
            </p>
            <div className="flex-1 h-px bg-border" />
          </div>
        )}

        <PaginatedResourceSection<ArticleItemFragment>
          connection={blog.articles}
          resourcesClassName="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14"
        >
          {({node: article, index}) => {
            if (index === 0) return null;
            return (
              <ArticleCard
                key={article.id}
                article={article}
                loading={index < 4 ? 'eager' : 'lazy'}
              />
            );
          }}
        </PaginatedResourceSection>
      </section>

      <NavPill mode="article" title={blog.title} />
    </div>
  );
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Verify in dev server**

Navigate to `http://localhost:3000/blogs/news`. Verify:
- SiteHeader at top (overlaying hero)
- Hero image fills screen below header
- NavPill at bottom: Account · [Blog Title] · | · Cart

- [ ] **Step 5: Commit**

```bash
git add app/routes/blogs.$blogHandle._index.tsx
git commit -m "feat: add SiteHeader + NavPill(article) to blog listing page"
```

---

## Task 7: Update Article Page

**Files:**
- Modify: `app/routes/blogs.$blogHandle.$articleHandle.tsx`

The article page has a "← Journal" back link positioned inside the hero image. Keep that as-is — it's in the hero body, not the page header. Add `<SiteHeader />` and `<NavPill mode="article" ... />`. The outer `<div>` gets `pb-28`.

- [ ] **Step 1: Update imports**

Add after existing imports:
```tsx
import {SiteHeader} from '~/components/SiteHeader';
import {NavPill} from '~/components/NavPill';
```

- [ ] **Step 2: Update the `Article` component's return**

Find the opening of the return:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Hero — full bleed with gradient + title overlay */}
```

Replace with:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-28">
      <SiteHeader />

      {/* Hero — full bleed with gradient + title overlay */}
```

Find the very end of the `return` block — the closing `</div>` just before the `}` closing the `Article` function. Add `<NavPill>` before it:

```tsx
      </article>

      <NavPill mode="article" title={title} />
    </div>
  );
```

- [ ] **Step 3: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 4: Verify in dev server**

Navigate to an article page (e.g. `http://localhost:3000/blogs/news/<article-handle>`). Verify:
- SiteHeader at top (overlaying hero if present)
- Article content below
- "← Back to Journal" link in article footer still works
- NavPill at bottom: Account · [Article Title] · | · Cart

- [ ] **Step 5: Commit**

```bash
git add app/routes/blogs.$blogHandle.$articleHandle.tsx
git commit -m "feat: add SiteHeader + NavPill(article) to article page"
```

---

## Task 8: Update Pages, Search, and Policies Routes

**Files:**
- Modify: `app/routes/pages.$handle.tsx`
- Modify: `app/routes/search.tsx`
- Modify: `app/routes/policies.$handle.tsx`

These get SiteHeader only (no NavPill — no contextual action needed on generic content pages).

- [ ] **Step 1: Update `pages.$handle.tsx` imports**

Add:
```tsx
import {SiteHeader} from '~/components/SiteHeader';
```

- [ ] **Step 2: Update `pages.$handle.tsx` JSX**

Find:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 sm:px-12 h-16 border-b border-border">
        <Link to="/" className="font-display text-lg tracking-tight hover:text-accent transition-colors">
          ← P3XIV
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">
          {page.title}
        </span>
      </header>
```

Replace with:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-16">
      <SiteHeader />
```

- [ ] **Step 3: Update `search.tsx` imports**

Add:
```tsx
import {SiteHeader} from '~/components/SiteHeader';
```

- [ ] **Step 4: Update `search.tsx` JSX**

The search page has:
```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="font-display text-lg tracking-tight hover:text-accent transition-colors">
```

Replace the `<header>` block with `<SiteHeader />` and add `pt-16` to the outer div. Find the end of the `<header>` closing tag and replace:

```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-16">
      <SiteHeader />
```

(Remove the `<header>...</header>` block entirely.)

- [ ] **Step 5: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 6: Update `policies.$handle.tsx` imports**

Add:
```tsx
import {SiteHeader} from '~/components/SiteHeader';
```

- [ ] **Step 7: Replace `policies.$handle.tsx` JSX**

The policy page is currently an unstyled stub with a `.policy` div. Replace the entire return with:

```tsx
  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-16 pb-16">
      <SiteHeader />
      <div className="max-w-3xl mx-auto px-6 sm:px-12 py-12">
        <Link
          to="/policies"
          className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Policies
        </Link>
        <h1 className="font-display text-5xl sm:text-6xl leading-[0.92] tracking-tight mt-8 mb-10">
          {policy.title}
        </h1>
        <div
          className="text-sm leading-relaxed text-muted-foreground [&_p]:mb-4 [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3"
          dangerouslySetInnerHTML={{__html: policy.body}}
        />
      </div>
    </div>
  );
```

- [ ] **Step 8: Typecheck**

```bash
npm run typecheck
```

- [ ] **Step 9: Verify in dev server**

Navigate to `http://localhost:3000/pages/contact`, `http://localhost:3000/search?q=test`, and `http://localhost:3000/policies/privacy-policy`. Verify:
- SiteHeader appears correctly on all three pages
- Page content begins below the header (not behind it)
- Policy page renders styled content

- [ ] **Step 10: Commit**

```bash
git add app/routes/pages.$handle.tsx app/routes/search.tsx app/routes/policies.$handle.tsx
git commit -m "feat: add SiteHeader to pages, search, and policies routes"
```

---

## Task 9: Build, Deploy, and Verify

- [ ] **Step 1: Final typecheck**

```bash
npm run typecheck
```

Expected: 0 errors.

- [ ] **Step 2: Lint**

```bash
npm run lint
```

Expected: no new errors.

- [ ] **Step 3: Deploy to Oxygen**

```bash
git push
```

Oxygen auto-deploys on push to main. Wait for deployment to complete in Shopify admin (Partners → Hydrogen → Deployments) or check the GitHub Actions output.

- [ ] **Step 4: Verify live in browser**

Check these URLs on the live Oxygen deployment:

| URL | Expected |
|---|---|
| `/products/<any-handle>` | SiteHeader, 55vh image on mobile, NavPill with ATC |
| `/collections/<any-handle>` | SiteHeader, sort controls below, NavPill |
| `/collections` | SiteHeader, grid layout, NavPill |
| `/blogs/news` | SiteHeader overlaying hero, NavPill |
| `/blogs/news/<any-article>` | SiteHeader overlaying hero, NavPill |
| `/pages/contact` | SiteHeader, page content offset correctly |
| `/` | **Homepage unchanged** — existing pill and header still work |
