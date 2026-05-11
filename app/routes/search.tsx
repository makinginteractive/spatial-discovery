import {useLoaderData, Link, Form} from 'react-router';
import type {Route} from './+types/search';
import {SiteHeader} from '~/components/SiteHeader';
import {getPaginationVariables, Image, Money, Analytics} from '@shopify/hydrogen';
import {urlWithTrackingParams, type RegularSearchReturn} from '~/lib/search';
import type {RegularSearchQuery} from 'storefrontapi.generated';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${(data as any)?.term ? `"${(data as any).term}" — Search` : 'Search'} — P3XIV`},
];

export async function loader({request, context}: Route.LoaderArgs) {
  const url = new URL(request.url);
  const isPredictive = url.searchParams.has('predictive');

  if (isPredictive) {
    // Predictive handled by the existing path — keep as-is
    return predictiveSearch({request, context});
  }

  return regularSearch({request, context});
}

export default function SearchPage() {
  const data = useLoaderData<typeof loader>();

  if ((data as any).type === 'predictive') return null;

  const {term, result, error} = data as RegularSearchReturn;
  const products = result?.items?.products?.nodes ?? [];
  const articles = result?.items?.articles?.nodes ?? [];
  const pages = result?.items?.pages?.nodes ?? [];
  const total = result?.total ?? 0;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-16">
      <SiteHeader />

      {/* Search form */}
      <div className="max-w-6xl mx-auto px-6 sm:px-12 py-12 sm:py-16">
        <Form method="get" className="flex items-center gap-3">
          <div className="flex-1 relative">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="search"
              name="q"
              defaultValue={term}
              placeholder="Search products, articles…"
              autoFocus
              className="w-full h-12 bg-card border border-border rounded-full pl-10 pr-5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-ring/40 font-sans"
            />
          </div>
          <button
            type="submit"
            className="h-12 px-7 bg-foreground text-background text-[10px] uppercase tracking-[0.25em] rounded-full hover:bg-accent transition-colors shrink-0"
          >
            Search
          </button>
        </Form>

        {/* Term + count */}
        {term && (
          <p className="mt-6 text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            {total > 0
              ? `${total} result${total === 1 ? '' : 's'} for "${term}"`
              : `No results for "${term}"`}
          </p>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="max-w-6xl mx-auto px-6 sm:px-12 pb-8">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      {/* Results */}
      {!term ? (
        <EmptyState />
      ) : total === 0 ? (
        <NoResults term={term} />
      ) : (
        <div className="max-w-6xl mx-auto px-6 sm:px-12 pb-24 space-y-16">

          {/* Products */}
          {products.length > 0 && (
            <section>
              <SectionLabel>Products</SectionLabel>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8">
                {products.map((product: any) => {
                  const productUrl = urlWithTrackingParams({
                    baseUrl: `/products/${product.handle}`,
                    trackingParams: product.trackingParameters,
                    term,
                  });
                  const price = product.selectedOrFirstAvailableVariant?.price;
                  const image = product.selectedOrFirstAvailableVariant?.image;
                  return (
                    <Link key={product.id} to={productUrl} prefetch="intent" className="group flex flex-col">
                      <div className="aspect-square bg-muted overflow-hidden mb-3">
                        {image ? (
                          <Image
                            data={image}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
                            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                          />
                        ) : (
                          <div className="w-full h-full" />
                        )}
                      </div>
                      <p className="font-display text-base leading-tight truncate group-hover:text-accent transition-colors">
                        {product.title}
                      </p>
                      {price && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          <Money data={price} />
                        </p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Articles */}
          {articles.length > 0 && (
            <section>
              <SectionLabel>Journal</SectionLabel>
              <div className="divide-y divide-border">
                {articles.map((article: any) => {
                  const articleUrl = urlWithTrackingParams({
                    baseUrl: `/blogs/${article.blog?.handle ?? 'news'}/${article.handle}`,
                    trackingParams: article.trackingParameters,
                    term,
                  });
                  return (
                    <Link
                      key={article.id}
                      to={articleUrl}
                      prefetch="intent"
                      className="flex items-center justify-between py-4 hover:text-accent transition-colors group"
                    >
                      <span className="font-display text-xl">{article.title}</span>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-accent transition-colors shrink-0 ml-4">
                        Read →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Pages */}
          {pages.length > 0 && (
            <section>
              <SectionLabel>Pages</SectionLabel>
              <div className="divide-y divide-border">
                {pages.map((page: any) => {
                  const pageUrl = urlWithTrackingParams({
                    baseUrl: `/pages/${page.handle}`,
                    trackingParams: page.trackingParameters,
                    term,
                  });
                  return (
                    <Link
                      key={page.id}
                      to={pageUrl}
                      prefetch="intent"
                      className="flex items-center justify-between py-4 hover:text-accent transition-colors group"
                    >
                      <span className="font-display text-xl">{page.title}</span>
                      <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-accent transition-colors shrink-0 ml-4">
                        View →
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}

      <Analytics.SearchView data={{searchTerm: term, searchResults: result}} />
    </div>
  );
}

// ── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({children}: {children: React.ReactNode}) {
  return (
    <div className="flex items-center gap-6 mb-8">
      <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground shrink-0">{children}</p>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

// ── Empty state (no query yet) ─────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-12 pb-24">
      <SectionLabel>Browse collections</SectionLabel>
      <p className="text-sm text-muted-foreground mb-8">
        Type something above, or explore by collection:
      </p>
      <CollectionLinks />
    </div>
  );
}

// ── No results ────────────────────────────────────────────────────────────────

function NoResults({term}: {term: string}) {
  return (
    <div className="max-w-6xl mx-auto px-6 sm:px-12 pb-24">
      <div className="py-8 mb-16">
        <p className="font-display text-3xl sm:text-4xl text-muted-foreground/60 italic mb-3">
          Nothing found for "{term}"
        </p>
        <p className="text-sm text-muted-foreground">
          Try a different word, or browse by collection below.
        </p>
      </div>
      <SectionLabel>Explore instead</SectionLabel>
      <CollectionLinks />
    </div>
  );
}

// ── Collection links (shown in no-results + empty state) ─────────────────────

function CollectionLinks() {
  // Static fallback — link to the main collections page and journal
  const links = [
    {label: 'All products', href: '/collections/all'},
    {label: 'Journal', href: '/blogs/news'},
  ];

  return (
    <div className="flex flex-wrap gap-3">
      {links.map((l) => (
        <Link
          key={l.href}
          to={l.href}
          className="px-5 py-2.5 border border-border rounded-full text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:border-accent hover:text-accent transition-colors"
        >
          {l.label}
        </Link>
      ))}
      <Link
        to="/"
        className="px-5 py-2.5 border border-border rounded-full text-[10px] uppercase tracking-[0.25em] text-muted-foreground hover:border-accent hover:text-accent transition-colors"
      >
        Back to canvas
      </Link>
    </div>
  );
}

// ── Search queries (preserved from original) ──────────────────────────────────

const SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment SearchProduct on Product {
    __typename handle id publishedAt title trackingParameters vendor
    selectedOrFirstAvailableVariant(
      selectedOptions: [] ignoreUnknownOptions: true caseInsensitiveMatch: true
    ) {
      id
      image { url altText width height }
      price { amount currencyCode }
      compareAtPrice { amount currencyCode }
      selectedOptions { name value }
      product { handle title }
    }
  }
` as const;

const SEARCH_PAGE_FRAGMENT = `#graphql
  fragment SearchPage on Page { __typename handle id title trackingParameters }
` as const;

const SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment SearchArticle on Article {
    __typename handle id title trackingParameters
    blog { handle }
  }
` as const;

const PAGE_INFO_FRAGMENT = `#graphql
  fragment PageInfoFragment on PageInfo {
    hasNextPage hasPreviousPage startCursor endCursor
  }
` as const;

export const SEARCH_QUERY = `#graphql
  query RegularSearch(
    $country: CountryCode $endCursor: String $first: Int
    $language: LanguageCode $last: Int $term: String! $startCursor: String
  ) @inContext(country: $country, language: $language) {
    articles: search(query: $term, types: [ARTICLE], first: $first) {
      nodes { ...on Article { ...SearchArticle } }
    }
    pages: search(query: $term, types: [PAGE], first: $first) {
      nodes { ...on Page { ...SearchPage } }
    }
    products: search(
      after: $endCursor before: $startCursor first: $first last: $last
      query: $term sortKey: RELEVANCE types: [PRODUCT] unavailableProducts: HIDE
    ) {
      nodes { ...on Product { ...SearchProduct } }
      pageInfo { ...PageInfoFragment }
    }
  }
  ${SEARCH_PRODUCT_FRAGMENT}
  ${SEARCH_PAGE_FRAGMENT}
  ${SEARCH_ARTICLE_FRAGMENT}
  ${PAGE_INFO_FRAGMENT}
` as const;

async function regularSearch({request, context}: Pick<Route.LoaderArgs, 'request' | 'context'>): Promise<RegularSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const variables = getPaginationVariables(request, {pageBy: 12});
  const term = String(url.searchParams.get('q') || '');

  const {errors, ...items}: {errors?: Array<{message: string}>} & RegularSearchQuery =
    await storefront.query(SEARCH_QUERY, {variables: {...variables, term}});

  const total = Object.values(items).reduce(
    (acc: number, {nodes}: {nodes: Array<unknown>}) => acc + nodes.length, 0,
  );

  const error = errors ? errors.map(({message}: {message: string}) => message).join(', ') : undefined;
  return {type: 'regular', term, error, result: {total, items}};
}

// Predictive search — unchanged from original
const PREDICTIVE_SEARCH_ARTICLE_FRAGMENT = `#graphql
  fragment PredictiveArticle on Article {
    __typename id title handle blog { handle }
    image { url altText width height }
    trackingParameters
  }
` as const;
const PREDICTIVE_SEARCH_COLLECTION_FRAGMENT = `#graphql
  fragment PredictiveCollection on Collection {
    __typename id title handle
    image { url altText width height }
    trackingParameters
  }
` as const;
const PREDICTIVE_SEARCH_PAGE_FRAGMENT = `#graphql
  fragment PredictivePage on Page { __typename id title handle trackingParameters }
` as const;
const PREDICTIVE_SEARCH_PRODUCT_FRAGMENT = `#graphql
  fragment PredictiveProduct on Product {
    __typename id title handle trackingParameters
    selectedOrFirstAvailableVariant(selectedOptions: [] ignoreUnknownOptions: true caseInsensitiveMatch: true) {
      id
      image { url altText width height }
      price { amount currencyCode }
    }
  }
` as const;
const PREDICTIVE_SEARCH_QUERY_FRAGMENT = `#graphql
  fragment PredictiveQuery on SearchQuerySuggestion { __typename text styledText trackingParameters }
` as const;
const PREDICTIVE_SEARCH_QUERY = `#graphql
  query PredictiveSearch(
    $country: CountryCode $language: LanguageCode
    $limit: Int! $limitScope: PredictiveSearchLimitScope!
    $term: String! $types: [PredictiveSearchType!]
  ) @inContext(country: $country, language: $language) {
    predictiveSearch(limit: $limit limitScope: $limitScope query: $term types: $types) {
      articles { ...PredictiveArticle }
      collections { ...PredictiveCollection }
      pages { ...PredictivePage }
      products { ...PredictiveProduct }
      queries { ...PredictiveQuery }
    }
  }
  ${PREDICTIVE_SEARCH_ARTICLE_FRAGMENT}
  ${PREDICTIVE_SEARCH_COLLECTION_FRAGMENT}
  ${PREDICTIVE_SEARCH_PAGE_FRAGMENT}
  ${PREDICTIVE_SEARCH_PRODUCT_FRAGMENT}
  ${PREDICTIVE_SEARCH_QUERY_FRAGMENT}
` as const;

import {getEmptyPredictiveSearchResult, type PredictiveSearchReturn} from '~/lib/search';
import type {PredictiveSearchQuery} from 'storefrontapi.generated';

async function predictiveSearch({request, context}: Pick<Route.ActionArgs, 'request' | 'context'>): Promise<PredictiveSearchReturn> {
  const {storefront} = context;
  const url = new URL(request.url);
  const term = String(url.searchParams.get('q') || '').trim();
  const limit = Number(url.searchParams.get('limit') || 10);
  const type = 'predictive';

  if (!term) return {type, term, result: getEmptyPredictiveSearchResult()};

  const {predictiveSearch: items, errors}: PredictiveSearchQuery & {errors?: Array<{message: string}>} =
    await storefront.query(PREDICTIVE_SEARCH_QUERY, {variables: {limit, limitScope: 'EACH', term}});

  if (errors) throw new Error(`Shopify API errors: ${errors.map(({message}: {message: string}) => message).join(', ')}`);
  if (!items) throw new Error('No predictive search data returned from Shopify API');

  const total = Object.values(items).reduce((acc: number, item: Array<unknown>) => acc + item.length, 0);
  return {type, term, result: {items, total}};
}
