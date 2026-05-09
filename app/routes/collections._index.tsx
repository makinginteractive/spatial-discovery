import {useLoaderData, Link} from 'react-router';
import type {Route} from './+types/collections._index';

export const meta: Route.MetaFunction = () => [
  {title: 'Collections — Maison Écho'},
  {name: 'description', content: 'Browse every collection in the field.'},
];

export async function loader({context}: Route.LoaderArgs) {
  const {collections} = await context.storefront.query(COLLECTIONS_QUERY, {
    variables: {first: 24},
  });
  return {collections: collections.nodes};
}

export default function CollectionsIndex() {
  const {collections} = useLoaderData<typeof loader>();

  return (
    <div className="min-h-screen bg-background text-foreground grain overflow-hidden">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 40%, oklch(0.85 0.02 75 / 0.4) 100%)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-6 sm:px-12 h-16">
        <Link
          to="/"
          className="font-display text-xl tracking-tight hover:text-accent transition-colors"
        >
          Maison Écho
        </Link>
        <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
          Collections
        </span>
      </header>

      <main className="relative z-10 px-6 sm:px-12 pt-8 pb-24">
        <div className="mb-16 sm:mb-24">
          <p className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground mb-4">
            The Field
          </p>
          <h1 className="font-display text-6xl sm:text-8xl lg:text-[10rem] leading-[0.88] tracking-tight">
            Every<br />Object.
          </h1>
        </div>

        {collections.length === 0 ? (
          <div className="text-muted-foreground text-sm">
            No collections yet.{' '}
            <Link to="/" className="underline underline-offset-4">
              Browse all products →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border">
            {collections.map((c: {id: string; title: string; handle: string; description: string | null; image: {url: string; altText: string | null} | null}, i: number) => (
              <Link
                key={c.id}
                to={`/collections/${c.handle}`}
                className="group relative bg-background p-8 sm:p-12 flex flex-col justify-between min-h-[260px] hover:bg-secondary/30 transition-colors duration-500"
              >
                <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div>
                  {c.image?.url && (
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-[0.06] transition-opacity duration-700 overflow-hidden">
                      <img src={c.image.url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  {c.description && (
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed max-w-xs opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                      {c.description}
                    </p>
                  )}
                  <div className="flex items-end justify-between">
                    <h2 className="font-display text-4xl sm:text-5xl leading-[0.92] tracking-tight group-hover:text-accent transition-colors duration-300">
                      {c.title}
                    </h2>
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors text-2xl leading-none mb-1">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            ))}

            <Link
              to="/collections/all"
              className="group relative bg-background p-8 sm:p-12 flex flex-col justify-between min-h-[260px] hover:bg-secondary/30 transition-colors duration-500"
            >
              <span className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground">
                {String(collections.length + 1).padStart(2, '0')}
              </span>
              <div className="flex items-end justify-between">
                <h2 className="font-display text-4xl sm:text-5xl leading-[0.92] tracking-tight group-hover:text-accent transition-colors duration-300">
                  All
                </h2>
                <span className="text-muted-foreground group-hover:text-foreground transition-colors text-2xl leading-none mb-1">
                  →
                </span>
              </div>
            </Link>
          </div>
        )}

        <div className="mt-16">
          <Link
            to="/"
            className="text-[10px] uppercase tracking-[0.35em] text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to the field
          </Link>
        </div>
      </main>
    </div>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections($first: Int!) {
    collections(first: $first) {
      nodes {
        id
        title
        handle
        description
        image { url altText }
      }
    }
  }
` as const;
