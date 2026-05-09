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
  const tags: string[] = (article as any).tags ?? [];

  const date = new Intl.DateTimeFormat('en-US', {year: 'numeric', month: 'long', day: 'numeric'})
    .format(new Date(article.publishedAt));

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">

      {/* Hero — full bleed with gradient + title overlay */}
      {image ? (
        <div className="relative w-full h-[75vh] min-h-[480px] overflow-hidden">
          <Image
            data={image}
            loading="eager"
            className="absolute inset-0 w-full h-full object-cover"
            sizes="100vw"
          />
          {/* Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/40" />

          {/* Back nav */}
          <Link
            to={`/blogs/${blogHandle}`}
            className="absolute top-5 left-6 sm:left-12 z-10 font-display text-base text-white/80 hover:text-white transition-colors drop-shadow"
          >
            ← Journal
          </Link>
          {author?.name && (
            <span className="absolute top-5 right-6 sm:right-12 z-10 text-[10px] uppercase tracking-[0.3em] text-white/50 drop-shadow hidden sm:inline">
              {author.name}
            </span>
          )}

          {/* Title in hero */}
          <div className="absolute bottom-0 inset-x-0 px-6 sm:px-12 lg:px-20 pb-12 sm:pb-16">
            <div className="max-w-3xl">
              {tags.length > 0 && (
                <span className="inline-block text-[9px] uppercase tracking-[0.45em] text-white/50 mb-4">
                  {tags[0]}
                </span>
              )}
              <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl text-white leading-[0.92] tracking-tight mb-5">
                {title}
              </h1>
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/45">
                <time dateTime={article.publishedAt}>{date}</time>
                {author?.name && <> · {author.name}</>}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* No image — plain header */
        <div className="bg-foreground text-background pt-24 pb-16 px-6 sm:px-12 lg:px-20">
          <Link
            to={`/blogs/${blogHandle}`}
            className="inline-block font-display text-base text-background/70 hover:text-background transition-colors mb-8"
          >
            ← Journal
          </Link>
          {tags.length > 0 && (
            <p className="text-[9px] uppercase tracking-[0.45em] text-background/50 mb-4">{tags[0]}</p>
          )}
          <h1 className="font-display text-5xl sm:text-7xl leading-[0.9] tracking-tight max-w-3xl">
            {title}
          </h1>
          <p className="text-[10px] uppercase tracking-[0.3em] text-background/45 mt-5">
            <time dateTime={article.publishedAt}>{date}</time>
            {author?.name && <> · {author.name}</>}
          </p>
        </div>
      )}

      {/* Reading column */}
      <article className="max-w-2xl mx-auto px-6 sm:px-8 py-14 sm:py-20">

        {/* Body */}
        <div
          className="
            text-[15px] sm:text-base leading-[1.8] text-foreground/85
            [&_p]:mb-5
            [&_h2]:font-display [&_h2]:text-3xl sm:[&_h2]:text-4xl [&_h2]:text-foreground [&_h2]:leading-tight [&_h2]:tracking-tight [&_h2]:mt-14 [&_h2]:mb-5
            [&_h3]:font-display [&_h3]:text-2xl [&_h3]:text-foreground [&_h3]:leading-tight [&_h3]:mt-10 [&_h3]:mb-4
            [&_a]:text-accent [&_a]:underline-offset-4 [&_a]:decoration-accent/40 [&_a:hover]:decoration-accent
            [&_img]:w-full [&_img]:my-10 [&_img]:rounded-sm
            [&_blockquote]:border-l-[3px] [&_blockquote]:border-border [&_blockquote]:pl-6 [&_blockquote]:py-1 [&_blockquote]:my-8 [&_blockquote]:italic [&_blockquote]:text-muted-foreground
            [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-5 [&_ul]:space-y-1
            [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-5 [&_ol]:space-y-1
            [&_strong]:font-semibold [&_strong]:text-foreground
            [&_hr]:my-12 [&_hr]:border-border
          "
          dangerouslySetInnerHTML={{__html: contentHtml}}
        />

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border flex items-center justify-between">
          <Link
            to={`/blogs/${blogHandle}`}
            className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Journal
          </Link>
          {author?.name && (
            <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              {author.name}
            </span>
          )}
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
        handle title contentHtml publishedAt excerpt tags
        author: authorV2 { name }
        image { id altText url width height }
        seo { description title }
      }
    }
  }
` as const;
