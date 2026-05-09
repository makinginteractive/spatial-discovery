import {Suspense} from 'react';
import {Await, useRouteLoaderData} from 'react-router';
import {CartForm, Money} from '@shopify/hydrogen';
import type {RootLoader} from '~/root';

type Props = {
  open: boolean;
  onClose: () => void;
};

export function CartDrawer({open, onClose}: Props) {
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
      <aside
        className={`absolute right-0 top-0 bottom-0 w-full sm:w-[420px] bg-card border-l border-border shadow-2xl transition-transform duration-500 flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-label="Shopping bag"
      >
        <header className="flex items-center justify-between px-6 h-16 border-b border-border shrink-0">
          <span className="font-display text-xl">Your Bag</span>
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

              if (lines.length === 0) {
                return (
                  <div className="flex-1 flex items-center justify-center text-sm text-muted-foreground italic">
                    Your bag is quiet for now.
                  </div>
                );
              }

              return (
                <>
                  <div className="flex-1 overflow-y-auto">
                    <ul>
                      {lines.map((line: any) => (
                        <li
                          key={line.id}
                          className="flex gap-4 p-6 border-b border-border"
                        >
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
      </aside>
    </div>
  );
}
