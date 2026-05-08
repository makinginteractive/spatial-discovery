import type {Product} from '~/lib/products';

type Props = {
  items: {product: Product; qty: number}[];
  open: boolean;
  onClose: () => void;
  onRemove: (id: string) => void;
};

export function CartDrawer({items, open, onClose, onRemove}: Props) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0);
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
        <header className="flex items-center justify-between px-6 h-16 border-b border-border">
          <span className="font-display text-xl">Your Bag</span>
          <button
            onClick={onClose}
            className="text-xs uppercase tracking-widest hover:text-accent"
          >
            Close
          </button>
        </header>
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground italic">
              Your bag is quiet for now.
            </div>
          ) : (
            <ul>
              {items.map(({product, qty}) => (
                <li
                  key={product.id}
                  className="flex gap-4 p-6 border-b border-border"
                >
                  <div className="w-20 h-20 bg-muted flex items-center justify-center shrink-0">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="max-w-full max-h-full object-contain"
                      width={80}
                      height={80}
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                      {product.tag}
                    </div>
                    <div className="font-display text-lg leading-tight">
                      {product.name}
                    </div>
                    <div className="text-sm mt-1">
                      ${product.price} · qty {qty}
                    </div>
                    <button
                      onClick={() => onRemove(product.id)}
                      className="text-xs text-muted-foreground hover:text-destructive mt-2 uppercase tracking-widest"
                    >
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <footer className="border-t border-border p-6 space-y-4">
            <div className="flex justify-between font-display text-xl">
              <span>Subtotal</span>
              <span>${subtotal}</span>
            </div>
            <button className="w-full h-12 bg-primary text-primary-foreground text-xs uppercase tracking-[0.25em] hover:bg-accent transition-colors">
              Checkout
            </button>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest text-center">
              Shipping &amp; taxes calculated at checkout
            </p>
          </footer>
        )}
      </aside>
    </div>
  );
}
