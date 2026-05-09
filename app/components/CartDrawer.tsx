import {Suspense, useState, useRef} from 'react';
import {Await, useRouteLoaderData} from 'react-router';
import {CartForm, Money} from '@shopify/hydrogen';
import type {RootLoader} from '~/root';

type PromoProduct = {
  id: string;
  title: string;
  handle: string;
  priceRange: {minVariantPrice: {amount: string; currencyCode: string}};
  featuredImage: {url: string; altText: string | null} | null;
  variants: {nodes: {id: string; availableForSale: boolean}[]};
};

type Props = {
  open: boolean;
  onClose: () => void;
  promoProducts?: PromoProduct[];
};

export function CartDrawer({open, onClose, promoProducts = []}: Props) {
  const rootData = useRouteLoaderData<RootLoader>('root');

  return (
    <div
      className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!open}
    >
      <div
        className={`absolute inset-0 bg-foreground/30 backdrop-blur-sm transition-opacity duration-500 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border shadow-2xl transition-transform duration-500 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Shopping cart"
      >
        <header className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <span className="font-display text-xl">Your Cart</span>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest hover:text-accent transition-colors"
          >
            Close
          </button>
        </header>

        <Suspense
          fallback={
            <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground italic">
              Loading…
            </div>
          }
        >
          <Await resolve={rootData?.cart}>
            {(cart) => {
              const lines = cart?.lines?.nodes ?? [];
              const subtotal = cart?.cost?.subtotalAmount;
              const checkoutUrl = cart?.checkoutUrl;
              const currentNote = (cart as any)?.note ?? '';

              if (lines.length === 0) {
                return (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground italic">
                      Your cart is quiet for now.
                    </div>
                    {promoProducts.length > 0 && (
                      <PromoSection products={promoProducts} />
                    )}
                  </div>
                );
              }

              return (
                <>
                  {/* Line items */}
                  <div className="flex-1 overflow-y-auto">
                    <ul>
                      {lines.map((line: any) => (
                        <li key={line.id} className="flex gap-4 p-6 border-b border-border">
                          {line.merchandise.image && (
                            <div className="w-20 h-20 bg-muted flex items-center justify-center shrink-0">
                              <img
                                src={line.merchandise.image.url}
                                alt={line.merchandise.image.altText ?? line.merchandise.product.title}
                                className="max-w-full max-h-full object-contain"
                                width={80}
                                height={80}
                                loading="lazy"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                              {line.merchandise.product.productType}
                            </div>
                            <div className="font-display text-lg leading-tight">
                              {line.merchandise.product.title}
                            </div>
                            {line.merchandise.title !== 'Default Title' && (
                              <div className="text-xs text-muted-foreground mt-0.5">{line.merchandise.title}</div>
                            )}
                            <div className="text-sm mt-1 text-muted-foreground">
                              <Money data={line.merchandise.price} /> · qty {line.quantity}
                            </div>
                            <CartForm
                              route="/cart"
                              action={CartForm.ACTIONS.LinesRemove}
                              inputs={{lineIds: [line.id]}}
                            >
                              <button
                                type="submit"
                                className="text-xs text-muted-foreground hover:text-destructive mt-2 uppercase tracking-widest transition-colors"
                              >
                                Remove
                              </button>
                            </CartForm>
                          </div>
                        </li>
                      ))}
                    </ul>

                    {/* Order note */}
                    <CartNote currentNote={currentNote} />

                    {/* Promo collection — or fallback */}
                    {promoProducts.length > 0 ? (
                      <PromoSection products={promoProducts} />
                    ) : (
                      <PromoFallback />
                    )}
                  </div>

                  <footer className="border-t border-border p-6 space-y-4 shrink-0">
                    {subtotal && (
                      <div className="flex justify-between font-display text-xl">
                        <span>Subtotal</span>
                        <Money data={subtotal} />
                      </div>
                    )}
                    {checkoutUrl && (
                      <a
                        href={checkoutUrl}
                        className="block w-full h-12 bg-primary text-primary-foreground text-xs uppercase tracking-[0.25em] hover:bg-accent transition-colors flex items-center justify-center"
                      >
                        Checkout
                      </a>
                    )}
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
                      Shipping &amp; taxes calculated at checkout
                    </p>
                  </footer>
                </>
              );
            }}
          </Await>
        </Suspense>
      </div>
    </div>
  );
}

// ── Order note ────────────────────────────────────────────────────────────────

function CartNote({currentNote}: {currentNote: string}) {
  const [note, setNote] = useState(currentNote);
  const [saved, setSaved] = useState(false);
  const submitRef = useRef<HTMLButtonElement>(null);

  function handleBlur() {
    if (note !== currentNote) {
      submitRef.current?.click();
    }
  }

  function handleSaved() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="px-6 py-5 border-b border-border">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-2">
        Order note
      </p>
      <CartForm
        route="/cart"
        action={CartForm.ACTIONS.NoteUpdate}
        inputs={{note}}
      >
        {(fetcher) => (
          <>
            <textarea
              value={note}
              onChange={(e) => { setNote(e.target.value); setSaved(false); }}
              onBlur={handleBlur}
              placeholder="Gift message, delivery instructions…"
              rows={3}
              className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2.5 text-sm font-sans placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring/40 resize-none text-foreground"
            />
            <div className="flex items-center justify-between mt-1.5">
              <button
                ref={submitRef}
                type="submit"
                onClick={handleSaved}
                className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors"
              >
                {fetcher.state !== 'idle' ? 'Saving…' : 'Save note'}
              </button>
              {saved && (
                <span className="text-[10px] uppercase tracking-[0.25em] text-accent">Saved ✓</span>
              )}
            </div>
          </>
        )}
      </CartForm>
    </div>
  );
}

// ── Promo collection ──────────────────────────────────────────────────────────

function PromoSection({products}: {products: PromoProduct[]}) {
  return (
    <div className="px-6 py-5">
      <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-4">
        You might also like
      </p>
      <div className="grid grid-cols-2 gap-3">
        {products.map((product) => {
          const variantId = product.variants.nodes[0]?.id;
          const available = product.variants.nodes[0]?.availableForSale;
          return (
            <div key={product.id} className="group">
              <div className="aspect-square bg-muted overflow-hidden rounded-lg mb-2">
                {product.featuredImage ? (
                  <img
                    src={product.featuredImage.url}
                    alt={product.featuredImage.altText ?? product.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                    No image
                  </div>
                )}
              </div>
              <p className="font-display text-sm leading-tight truncate">{product.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                ${parseFloat(product.priceRange.minVariantPrice.amount)}
              </p>
              {variantId && available && (
                <CartForm
                  route="/cart"
                  action={CartForm.ACTIONS.LinesAdd}
                  inputs={{lines: [{merchandiseId: variantId, quantity: 1}]}}
                >
                  <button
                    type="submit"
                    className="mt-1.5 text-[9px] uppercase tracking-[0.25em] text-muted-foreground hover:text-accent transition-colors"
                  >
                    Add to cart
                  </button>
                </CartForm>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Fallback when no cart-promo collection exists ─────────────────────────────

function PromoFallback() {
  return (
    <div className="px-6 py-8 text-center border-t border-border">
      <p className="font-display text-lg italic text-muted-foreground leading-snug">
        "I press on toward the goal"
      </p>
      <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground/60 mt-2">
        Philippians 3:14
      </p>
    </div>
  );
}
