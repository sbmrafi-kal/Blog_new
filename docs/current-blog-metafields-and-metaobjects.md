# Current Blog Metafields & Metaobjects Audit

> [!NOTE]
> This document represents the historical audit of the old "Current" modular blog codebase, which was used as a reference to design the new metafields and metaobjects schema. This audit is frozen. For the active, populated data model, please see [new-blog-metafields-and-metaobjects.md](file:///Users/rafi/Documents/Blog_KAL/docs/new-blog-metafields-and-metaobjects.md).
## 1. Summary

### Existing blog/article templates

| Template / File | Type | Purpose |
|---|---|---|
| `main-article-modular.liquid` | Section | Modular article layout engine — renders blocks in a two-column flexbox grid |
| `article-modular-block-content.liquid` | Snippet | Renders individual block types via `{% case block.type %}` |
| `article-modular-layout.css` | Asset (CSS) | Full styling for the modular article system |
| `article-modular.js` | Asset (JS) | TOC generation, Why Trust accordion, empty-element suppression |

> **Note:** No blog listing page template (`main-blog.liquid`) exists in the provided codebase. Only the article page has a modular section.

### Files that control the current article page

- **Section:** `main-article-modular.liquid` — orchestrates blocks, defines schema with 11 block types
- **Snippet:** `article-modular-block-content.liquid` — renders each block's HTML
- **CSS:** `article-modular-layout.css` — all component and layout styles
- **JS:** `article-modular.js` — client-side behaviors

### Assets loaded

| Asset | Loaded by | Method |
|---|---|---|
| `article-modular-layout.css` | `main-article-modular.liquid` line 1 | `{{ 'article-modular-layout.css' \| asset_url \| stylesheet_tag }}` |
| `article-modular.js` | `main-article-modular.liquid` line 3 | `<script src="..." defer></script>` |
| `custom-article-font` | `main-article-modular.liquid` line 2 | `{% render 'custom-article-font' %}` (snippet not in provided files) |

### JS behaviors

1. **TOC generation** — Builds mobile accordion + desktop sidebar TOC from `.prose h2-h6` headings
2. **Why Trust Us accordion** — Toggle with slide animation and `aria-expanded`
3. **Empty paragraph suppression** — Hides `&nbsp;` and lone `<br>` paragraphs
4. **Empty inline element suppression** — Hides empty headings, paragraphs, spans
5. **Body class** — Adds `is-article-page` to `document.body`

### Snippets/components reused

| Snippet reference | Used in | Purpose |
|---|---|---|
| `article-modular-block-content` | `main-article-modular.liquid` | Block content renderer |
| `custom-article-font` | `main-article-modular.liquid` | Font face declarations |
| `product-card` | `article-modular-block-content.liquid` (product_callout) | Existing product card component |
| `share-link` | `article-modular-block-content.liquid` (hero/title blocks) | Share URL generator |
| `icon` | `article-modular-block-content.liquid` (share icons) | SVG icon renderer |

---

## 2. Current Metafields Table

| Owner | Namespace | Key | Full Liquid Reference | Type (inferred) | Where Used | Purpose | Fallback | Required? | Notes |
|---|---|---|---|---|---|---|---|---|---|
| Article | custom | author_profile | `article.metafields.custom.author_profile.value` | metaobject_reference | `article-modular-block-content.liquid` L446 (author_card block) | Links to author metaobject with name, qualifications, degree, description, image, profile_link, designation | `article.author` for name; auto-generated `/pages/blog-author-{handle}` for link; placeholder SVG for image | No | Author link fallback to auto-generated URL may create broken links if page doesn't exist |
| Article | custom | reviewer_profile | `article.metafields.custom.reviewer_profile.value` | metaobject_reference | `article-modular-block-content.liquid` L447 (author_card block) | Links to reviewer metaobject with same fields as author | `#` for link (creates dead link); placeholder SVG for image | No | Reviewer link defaults to `#` which is a UX issue |
| Article | custom | similar_articles | `article.metafields.custom.similar_articles.value` | list.article_reference | `article-modular-block-content.liquid` L576 (similar_articles block) | List of related articles, rendered in a grid (limit 5) | Entire block hidden if metafield is blank | No | Block only renders when metafield has values |

---

## 3. Current Metaobjects Table

Based on the field access patterns in `article-modular-block-content.liquid`, the author/reviewer profile metaobject has these fields:

| Metaobject Type (inferred) | Field Key | Field Name (inferred) | Type (inferred) | Where Used | Purpose | Notes |
|---|---|---|---|---|---|---|
| Author/Reviewer Profile | `name` | Name | single_line_text_field | L449, L462 | Person's full name | Fallback to `article.author` for author only |
| Author/Reviewer Profile | `qualifications` | Qualifications | single_line_text_field | L450, L463 | Qualifications text (e.g., "12+ years") | Rendered inline with name |
| Author/Reviewer Profile | `degree` | Degree | single_line_text_field | L451, L464 | Degree (e.g., "BAMS, MD Ayurveda") | Rendered with `.font-avenir-heavy` class |
| Author/Reviewer Profile | `description` | Description | multi_line_text_field or rich_text_field | L452, L465 | Bio/description text | Rendered directly, may contain HTML |
| Author/Reviewer Profile | `image` | Image | file_reference (image) | L453, L466 | Profile photo | Fallback to placeholder SVG |
| Author/Reviewer Profile | `profile_link` | Profile Link | url | L455–L459, L467 | URL to full profile page | Author fallback: auto-generated `/pages/blog-author-{handle}`; Reviewer fallback: `#` |
| Author/Reviewer Profile | `designation` | Designation | single_line_text_field | L488–L490, L519–L521 | Job title (e.g., "Ayurvedic Doctor") | Inline-styled with hard-coded CSS on author side |

> **Note:** The exact metaobject type handle is not visible in the code. It is likely `author_profile` or similar, defined in Shopify admin.

---

## 4. Current Code References

### `main-article-modular.liquid`

| Line(s) | Reference | Notes |
|---|---|---|
| 1 | `article-modular-layout.css` | CSS asset |
| 2 | `custom-article-font` snippet | Font loading |
| 3 | `article-modular.js` | JS asset |
| 9, 31, 63 | `article-modular-block-content` snippet | Block rendering (3 calls: hero wrapper, left column, right column) |
| 560 | `product-card` snippet | Referenced via product_callout block schema (product type setting) |

### `article-modular-block-content.liquid`

| Line(s) | Reference | Type |
|---|---|---|
| 8 | `article.tags`, `article.tags.first` | Native Shopify |
| 11, 196 | `article.title` | Native Shopify |
| 14, 199 | `article.excerpt_or_content` | Native Shopify |
| 19, 204 | `article.updated_at` | Native Shopify (used as "Last Modified Date") |
| 27, 212 | `article.published_at` | Native Shopify |
| 36–47, 221–232 | `share-link` snippet, `icon` snippet | Share functionality |
| 125, 134, 143, 152 | `image_url`, `image_tag` filters | Modern Shopify image API |
| 173 | `article.image` | Native Shopify |
| 446 | `article.metafields.custom.author_profile.value` | **Metafield** |
| 447 | `article.metafields.custom.reviewer_profile.value` | **Metafield** |
| 449–467 | Metaobject field access (`.name`, `.qualifications`, `.degree`, `.description`, `.image`, `.profile_link`, `.designation`) | **Metaobject fields** |
| 560 | `{% render 'product-card', product: callout_product, is_alternative: true %}` | Product card snippet |
| 576 | `article.metafields.custom.similar_articles.value` | **Metafield** |
| 586 | `similar_article.image`, `similar_article.url`, `similar_article.title` | Native article object fields |

### `article-modular-layout.css`

| Section | Brand tokens used |
|---|---|
| Lines 11–23 | CSS custom properties: `--font-amstir-regular`, `--font-avenir-roman`, `--font-avenir-medium`, `--font-avenir-heavy`, `--font-avenir-black`, `--font-avenir-light`, `--font-figtree` |
| Lines 252, 284, 290 | Brand green `#1e4b3c` for Why Trust section |
| Lines 435, 447, 531 | Brand green `#1e4b3c` for stats, share icons |
| Line 137 | Background `#FDFFFB` |
| Lines 578–582 | Callout box: `#f6f7f2` bg, `#b8d29b` border |
| Lines 652, 669 | Text color `#383938` |

### `article-modular.js`

| Line(s) | Reference | Notes |
|---|---|---|
| 18 | `document.body.classList.add('is-article-page')` | Global body class modification |
| 88 | `.prose h2, .prose h3, .prose h4, .prose h5, .prose h6` | TOC heading selector (too broad) |
| 89–92 | `getElementById` for `mobile-toc-accordion`, `mobile-toc-list`, `desktop-toc`, `desktop-toc-list` | Duplicate ID risk if both hero and title blocks exist |
| 112 | `heading.id = 'toc-heading-${index}'` | Overwrites existing heading IDs |

---

## 5. Risk Notes

### Empty fields that currently break layout
- **Reviewer link defaults to `#`** — Creates a clickable card linking nowhere (L467)
- **Author link auto-generated** — `/pages/blog-author-{handle}` may link to a non-existent page (L458–L459)
- **Author designation inline-styled** — Hard-coded CSS in Liquid (L489) instead of using class

### Duplicate rendering paths
- **Dual H1 risk** — Both `article_hero` (L11) and `title` (L196) blocks render `<h1>`, creating duplicate H1 if both are added
- **Duplicate mobile TOC IDs** — Both blocks output `id="mobile-toc-accordion"`, `id="mobile-toc-content"`, `id="mobile-toc-list"`
- **Duplicate share/date sections** — Both blocks render identical date + share markup

### Hardcoded values that should become metafields
- `article.updated_at` used as "Last Modified Date" — should be `article.metafields.custom.last_reviewed_at`
- "Why trust Kerala Ayurveda?" — hard-coded heading
- "Key Takeaways:" — hard-coded heading
- "Similar articles" — hard-coded heading
- "Table of content" / "Table of Contents" — inconsistent hard-coded text
- "WRITTEN BY" / "REVIEWED BY" — hard-coded section headings (though configurable via block settings)
- "Read more" — hard-coded CTA text

### Existing fields that can be reused for the new design
- `article.metafields.custom.author_profile` → Maps to new `written_by_profile` (expert_profile metaobject)
- `article.metafields.custom.reviewer_profile` → Maps to new `reviewed_by` (expert_profile metaobject)
- `article.metafields.custom.similar_articles` → Maps to new `related_articles`
- All metaobject profile fields (name, qualifications, degree, description, image, profile_link, designation) → Map to new `expert_profile` metaobject

### Existing fields that should be deprecated
- None need immediate deprecation, but the author/reviewer profile metaobject should be **consolidated** into a single `expert_profile` metaobject type with additional fields (role_label, short_bio, full_bio, signature_text)

### Current article data that should NOT be changed
- `article.title` — Primary H1 and SEO title
- `article.image` — Hero image fallback
- `article.excerpt_or_content` — Summary/dek fallback
- `article.author` — Author name fallback
- `article.published_at` — Publication date
- `article.content` — Full article body
- `article.tags` — Category/topic assignment
- `article.url` — SEO URL (must be preserved)
- `blog.url` — Blog URL pattern
- `blog.handle` — Blog handle for routing
