# Blog Redesign — File Map

## Overview

All new files are prefixed with `ka-` (Kerala Ayurveda) to avoid naming collisions with the existing theme.

---

## Templates (2 files)

| File | Path | Purpose |
|---|---|---|
| `blog.ayurveda.json` | `templates/` | Blog template — assign to blog in Shopify admin |
| `article.ayurveda.json` | `templates/` | Article template — assign to articles in Shopify admin |

---

## Sections (3 files)

| File | Path | Purpose | Used by Template |
|---|---|---|---|
| `main-blog-redesign.liquid` | `sections/` | Blog landing page (hero, care paths, topics, articles, CTA) | `blog.ayurveda.json` |
| `main-blog-topic-redesign.liquid` | `sections/` | Topic/category page (renders when `current_tags` present) | `blog.ayurveda.json` |
| `main-article-redesign.liquid` | `sections/` | Full article page (hero, body, sidebar TOC, all modules) | `article.ayurveda.json` |

---

## Snippets (16 files)

| File | Path | Renders | Called from |
|---|---|---|---|
| `ka-blog-card.liquid` | `snippets/` | Full-bleed image article card | Blog/topic sections |
| `ka-featured-article-card.liquid` | `snippets/` | Two-column featured article | Blog section |
| `ka-topic-card.liquid` | `snippets/` | Topic image card | Blog section |
| `ka-care-path-card.liquid` | `snippets/` | Care path row | Blog section |
| `ka-article-hero.liquid` | `snippets/` | Article hero with metadata | Article section |
| `ka-article-at-a-glance.liquid` | `snippets/` | At-a-glance summary grid | Article section |
| `ka-article-toc.liquid` | `snippets/` | TOC (desktop + mobile) | _(Available but inline in section)_ |
| `ka-product-recommendations.liquid` | `snippets/` | Product grid | Article section |
| `ka-glossary-terms.liquid` | `snippets/` | Glossary grid | Article section |
| `ka-article-sources.liquid` | `snippets/` | Sources list | Article section |
| `ka-article-disclaimer.liquid` | `snippets/` | Health disclaimer | Article section |
| `ka-article-faqs.liquid` | `snippets/` | FAQ accordion | Article section |
| `ka-author-reviewer-card.liquid` | `snippets/` | Author/reviewer card | Article section |
| `ka-related-articles.liquid` | `snippets/` | Related articles grid | Article section |
| `ka-article-comments.liquid` | `snippets/` | Shopify native comments | Article section |
| `ka-consult-cta.liquid` | `snippets/` | Consultation CTA | Blog + topic sections |

---

## Assets (2 files)

| File | Path | Purpose |
|---|---|---|
| `ka-blog-redesign.css` | `assets/` | All scoped styles (`.ka-blog-*` prefix) |
| `ka-blog-redesign.js` | `assets/` | Subnav, TOC, FAQ accordion, read time |

---

## Documentation (6 files)

| File | Path | Purpose |
|---|---|---|
| `current-blog-metafields-and-metaobjects.md` | `docs/` | Current metafield/metaobject audit |
| `new-blog-metafields-and-metaobjects.md` | `docs/` | New data model specification |
| `blog-redesign-implementation-plan.md` | `docs/` | Implementation plan |
| `blog-redesign-file-map.md` | `docs/` | This file |
| `blog-redesign-qa-checklist.md` | `docs/` | QA testing checklist |
| `shopify-admin-setup-checklist.md` | `docs/` | Admin setup guide |

---

## Dependency Graph

```
blog.ayurveda.json
├── main-blog-redesign.liquid
│   ├── ka-blog-redesign.css
│   ├── ka-blog-redesign.js
│   ├── custom-article-font (existing)
│   ├── ka-care-path-card.liquid
│   ├── ka-featured-article-card.liquid
│   ├── ka-topic-card.liquid
│   ├── ka-blog-card.liquid
│   └── ka-consult-cta.liquid
└── main-blog-topic-redesign.liquid
    ├── ka-blog-card.liquid
    └── ka-consult-cta.liquid

article.ayurveda.json
└── main-article-redesign.liquid
    ├── ka-blog-redesign.css
    ├── ka-blog-redesign.js
    ├── custom-article-font (existing)
    ├── ka-article-hero.liquid
    ├── ka-article-at-a-glance.liquid
    ├── ka-product-recommendations.liquid
    │   └── product-card (existing)
    ├── ka-glossary-terms.liquid
    ├── ka-article-sources.liquid
    ├── ka-article-disclaimer.liquid
    ├── ka-article-faqs.liquid
    ├── ka-author-reviewer-card.liquid
    ├── ka-related-articles.liquid
    └── ka-article-comments.liquid
```

---

## Files NOT Modified

The following existing files are **not touched** by this redesign:

- `main-article-modular.liquid` — existing article section (coexists)
- `article-modular-block-content.liquid` — existing block renderer
- `article-modular-layout.css` — existing article CSS
- `article-modular.js` — existing article JS
- All header/footer files — untouched per project requirements
- `product-card` snippet — reused as-is
- `custom-article-font` snippet — reused as-is
