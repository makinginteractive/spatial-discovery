import {useEffect, useState} from 'react';
import {Link} from 'react-router';
import {CartForm} from '@shopify/hydrogen';
import type {CanvasProduct} from '~/components/InfiniteCanvas';

type Props = {
  product: CanvasProduct | null;
  onClose: () => void;
};

export function ProductOverlay({product, onClose}: Props) {
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setImgIdx(0);
    setAdded(false);
  }, [product?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!product) return null;

  const images = product.images.nodes.length
    ? product.images.nodes
    : product.featuredImage
      ? [product.featuredImage]
      : [];

  const variantId = product.variants.nodes[0]?.id;
  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const currency = product.priceRange.minVariantPrice.currencyCode;

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center px-4 sm:px-8"
      role="dialog"
      aria-modal="true"
      aria-label={product.title}
    >
      <button
        className="absolute inset-0 bg-background/80 backdrop-blur-xl animate-in fade-in duration-500"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full max-w-4xl grid md:grid-cols-2 gap-8 md:gap-12 items-center animate-in fade-in slide-in-from-bottom-4 duration-700">

        {/* Image gallery */}
        <div className="relative aspect-square flex items-center justify-center">
          {images.length > 0 && (
            <img
              key={images[imgIdx]?.url}
              src={images[imgIdx]?.url}
              alt={images[imgIdx]?.altText ?? product.title}
              className="max-h-[60vh] w-auto object-contain drop-shadow-2xl animate-in fade-in duration-300"
              width={768}
              height={768}
            />
          )}

          {/* Prev/next */}
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                className="absolute left-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
                aria-label="Previous image"
              >
                ‹
              </button>
              <button
                onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
                aria-label="Next image"
              >
                ›
              </button>
            </>
          )}

          {/* Dot indicators */}
          {images.length > 1 && (
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setImgIdx(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-foreground' : 'bg-foreground/20'}`}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          <div className="text-xs uppercase tracking-[0.3em] text-muted-foreground">
            {product.productType}
          </div>
          <h2 className="font-display text-4xl sm:text-5xl leading-[0.95] tracking-tight">
            {product.title}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
            {product.description}
          </p>
          <div className="flex items-baseline gap-3 pt-1">
            <span className="font-display text-3xl">
              {price % 1 === 0 ? `$${price}` : `$${price.toFixed(2)}`}
            </span>
            <span className="text-xs uppercase tracking-widest text-muted-foreground">
              {currency}
            </span>
          </div>

          <div className="flex flex-col gap-3 pt-2">
            {/* Quick ATC */}
            {variantId && (
              <CartForm
                route="/cart"
                action={CartForm.ACTIONS.LinesAdd}
                inputs={{lines: [{merchandiseId: variantId, quantity: 1}]}}
              >
                {(fetcher) => {
                  const isAdding = fetcher.state !== 'idle';
                  if (fetcher.state === 'idle' && fetcher.data && !added) {
                    setAdded(true);
                    setTimeout(() => setAdded(false), 2000);
                  }
                  return (
                    <button
                      type="submit"
                      disabled={isAdding}
                      className={`h-12 text-xs uppercase tracking-[0.25em] transition-colors ${
                        added
                          ? 'bg-accent text-accent-foreground'
                          : 'bg-primary text-primary-foreground hover:bg-accent'
                      }`}
                    >
                      {isAdding ? 'Adding…' : added ? '✓ Added to bag' : 'Quick add to bag'}
                    </button>
                  );
                }}
              </CartForm>
            )}

            {/* View full product */}
            <Link
              to={`/products/${product.handle}`}
              onClick={onClose}
              className="h-12 border border-border text-xs uppercase tracking-[0.25em] hover:bg-muted transition-colors flex items-center justify-center"
            >
              View full details →
            </Link>

            <button
              onClick={onClose}
              className="text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Keep browsing
            </button>
          </div>
        </div>
      </div>

      {/* Close button */}
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
