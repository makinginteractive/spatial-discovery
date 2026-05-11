import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SiteHeader} from '~/components/SiteHeader';
import {NavPill} from '~/components/NavPill';
import {PolicyBar} from '~/components/PolicyBar';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.blog.title ?? 'Blog'} — P3XIV`},
  {name: 'description', content: `Objects for the purposeful life — ${data?.blog.title}`},
];

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 10});
  if (!params.blogHandle) throw new Response('Not found', {status: 404});
  const [{blog}] = await Promise.all([
    context.storefront.query(BLOGS_QUERY, {
      variables: {blogHandle: params.blogHandle, ...paginationVariables},
    }),
  ]);
  if (!blog?.articles) throw new Response('Not found', {status: 404});
  redirectIfHandleIsLocalized(request, {handle: params.blogHandle, data: blog});
  return {blog};
}

function loadDeferredData(_args: Route.LoaderArgs) { return {}; }

export async function loader(args: Route.LoaderArgs) {
  return {...loadDeferredData(args), ...await loadCriticalData(args)};
}

export default function Blog() {
  const {blog} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen pb-28 bg-background text-foreground font-sans">

      <SiteHeader />

      {/* Featured hero — newest article, full bleed */}
      <PaginatedResourceSection<ArticleItemFragment> connection={blog.articles}>
        {({node: article, index}) => {
          if (index === 0) return <FeaturedArticle key={article.id} article={article} />;

          // All remaining articles go into the grid rendered below — return null here
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
            if (index === 0) return null; // already shown in hero
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
      <PolicyBar />
    </div>
  );
}

// ── Featured hero ─────────────────────────────────────────────────────────────

function FeaturedArticle({article}: {article: ArticleItemFragment}) {
  const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
    .format(new Date(article.publishedAt!));
  const tags: string[] = (article as any).tags ?? [];

  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="relative block w-full h-[85vh] min-h-[520px] overflow-hidden group"
    >
      {article.image ? (
        <Image
          data={article.image}
          loading="eager"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.025]"
          sizes="100vw"
        />
      ) : (
        <div className="absolute inset-0 bg-muted" />
      )}

      {/* Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35" />

      {/* Content */}
      <div className="absolute bottom-0 inset-x-0 px-6 sm:px-12 lg:px-20 pb-14 sm:pb-20">
        <div className="max-w-3xl">
          {tags.length > 0 && (
            <span className="inline-block text-[9px] uppercase tracking-[0.45em] text-white/55 mb-4">
              {tags[0]}
            </span>
          )}
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white leading-[0.92] tracking-tight mb-5">
            {article.title}
          </h1>
          {(article as any).excerpt && (
            <p className="text-white/65 text-sm sm:text-base leading-relaxed max-w-xl mb-6 line-clamp-2">
              {(article as any).excerpt}
            </p>
          )}
          <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-white/45">
            <time dateTime={article.publishedAt!}>{date}</time>
            {article.author?.name && (
              <><span>·</span><span>{article.author.name}</span></>
            )}
            <span className="ml-auto text-white/65 group-hover:text-white transition-colors duration-300">
              Read →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ── Article grid card ─────────────────────────────────────────────────────────

function ArticleCard({
  article,
  loading,
}: {
  article: ArticleItemFragment;
  loading?: HTMLImageElement['loading'];
}) {
  const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
    .format(new Date(article.publishedAt!));

  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="group flex flex-col"
    >
      {/* Image */}
      <div className="overflow-hidden bg-muted aspect-[4/3] mb-5">
        {article.image ? (
          <Image
            alt={article.image.altText || article.title}
            data={article.image}
            loading={loading}
            className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-700"
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        ) : (
          <div className="w-full h-full" />
        )}
      </div>

      {/* Tags */}
      {((article as any).tags ?? []).length > 0 && (
        <span className="text-[9px] uppercase tracking-[0.4em] text-accent mb-2">
          {(article as any).tags[0]}
        </span>
      )}

      {/* Meta */}
      <p className="text-[9px] uppercase tracking-[0.3em] text-muted-foreground mb-2.5">
        <time dateTime={article.publishedAt!}>{date}</time>
        {article.author?.name && <> · {article.author.name}</>}
      </p>

      {/* Title */}
      <h2 className="font-display text-2xl sm:text-3xl leading-tight tracking-tight mb-3 group-hover:text-accent transition-colors duration-300">
        {article.title}
      </h2>

      {/* Excerpt */}
      {(article as any).excerpt && (
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
          {(article as any).excerpt}
        </p>
      )}

      <span className="mt-auto text-[9px] uppercase tracking-[0.3em] text-muted-foreground group-hover:text-foreground transition-colors">
        Read →
      </span>
    </Link>
  );
}

const BLOGS_QUERY = `#graphql
  query Blog(
    $language: LanguageCode
    $blogHandle: String!
    $first: Int
    $last: Int
    $startCursor: String
    $endCursor: String
  ) @inContext(language: $language) {
    blog(handle: $blogHandle) {
      title handle
      seo { title description }
      articles(first: $first, last: $last, before: $startCursor, after: $endCursor) {
        nodes { ...ArticleItem }
        pageInfo {
          hasPreviousPage hasNextPage endCursor startCursor
        }
      }
    }
  }
  fragment ArticleItem on Article {
    author: authorV2 { name }
    contentHtml excerpt handle id tags
    image { id altText url width height }
    publishedAt title
    blog { handle }
  }
` as const;
