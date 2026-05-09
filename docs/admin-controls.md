# Admin Controls — Maison Écho

Everything here is managed from **Shopify Admin** — no code changes needed.

---

## Navigation

**Online Store → Navigation**

| Menu handle | Where it appears |
|---|---|
| `main-menu` | Top nav links on the home page |

- Add/remove/reorder links freely
- Items with type `FRONTPAGE` are automatically hidden from the nav
- "Journal" should point to `/blogs/news` (or whatever your blog handle is)
- "Contact" → `/pages/contact`, "About" → `/pages/about`

---

## Cart — Promoted Products

**Products → Collections → create collection with handle `cart-promo`**

- Products in this collection appear as **"You might also like"** inside the cart drawer
- Shows up to **4 products**, in collection sort order
- If the collection doesn't exist or has no products, a brand quote shows instead
- Swap products in/out anytime — no deploy needed

---

## Blog / Journal

**Content → Blog posts → select blog "News"** (or rename to "Journal")

- Articles publish to `/blogs/news/[article-handle]`
- The **first article** (newest) automatically becomes the featured hero on the listing page — give it a strong image
- Article images become the full-width hero on the article reading page
- `Author`, `Tags`, and `Excerpt` fields all display — fill them in

> **Tip:** Tag an article `featured` in the future to pin it to the top (planned).

---

## Pages

**Content → Pages**

| Page handle | Route |
|---|---|
| `contact` | `/pages/contact` |
| `about` | `/pages/about` |
| anything else | `/pages/[handle]` |

- Page body supports rich text from the admin editor
- Page title becomes the small label at the top

---

## Products

**Products → all products**

- **Product type** — drives the collection filter pills on the canvas (e.g. "Ceramics", "Textiles")
- **Tags** — used for search matching in the canvas
- **Featured image** — becomes the tile in the canvas and the product overlay hero

---

## Metafields (planned — no code yet)

These will be added as site gets built out:

| Namespace + key | What it controls |
|---|---|
| `site.tagline` | Subtitle under "Maison Écho" in the header |
| `site.featured_quote` | Pull quote displayed in cart or canvas |
| `site.homepage_collection` | Collection to prioritize in canvas on load |
| `article.featured` | Pin an article to top of journal listing |

---

## Deploy triggers

Some changes require a **redeploy** to take effect (they're baked into server-rendered HTML):

| Change | Needs redeploy? |
|---|---|
| Add/remove nav link | ✅ Yes (menu is server-fetched) |
| Add product to `cart-promo` | ❌ No (fetched per request) |
| Publish a new article | ❌ No |
| Edit a page body | ❌ No |
| Add a new environment variable | ✅ Yes |

---

*Last updated: 2026-05-09*
