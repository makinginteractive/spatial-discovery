import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/blogs.$blogHandle.$articleHandle';
import {Image} from '@shopify/hydrogen';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.article.title ?? 'Article'} — Maison Écho`},
  {name: 'description', content: data?.article.seo?.description ?? ''},
];

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  const {blogHandle, articleHandle} = params;
  if (!articleHandle || !blogHandle) throw new Response('Not found', {status: 404});
  const [{blog}] = await Promise.all([
    context.storefront.query(ARTICLE_QUERY, {variables: {blogHandle, articleHandle}}),
  ]);
  if (!blog?.articleByHandle) throw new Response(null, {status: 404});
  redirectIfHandleIsLocalized(request, {handle: articleHandle, data: blog.articleByHandle}, {handle: blogHandle, data: blog});
  return {article: blog.articleByHandle, blogHandle};
}

function loadDeferredData(_args: Route.LoaderArgs) { return {}; }

export async function loader(args: Route.LoaderArgs) {
  return {...loadDeferredData(args), ...await loadCriticalData(args)};
}

export default function Article() {
  const {article, blogHandle} = useLoaderData<typeof loader>();
  const {title, image, contentHtml, author} = article;

  const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
    .format(new Date(article.publishedAt));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 sm:px-12 h-16 border-b border-border">
        <Link
          to={`/blogs/${blogHandle}`}
          className="font-display text-lg tracking-tight hover:text-accent transition-colors"
        >
          ← Journal
        </Link>
        {author?.name && (
          <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground hidden sm:inline">
            {author.name}
          </span>
        )}
      </header>

      <article className="max-w-2xl mx-auto px-6 sm:px-12 py-16 sm:py-24">
        {/* Meta */}
        <div className="mb-10">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">
            <time dateTime={article.publishedAt}>{date}</time>
            {author?.name && <> · {author.name}</>}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl leading-[0.9] tracking-tight">
            {title}
          </h1>
        </div>

        {/* Hero image */}
        {image && (
          <div className="mb-12 -mx-6 sm:-mx-12 overflow-hidden">
            <Image
              data={image}
              loading="eager"
              className="w-full aspect-[16/9] object-cover"
              sizes="(min-width: 768px) 800px, 100vw"
            />
          </div>
        )}

        {/* Body */}
        <div
          className="text-sm sm:text-base leading-relaxed text-muted-foreground space-y-5 [&_h2]:font-display [&_h2]:text-3xl [&_h2]:text-foreground [&_h2]:mt-12 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:text-xl [&_h3]:text-foreground [&_h3]:mt-8 [&_a]:text-accent [&_a]:underline-offset-4 [&_img]:w-full [&_img]:my-8 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-6 [&_blockquote]:italic"
          dangerouslySetInnerHTML={{__html: contentHtml}}
        />

        {/* Footer nav */}
        <div className="mt-16 pt-8 border-t border-border">
          <Link
            to={`/blogs/${blogHandle}`}
            className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Journal
          </Link>
        </div>
      </article>
    </div>
  );
}

const ARTICLE_QUERY = `#graphql
  query Article(
    $articleHandle: String!
    $blogHandle: String!
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(language: $language, country: $country) {
    blog(handle: $blogHandle) {
      handle
      articleByHandle(handle: $articleHandle) {
        handle title contentHtml publishedAt
        author: authorV2 { name }
        image { id altText url width height }
        seo { description title }
      }
    }
  }
` as const;
