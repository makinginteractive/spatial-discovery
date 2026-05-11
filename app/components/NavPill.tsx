// app/components/NavPill.tsx
import {useState, useRef, Suspense} from 'react';
import {useRouteLoaderData, Await} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import type {RootLoader} from '~/root';

type NavPillProps =
  | {
      mode: 'product';
      title: string;
      price: string;
      variantId: string;
      availableForSale: boolean;
    }
  | {mode: 'collection'; title: string}
  | {mode: 'article'; title: string};

export function NavPill(props: NavPillProps) {
  const [added, setAdded] = useState(false);
  const atcTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
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
                  if (atcTimeoutRef.current) clearTimeout(atcTimeoutRef.current);
                  atcTimeoutRef.current = setTimeout(() => setAdded(false), 2500);
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
