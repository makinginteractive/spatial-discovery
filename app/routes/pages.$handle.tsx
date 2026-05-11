import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/pages.$handle';
import {redirectIfHandleIsLocalized} from '~/lib/redirect';
import {SiteHeader} from '~/components/SiteHeader';

export const meta: Route.MetaFunction = ({data}) => [
  {title: `${data?.page.title ?? 'Page'} — P3XIV`},
  {name: 'description', content: data?.page.seo?.description ?? ''},
];

async function loadCriticalData({context, request, params}: Route.LoaderArgs) {
  if (!params.handle) throw new Error('Missing page handle');
  const [{page}] = await Promise.all([
    context.storefront.query(PAGE_QUERY, {variables: {handle: params.handle}}),
  ]);
  if (!page) throw new Response('Not Found', {status: 404});
  redirectIfHandleIsLocalized(request, {handle: params.handle, data: page});
  return {page};
}

function loadDeferredData(_args: Route.LoaderArgs) { return {}; }

export async function loader(args: Route.LoaderArgs) {
  return {...loadDeferredData(args), ...await loadCriticalData(args)};
}

export default function Page() {
  const {page} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pt-16">
      <SiteHeader />

      <main className="max-w-2xl mx-auto px-6 sm:px-12 py-16 sm:py-24">
        <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-6">
          {page.title}
        </p>
        <div
          className="prose prose-sm max-w-none text-foreground leading-relaxed [&_h1]:font-display [&_h1]:text-4xl [&_h2]:font-display [&_h2]:text-2xl [&_a]:text-accent [&_a]:underline-offset-4 [&_p]:mb-4 [&_p]:text-muted-foreground"
          dangerouslySetInnerHTML={{__html: page.body}}
        />
      </main>
    </div>
  );
}

const PAGE_QUERY = `#graphql
  query Page($language: LanguageCode, $country: CountryCode, $handle: String!)
  @inContext(language: $language, country: $country) {
    page(handle: $handle) {
      handle id title body
      seo { description title }
    }
  }
` as const;
