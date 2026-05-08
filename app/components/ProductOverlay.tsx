import {useEffect} from 'react';
import type {Product} from '~/lib/products';

type Props = {
  product: Product | null;
  onClose: () => void;
  onAdd: (p: Product) => void;
};

export function ProductOverlay({product, onClose, onAdd}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-8"
      role="dialog"
      aria-modal="true"
      aria-label={product.name}
    >
      <button
        className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-5xl grid md:grid-cols-2 gap-8 md:gap-16 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="aspect-square flex items-center justify-center">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-[70vh] w-auto object-contain drop-shadow-2xl"
            width={768}
            height={768}
          />
        </div>
        <div className="space-y-6">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {product.tag}
          </div>
          <h2 className="font-display text-5xl sm:text-6xl leading-[0.95] tracking-tight">
            {product.name}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground max-w-md">
            {product.story}
          </p>
          <div className="flex items-baseline gap-4 pt-2">
            <span className="font-display text-3xl">${product.price}</span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              USD
            </span>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => onAdd(product)}
              className="flex-1 h-12 bg-primary text-primary-foreground text-xs uppercase tracking-[0.25em] hover:bg-accent transition-colors"
            >
              Add to bag
            </button>
            <button
              onClick={onClose}
              className="h-12 px-6 border border-border text-xs uppercase tracking-[0.25em] hover:bg-muted transition-colors"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={onClose}
        className="absolute top-6 right-6 h-10 w-10 rounded-full border border-border bg-card/80 backdrop-blur flex items-center justify-center text-lg hover:bg-muted transition-colors"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
}
