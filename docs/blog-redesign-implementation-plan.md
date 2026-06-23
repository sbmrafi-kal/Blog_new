# Blog Redesign — Implementation Plan

## Project Summary

Redesign of the Kerala Ayurveda blog experience, producing Shopify OS 2.0 theme files that render three page types:

1. **Blog landing page** — Editorial hero, care paths, topics grid, featured article, latest articles, consultation CTA
2. **Topic/category page** — Topic hero with metaobject enrichment, filtered article grid
3. **Article page** — Hero, at-a-glance, body, products, glossary, sources, disclaimer, FAQ, author/reviewer, related articles, comments

## Architecture Decisions

### Coexistence
New templates (`blog.ayurveda.json`, `article.ayurveda.json`) sit alongside the existing modular article system. Both are selectable in Shopify admin. No existing files are modified.

### CSS Scoping
All classes use the `ka-blog-` and `ka-article-` prefix to prevent style leakage into the existing theme. The CSS file uses custom properties scoped to `.ka-blog-wrapper`.

### Data Model
Metafields use new keys (`written_by_profile`, `reviewed_by`, `related_articles`) rather than overwriting existing ones (`author_profile`, `reviewer_profile`, `similar_articles`). This prevents breaking the old system during migration.

### Topic Routing
Topics use Shopify's native tag filtering (`/blogs/news/tagged/{tag}`) enriched with `blog_topic` metaobject data. No custom routing or app required.

### Fallback Strategy
Every metafield-driven feature has a graceful fallback:
- Metaobject data → section settings → hardcoded defaults
- `article.author` as author name fallback
- `article.excerpt_or_content` as dek fallback
- `blog.all_tags` as topic card fallback
- Same-tag articles → recent articles as related fallback
- JS-calculated read time when metafield absent

## Files Created

| Category | Count |
|---|---|
| Documentation | 6 |
| Assets (CSS/JS) | 2 |
| Snippets | 16 |
| Sections | 3 |
| Templates | 2 |
| **Total** | **29** |

See `blog-redesign-file-map.md` for the complete dependency graph.

## Data Model

See `new-blog-metafields-and-metaobjects.md` for the full specification:
- 12 blog metafield definitions
- 20 article metafield definitions
- 6 metaobject definitions (blog_topic, care_path, expert_profile, glossary_term, article_source, article_faq)

## Deployment

See `shopify-admin-setup-checklist.md` for step-by-step instructions.

## Testing

See `blog-redesign-qa-checklist.md` for the full QA checklist covering all pages, components, responsive breakpoints, accessibility, performance, SEO, and coexistence.
