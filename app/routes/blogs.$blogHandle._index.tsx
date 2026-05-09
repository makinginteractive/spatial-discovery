import {Link, useLoaderData} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle._index';
import {Image, getPaginationVariables} from '@shopify/hydrogen';
import type {ArticleItemFragment} from 'storefrontapi.generated';
import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.blog.title ?? 'Journal'} — Maison Écho`},
  {name: 'description', content: `Dispatches from the field — ${data?.blog.title}`},
];

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const paginationVariables = getPaginationVariables(request, {pageBy: 9});
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
  const {articles} = blog;

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 sm:px-12 h-16 border-b border-border">
        <Link to="/" className="font-display text-lg tracking-tight hover:text-accent transition-colors">
          ← Maison Écho
        </Link>
        <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">
          {blog.title}
        </span>
      </header>

      <main className="max-w-6xl mx-auto px-6 sm:px-12 py-16 sm:py-24">
        <div className="mb-16 sm:mb-20">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">Journal</p>
          <h1 className="font-display text-6xl sm:text-8xl leading-[0.88] tracking-tight">
            {blog.title}
          </h1>
        </div>

        <PaginatedResourceSection<ArticleItemFragment> connection={articles}>
          {({node: article, index}) => (
            <ArticleItem article={article} key={article.id} loading={index < 3 ? 'eager' : 'lazy'} />
          )}
        </PaginatedResourceSection>
      </main>
    </div>
  );
}

function ArticleItem({article, loading}: {article: ArticleItemFragment; loading?: HTMLImageElement['loading']}) {
  const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
    .format(new Date(article.publishedAt!));

  return (
    <Link
      to={`/blogs/${article.blog.handle}/${article.handle}`}
      className="group grid sm:grid-cols-2 gap-6 py-10 border-t border-border hover:bg-secondary/20 transition-colors duration-300 -mx-6 px-6 sm:-mx-12 sm:px-12"
    >
      {article.image && (
        <div className="overflow-hidden bg-muted aspect-[3/2] sm:aspect-auto sm:h-48">
          <Image
            alt={article.image.altText || article.title}
            data={article.image}
            loading={loading}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
            sizes="(min-width: 768px) 50vw, 100vw"
          />
        </div>
      )}
      <div className="flex flex-col justify-center">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-3">
          {date}
          {article.author?.name && <> · {article.author.name}</>}
        </p>
        <h2 className="font-display text-3xl sm:text-4xl leading-tight tracking-tight mb-4 group-hover:text-accent transition-colors duration-300">
          {article.title}
        </h2>
        <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground group-hover:text-foreground transition-colors">
          Read →
        </span>
      </div>
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
    contentHtml handle id
    image { id altText url width height }
    publishedAt title
    blog { handle }
  }
` as const;
