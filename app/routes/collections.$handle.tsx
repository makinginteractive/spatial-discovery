import {useState, useCallback} from 'react';
import {useLoaderData, useNavigate} from 'react-router';
import type {Route} from './+types/collections.$handle';
import {Analytics} from '@shopify/hydrogen';
import {InfiniteCanvas, type CanvasProduct} from '~/components/InfiniteCanvas';
import {ProductOverlay} from '~/components/ProductOverlay';
import {SiteHeader} from '~/components/SiteHeader';
import {NavPill} from '~/components/NavPill';
import {PolicyBar} from '~/components/PolicyBar';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.collection.title ?? 'Collection'} — P3XIV`},
];

const SORT_OPTIONS = [
  {label: 'Featured', value: 'MANUAL', reverse: false},
  {label: 'Newest', value: 'CREATED', reverse: true},
  {label: 'Price ↑', value: 'PRICE', reverse: false},
  {label: 'Price ↓', value: 'PRICE', reverse: true},
  {label: 'A–Z', value: 'TITLE', reverse: false},
] as const;

export async function loader({context, params, request}: Route.LoaderArgs) {
  const {handle} = params;
  if (!handle) throw new Response(null, {status: 404});

  const url = new URL(request.url);
  const sortParam = url.searchParams.get('sort') ?? 'MANUAL';
  const reverseParam = url.searchParams.get('reverse') === 'true';

  const {collection} = await context.storefront.query(COLLECTION_QUERY, {
    variables: {handle, first: 48, sortKey: sortParam, reverse: reverseParam},
  });

  if (!collection) throw new Response(null, {status: 404});

  return {
    collection,
    products: collection.products.nodes as CanvasProduct[],
    sortKey: sortParam,
    reverse: reverseParam,
  };
}

export default function CollectionDetail() {
  const {collection, products, sortKey, reverse} = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<CanvasProduct | null>(null);
  const [hovered, setHovered] = useState<CanvasProduct | null>(null);
  const [query, setQuery] = useState('');

  const handleSelect = useCallback((p: CanvasProduct) => setSelected(p), []);
  const handleHover = useCallback((p: CanvasProduct | null) => setHovered(p), []);

  const activeSort = SORT_OPTIONS.find(
    (o) => o.value === sortKey && o.reverse === reverse,
  ) ?? SORT_OPTIONS[0];

  function setSort(value: string, rev: boolean) {
    navigate(
      `/collections/${collection.handle}?sort=${value}&reverse=${rev}`,
      {replace: true},
    );
  }

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
      <PolicyBar />

      <ProductOverlay product={selected} onClose={() => setSelected(null)} />

      <Analytics.CollectionView
        data={{collection: {id: collection.id, handle: collection.handle}}}
      />
    </div>
  );
}

const COLLECTION_QUERY = `#graphql
  query Collection(
    $handle: String!
    $first: Int!
    $sortKey: ProductCollectionSortKeys!
    $reverse: Boolean!
  ) {
    collection(handle: $handle) {
      id
      title
      handle
      description
      products(first: $first, sortKey: $sortKey, reverse: $reverse) {
        nodes {
          id
          title
          handle
          description
          productType
          priceRange {
            minVariantPrice { amount currencyCode }
          }
          featuredImage { url altText }
          images(first: 5) {
            nodes { url altText }
          }
          variants(first: 1) {
            nodes { id availableForSale }
          }
        }
      }
    }
  }
` as const;
