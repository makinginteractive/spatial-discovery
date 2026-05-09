import {useState} from 'react';
import {redirect, useLoaderData, Link} from 'react-router';
import type {Route} from './+types/products.$handle';
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
  CartForm,
} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.product.title ?? 'Product'} — P3XIV`},
  {rel: 'canonical', href: `/products/${data?.product.handle}`},
];

export async function loader(args: Route.LoaderArgs) {
  const deferredData = loadDeferredData(args);
  const criticalData = await loadCriticalData(args);
  return {...deferredData, ...criticalData};
}

async function loadCriticalData({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  const {storefront} = context;
  if (!handle) throw new Error('Expected product handle to be defined');

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
  ]);

  if (!product?.id) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle, data: product});
  return {product};
}

function loadDeferredData(_args: Route.LoaderArgs) {
  return {};
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>();
  const [imgIdx, setImgIdx] = useState(0);
  const [added, setAdded] = useState(false);

  const selectedVariant = useOptimisticVariant(
    product.selectedOrFirstAvailableVariant,
    getAdjacentAndFirstAvailableVariants(product),
  );
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions);

  const images = product.images?.nodes ?? [];
  const price = parseFloat(selectedVariant?.price?.amount ?? '0');
  const compareAt = selectedVariant?.compareAtPrice
    ? parseFloat(selectedVariant.compareAtPrice.amount)
    : null;
  const currency = selectedVariant?.price?.currencyCode ?? 'USD';

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 sm:px-12 h-16 border-b border-border">
        <Link to="/" className="font-display text-lg tracking-tight hover:text-accent transition-colors">
          ← P3XIV
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">
          {product.productType}
        </span>
      </header>

      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-12 grid md:grid-cols-2 gap-12 lg:gap-20 items-start">

        {/* Image gallery */}
        <div className="space-y-4 sticky top-12">
          <div className="aspect-square bg-secondary/30 flex items-center justify-center overflow-hidden">
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
    </div>
  );
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice { amount currencyCode }
    id
    image { __typename id url altText width height }
    price { amount currencyCode }
    product { title handle }
    selectedOptions { name value }
    sku
    title
    unitPrice { amount currencyCode }
  }
` as const;

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    productType
    encodedVariantExistence
    encodedVariantAvailability
    images(first: 8) {
      nodes { url altText width height }
    }
    options {
      name
      optionValues {
        name
        firstSelectableVariant { ...ProductVariant }
        swatch {
          color
          image { previewImage { url } }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants(selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo { description title }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const;

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const;
