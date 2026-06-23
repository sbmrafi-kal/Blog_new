# Shopify Admin Setup Checklist

## Overview

This document provides step-by-step instructions for configuring the Shopify admin to support the redesigned Kerala Ayurveda blog. Complete these steps **before** deploying the theme files.

---

## Step 1: Create Metaobject Definitions

Navigate to **Settings → Custom data → Metaobject definitions** and create the following 6 metaobject types.

### 1.1 `blog_topic`

| Field Label | Key | Type | Required |
|---|---|---|---|
| Title | title | Single line text | ✅ |
| Handle | handle | Single line text | ✅ |
| Short label | short_label | Single line text | |
| Hindi/Sanskrit label | secondary_label | Single line text | |
| Description | description | Multi-line text | |
| Image | image | File (image) | |
| Icon | icon | File (image) | |
| Article filter tag | article_filter_tag | Single line text | |
| CTA label | cta_label | Single line text | |
| Sort order | sort_order | Integer | |
| Accent color | accent_color | Color | |
| SEO title | seo_title | Single line text | |
| SEO description | seo_description | Multi-line text | |

**Initial entries to create:**
1. Digestion & Gut Health (tag: `digestion`)
2. Herbs & Formulations (tag: `herbs`)
3. Skin & Hair (tag: `skin-hair`)
4. Sleep & Stress (tag: `sleep-stress`)
5. Immunity & Detox (tag: `immunity`)
6. Pain & Joints (tag: `joints`)
7. Women's Health (tag: `womens-health`)
8. Doshas & Constitution (tag: `doshas`)

### 1.2 `care_path`

| Field Label | Key | Type | Required |
|---|---|---|---|
| Title | title | Single line text | ✅ |
| Subtitle | subtitle | Multi-line text | |
| Image | image | File (image) | |
| Linked topic | linked_topic | Metaobject reference (blog_topic) | |
| Link URL | link_url | URL | |
| CTA label | cta_label | Single line text | |
| Sort order | sort_order | Integer | |

### 1.3 `expert_profile`

| Field Label | Key | Type | Required |
|---|---|---|---|
| Name | name | Single line text | ✅ |
| Photo | photo | File (image) | |
| Role label | role_label | Single line text | |
| Designation | designation | Single line text | |
| Degree | degree | Single line text | |
| Qualifications | qualifications | Single line text | |
| Short bio | short_bio | Multi-line text | |
| Full bio | full_bio | Rich text | |
| Profile URL | profile_url | URL | |
| Signature text | signature_text | Single line text | |

**Important:** If you already have an author/reviewer metaobject, you can either:
- **Option A:** Rename/extend the existing metaobject with the new fields (role_label, short_bio, full_bio, signature_text) — migration-friendly
- **Option B:** Create `expert_profile` as new and migrate data — cleaner but requires updating existing article metafields

### 1.4 `glossary_term`

| Field Label | Key | Type | Required |
|---|---|---|---|
| Term | term | Single line text | ✅ |
| Sanskrit/Hindi term | secondary_term | Single line text | |
| Pronunciation | pronunciation | Single line text | |
| Short definition | short_definition | Multi-line text | ✅ |
| Long definition | long_definition | Rich text | |
| Related topic | related_topic | Metaobject reference (blog_topic) | |

### 1.5 `article_source`

| Field Label | Key | Type | Required |
|---|---|---|---|
| Source title | title | Single line text | ✅ |
| Publisher | publisher | Single line text | |
| Author | author | Single line text | |
| URL | url | URL | |
| Published date | published_date | Date | |
| Accessed date | accessed_date | Date | |
| Note | note | Multi-line text | |

### 1.6 `article_faq`

| Field Label | Key | Type | Required |
|---|---|---|---|
| Question | question | Single line text | ✅ |
| Answer | answer | Rich text | ✅ |
| Sort order | sort_order | Integer | |

---

## Step 2: Create Blog Metafield Definitions

Navigate to **Settings → Custom data → Blogs** and add:

| Label | Namespace & key | Type | Notes |
|---|---|---|---|
| Hero eyebrow | `custom.hero_eyebrow` | Single line text | |
| Hero title | `custom.hero_title` | Single line text | |
| Hero subtitle | `custom.hero_subtitle` | Multi-line text | |
| Hero image | `custom.hero_image` | File (image) | |
| Featured article | `custom.featured_article` | Article reference | |
| Secondary featured | `custom.secondary_featured_articles` | List of article references | |
| Topics | `custom.topics` | List of metaobject references (blog_topic) | |
| Care paths | `custom.care_paths` | List of metaobject references (care_path) | |
| Consult CTA title | `custom.consult_cta_title` | Single line text | |
| Consult CTA text | `custom.consult_cta_text` | Multi-line text | |
| Consult CTA button | `custom.consult_cta_button_label` | Single line text | |
| Consult CTA URL | `custom.consult_cta_url` | URL | |

---

## Step 3: Create Article Metafield Definitions

Navigate to **Settings → Custom data → Articles** and add:

| Label | Namespace & key | Type | Notes |
|---|---|---|---|
| Topic | `custom.topic` | Metaobject reference (blog_topic) | |
| Category label | `custom.category_label` | Single line text | |
| Short summary (dek) | `custom.dek` | Multi-line text | |
| Read time | `custom.read_time_minutes` | Integer | |
| Last reviewed | `custom.last_reviewed_at` | Date | |
| Reviewed by | `custom.reviewed_by` | Metaobject reference (expert_profile) | Replaces `custom.reviewer_profile` |
| Written by | `custom.written_by_profile` | Metaobject reference (expert_profile) | Replaces `custom.author_profile` |
| Hero image | `custom.hero_image` | File (image) | |
| Hero caption | `custom.hero_image_caption` | Single line text | |
| At a glance | `custom.at_a_glance` | List of single line text | |
| Products | `custom.recommended_products` | List of product references | |
| Products heading | `custom.recommended_products_heading` | Single line text | |
| Products description | `custom.recommended_products_description` | Multi-line text | |
| Glossary | `custom.glossary_terms` | List of metaobject references (glossary_term) | |
| Sources | `custom.sources` | List of metaobject references (article_source) | |
| FAQs | `custom.faqs` | List of metaobject references (article_faq) | |
| Related articles | `custom.related_articles` | List of article references | Replaces `custom.similar_articles` |
| Disclaimer | `custom.disclaimer` | Multi-line text | |
| Show comments | `custom.show_comments` | True/false | |
| Comments heading | `custom.comments_heading` | Single line text | |

**Note on existing metafields:** The existing `custom.author_profile`, `custom.reviewer_profile`, and `custom.similar_articles` continue to work with the old article template. The new template uses different keys (`written_by_profile`, `reviewed_by`, `related_articles`). This avoids breaking the existing modular article system.

---

## Step 4: Pin Important Fields

In the article metafield admin, pin these fields so they appear prominently:

1. `custom.topic`
2. `custom.dek`
3. `custom.read_time_minutes`
4. `custom.written_by_profile`
5. `custom.reviewed_by`
6. `custom.at_a_glance`
7. `custom.recommended_products`
8. `custom.faqs`
9. `custom.related_articles`

---

## Step 5: Deploy Theme Files

1. Upload all files from `assets/`, `snippets/`, `sections/`, `templates/` to the Shopify theme
2. Verify `custom-article-font` and `product-card` snippets exist in the theme

---

## Step 6: Assign Templates

### Blog template
1. Go to **Online Store → Blog posts → Manage blogs**
2. Select your blog (e.g., "News")
3. Set template to `blog.ayurveda`

### Article template
1. Go to **Online Store → Blog posts**
2. Open a test article
3. Under "Theme template", select `article.ayurveda`
4. Save and preview

---

## Step 7: Populate Test Content

### Blog level
1. Open blog settings
2. Set `featured_article` to your best article
3. Add `topics` entries (select blog_topic metaobjects)
4. Add `care_paths` entries (or rely on section blocks)

### Article level (test 1 article)
1. Set `topic` to a blog_topic entry
2. Write a `dek` (1-2 sentence summary)
3. Set `read_time_minutes`
4. Set `written_by_profile` to an expert_profile
5. Add 3-4 `at_a_glance` items (format: "Label: Description")
6. Add 2-3 `faqs`
7. Add 3-4 `glossary_terms`
8. Add `recommended_products`
9. Add `related_articles`

---

## Step 8: Enable Comments (optional)

1. Go to **Settings → Blog posts → Manage blogs**
2. Select your blog
3. Under "Comments", choose "Comments are allowed, pending moderation" or "Comments are allowed"
4. Save

---

## Step 9: Verify

1. Visit the blog landing page
2. Visit a tagged topic page
3. Visit the test article
4. Check responsive behavior on mobile
5. Run through `blog-redesign-qa-checklist.md`
