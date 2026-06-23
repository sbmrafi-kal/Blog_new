# New Blog Metafields & Metaobjects — Recommended Data Model

## 1. Overview

The redesigned Kerala Ayurveda blog experience requires the following data layer:

- **Blog-level editorial landing page fields** — Hero content, featured article, topics, care paths, consultation CTA
- **Topic/category metaobjects** (`blog_topic`) — Enriched topic data for category pages
- **Care path metaobjects** (`care_path`) — Concern-led entry points
- **Article-level editorial fields** — Dek, read time, reviewed date, at-a-glance, products, glossary, sources, FAQs, comments
- **Author/reviewer profile metaobjects** (`expert_profile`) — Unified profile for authors and reviewers
- **FAQ metaobjects** (`article_faq`) — Question/answer pairs
- **Glossary term metaobjects** (`glossary_term`) — Ayurveda vocabulary
- **Source/reference metaobjects** (`article_source`) — Citations and references
- **Related articles and related products fields** — Cross-linking
- **Comments support** — Through Shopify native blog comments

---

## 2. New Blog Metafields

**Recommended owner: Blog**

| Field Label | Namespace | Key | Type | Required? | Default/Example Value | Used in Section | Notes |
|---|---|---|---|---|---|---|---|
| Blog hero eyebrow | custom | hero_eyebrow | single_line_text_field | No | AYURVEDA LIBRARY | Blog hero | Uppercase label above title |
| Blog hero title | custom | hero_title | single_line_text_field | No | Kerala Ayurveda Wellness Journal | Blog hero | Main H1 on blog landing |
| Blog hero subtitle | custom | hero_subtitle | multi_line_text_field | No | Classical Ayurvedic wisdom for herbs, digestion, immunity, skin, hair, stress, sleep, detox, and everyday wellness. | Blog hero | Lead paragraph |
| Blog hero image | custom | hero_image | file_reference | No | (image) | Blog hero | Accepted type: image. Fallback: first article image or section setting |
| Featured article | custom | featured_article | article_reference | No | (first article in blog) | Featured article card | Fallback: `blog.articles.first` |
| Secondary featured articles | custom | secondary_featured_articles | list.article_reference | No | (next 3 articles) | Featured section | Fallback: `blog.articles` offset 1 |
| Blog topics | custom | topics | list.metaobject_reference | No | (blog_topic entries) | Topic cards grid | Metaobject type: `blog_topic`. Fallback: `blog.all_tags` |
| Care paths | custom | care_paths | list.metaobject_reference | No | (care_path entries) | Care paths panel | Metaobject type: `care_path`. Fallback: section blocks |
| Consultation CTA title | custom | consult_cta_title | single_line_text_field | No | Need help choosing the right Ayurvedic support? | Consult CTA | |
| Consultation CTA text | custom | consult_cta_text | multi_line_text_field | No | Speak with a Kerala Ayurveda doctor or explore personalized wellness support. | Consult CTA | |
| Consultation CTA button label | custom | consult_cta_button_label | single_line_text_field | No | WhatsApp consults opening soon | Consult CTA | |
| Consultation CTA URL | custom | consult_cta_url | url | No | (blank or consultation page) | Consult CTA | Fallback: blank |

---

## 3. New Article Metafields

**Recommended owner: Article**

| Field Label | Namespace | Key | Type | Required? | Default/Example Value | Used in Section | Notes |
|---|---|---|---|---|---|---|---|
| Article topic | custom | topic | metaobject_reference | No | (blog_topic entry) | Article hero, breadcrumbs | Metaobject type: `blog_topic`. Fallback: `article.tags.first` |
| Category label | custom | category_label | single_line_text_field | No | Digestion & Gut | Article hero chip | Fallback: topic.title or first tag |
| Article short summary (dek) | custom | dek | multi_line_text_field | No | A calm, plain-language look at why burning, reflux, and heaviness happen. | Article hero | Fallback: `article.excerpt_or_content` stripped/truncated |
| Read time (minutes) | custom | read_time_minutes | number_integer | No | 5 | Article hero, blog cards | Fallback: calculate from word count |
| Last reviewed date | custom | last_reviewed_at | date | No | 2026-06-15 | Article hero | Fallback: `article.updated_at` or blank |
| Reviewed by | custom | reviewed_by | metaobject_reference | No | (expert_profile entry) | Article hero, reviewer card | Metaobject type: `expert_profile`. Fallback: "Kerala Ayurveda Editorial Team" |
| Written by profile | custom | written_by_profile | metaobject_reference | No | (expert_profile entry) | Author card | Metaobject type: `expert_profile`. Fallback: `article.author` |
| Hero image override | custom | hero_image | file_reference | No | (image) | Article hero | Accepted type: image. Fallback: `article.image` |
| Hero image caption | custom | hero_image_caption | single_line_text_field | No | (blank) | Article hero | Below hero image |
| At a glance | custom | at_a_glance | list.single_line_text_field | No | ["Main pattern: Burning, sourness, reflux", "Ayurveda lens: Pitta heat, weak agni"] | At-a-glance card | Fallback: hide block |
| Recommended products | custom | recommended_products | list.product_reference | No | (product handles) | Product recommendations | Fallback: hide module |
| Recommended products heading | custom | recommended_products_heading | single_line_text_field | No | Related Kerala Ayurveda formulations | Product recommendations | |
| Recommended products description | custom | recommended_products_description | multi_line_text_field | No | Support your wellness routine with classical Ayurvedic formulations. | Product recommendations | |
| Glossary terms | custom | glossary_terms | list.metaobject_reference | No | (glossary_term entries) | Words to know | Metaobject type: `glossary_term`. Fallback: hide block |
| Sources | custom | sources | list.metaobject_reference | No | (article_source entries) | Sources section | Metaobject type: `article_source`. Fallback: hide block |
| FAQs | custom | faqs | list.metaobject_reference | No | (article_faq entries) | FAQ accordion | Metaobject type: `article_faq`. Fallback: hide accordion |
| Related articles | custom | related_articles | list.article_reference | No | (article references) | Related articles grid | Fallback: articles from same blog with shared tags |
| Health disclaimer override | custom | disclaimer | multi_line_text_field | No | (blank — uses default) | Disclaimer card | Fallback: default health disclaimer text |
| Show comments | custom | show_comments | boolean | No | true | Comments section | Fallback: true if blog comments enabled |
| Comments heading | custom | comments_heading | single_line_text_field | No | Comments | Comments section | |

---

## 4. New Metaobject: `blog_topic`

| Field Label | Field Key | Type | Required? | Example Value | Notes |
|---|---|---|---|---|---|
| Title | title | single_line_text_field | Yes | Digestion & Gut Health | Display name |
| Handle | handle | single_line_text_field | Yes | digestion-gut-health | URL-safe slug |
| Short label | short_label | single_line_text_field | No | Digestion | Compact display name |
| Hindi/Sanskrit label | secondary_label | single_line_text_field | No | पाचन | Secondary language label |
| Description | description | multi_line_text_field | No | Ayurvedic guides for acidity, bloating, constipation, appetite, metabolism, detox, and daily digestive rhythm. | Topic page description |
| Image | image | file_reference | No | (image) | Topic card background image |
| Icon | icon | file_reference | No | (image) | Optional icon for compact display |
| Article filter tag | article_filter_tag | single_line_text_field | No | Digestion | Shopify blog tag to filter articles. Use with `blog.articles` tagged filtering |
| CTA label | cta_label | single_line_text_field | No | Explore digestion guides | Button/link text |
| Sort order | sort_order | number_integer | No | 1 | Display order |
| Accent color | accent_color | color | No | (brand green) | Optional per-topic accent |
| SEO title | seo_title | single_line_text_field | No | Digestion & Gut Health - Kerala Ayurveda | For page title tag |
| SEO description | seo_description | multi_line_text_field | No | (meta description) | For meta description |

---

## 5. New Metaobject: `care_path`

| Field Label | Field Key | Type | Required? | Example Value | Notes |
|---|---|---|---|---|---|
| Title | title | single_line_text_field | Yes | Digestion & gut | Care path name |
| Subtitle | subtitle | multi_line_text_field | No | Acidity, bloating, constipation, appetite, and metabolism support. | Short description |
| Image | image | file_reference | No | (image) | Card image |
| Linked topic | linked_topic | metaobject_reference | No | (blog_topic entry) | Metaobject type: `blog_topic` |
| Link URL | link_url | url | No | /blogs/news/tagged/digestion | Fallback: derived from topic |
| CTA label | cta_label | single_line_text_field | No | Explore gut health | Card button text |
| Sort order | sort_order | number_integer | No | 1 | Display order |

---

## 6. New Metaobject: `expert_profile`

Used for both author and reviewer profiles. Replaces/consolidates the existing author/reviewer metaobject.

| Field Label | Field Key | Type | Required? | Example Value | Notes |
|---|---|---|---|---|---|
| Name | name | single_line_text_field | Yes | Dr. Ananya Nair | Full name |
| Photo | photo | file_reference | No | (image) | Profile picture |
| Role label | role_label | single_line_text_field | No | Reviewed by | How to label this person's role |
| Designation | designation | single_line_text_field | No | Ayurvedic Doctor | Job title |
| Degree | degree | single_line_text_field | No | BAMS, MD Ayurveda | Academic credentials |
| Qualifications | qualifications | single_line_text_field | No | 12+ years of clinical Ayurveda experience | Experience summary |
| Short bio | short_bio | multi_line_text_field | No | (2-3 sentence bio) | Card-level bio |
| Full bio | full_bio | rich_text_field | No | (detailed bio) | Full profile page content |
| Profile URL | profile_url | url | No | /pages/dr-ananya-nair | Link to full profile |
| Signature text | signature_text | single_line_text_field | No | (optional) | For editorial sign-off |

### Migration from existing author/reviewer profile

| Existing field | New field | Notes |
|---|---|---|
| `name` | `name` | Direct mapping |
| `qualifications` | `qualifications` | Direct mapping |
| `degree` | `degree` | Direct mapping |
| `description` | `short_bio` | Renamed for clarity |
| `image` | `photo` | Renamed for clarity |
| `profile_link` | `profile_url` | Renamed for clarity |
| `designation` | `designation` | Direct mapping |
| — | `role_label` | New field |
| — | `full_bio` | New field |
| — | `signature_text` | New field |

---

## 7. New Metaobject: `glossary_term`

| Field Label | Field Key | Type | Required? | Example Value | Notes |
|---|---|---|---|---|---|
| Term | term | single_line_text_field | Yes | Agni | Primary term |
| Sanskrit/Hindi term | secondary_term | single_line_text_field | No | अग्नि | Devanagari script |
| Pronunciation | pronunciation | single_line_text_field | No | UGG-nee | Optional pronunciation guide |
| Short definition | short_definition | multi_line_text_field | Yes | Digestive fire; the body's capacity to transform food into nourishment. | Card-level definition |
| Long definition | long_definition | rich_text_field | No | (detailed explanation) | Expanded definition |
| Related topic | related_topic | metaobject_reference | No | (blog_topic entry) | Metaobject type: `blog_topic` |

---

## 8. New Metaobject: `article_source`

| Field Label | Field Key | Type | Required? | Example Value | Notes |
|---|---|---|---|---|---|
| Source title | title | single_line_text_field | Yes | Charaka Samhita, Chikitsa Sthana | Citation title |
| Publisher | publisher | single_line_text_field | No | Classical Ayurvedic Text | Publisher name |
| Author | author | single_line_text_field | No | Acharya Charaka | Source author |
| URL | url | url | No | https://example.com/source | Link to source |
| Published date | published_date | date | No | (date) | When source was published |
| Accessed date | accessed_date | date | No | (date) | When source was accessed |
| Note | note | multi_line_text_field | No | Referenced for pitta-related digestive guidance | Editorial note |

---

## 9. New Metaobject: `article_faq`

| Field Label | Field Key | Type | Required? | Example Value | Notes |
|---|---|---|---|---|---|
| Question | question | single_line_text_field | Yes | Can Ayurveda help with acidity? | FAQ question |
| Answer | answer | rich_text_field | Yes | (rich text answer) | Supports formatting |
| Sort order | sort_order | number_integer | No | 1 | Display order |

---

## 10. Shopify Admin Setup Checklist

### Metafield Definitions to Create

#### Blog metafields (Owner: Blog)
- [ ] `custom.hero_eyebrow` — single_line_text_field
- [ ] `custom.hero_title` — single_line_text_field
- [ ] `custom.hero_subtitle` — multi_line_text_field
- [ ] `custom.hero_image` — file_reference (image)
- [ ] `custom.featured_article` — article_reference
- [ ] `custom.secondary_featured_articles` — list.article_reference
- [ ] `custom.topics` — list.metaobject_reference (blog_topic)
- [ ] `custom.care_paths` — list.metaobject_reference (care_path)
- [ ] `custom.consult_cta_title` — single_line_text_field
- [ ] `custom.consult_cta_text` — multi_line_text_field
- [ ] `custom.consult_cta_button_label` — single_line_text_field
- [ ] `custom.consult_cta_url` — url

#### Article metafields (Owner: Article)
- [ ] `custom.topic` — metaobject_reference (blog_topic)
- [ ] `custom.category_label` — single_line_text_field
- [ ] `custom.dek` — multi_line_text_field
- [ ] `custom.read_time_minutes` — number_integer
- [ ] `custom.last_reviewed_at` — date
- [ ] `custom.reviewed_by` — metaobject_reference (expert_profile)
- [ ] `custom.written_by_profile` — metaobject_reference (expert_profile)
- [ ] `custom.hero_image` — file_reference (image)
- [ ] `custom.hero_image_caption` — single_line_text_field
- [ ] `custom.at_a_glance` — list.single_line_text_field
- [ ] `custom.recommended_products` — list.product_reference
- [ ] `custom.recommended_products_heading` — single_line_text_field
- [ ] `custom.recommended_products_description` — multi_line_text_field
- [ ] `custom.glossary_terms` — list.metaobject_reference (glossary_term)
- [ ] `custom.sources` — list.metaobject_reference (article_source)
- [ ] `custom.faqs` — list.metaobject_reference (article_faq)
- [ ] `custom.related_articles` — list.article_reference
- [ ] `custom.disclaimer` — multi_line_text_field
- [ ] `custom.show_comments` — boolean
- [ ] `custom.comments_heading` — single_line_text_field

### Metaobject Definitions to Create
- [ ] `blog_topic` — 13 fields (see section 4)
- [ ] `care_path` — 7 fields (see section 5)
- [ ] `expert_profile` — 10 fields (see section 6)
- [ ] `glossary_term` — 6 fields (see section 7)
- [ ] `article_source` — 7 fields (see section 8)
- [ ] `article_faq` — 3 fields (see section 9)

### Fields to pin in Shopify admin
- Blog: `featured_article`, `topics`, `care_paths`
- Article: `topic`, `dek`, `read_time_minutes`, `written_by_profile`, `reviewed_by`, `at_a_glance`, `recommended_products`, `faqs`, `related_articles`

### Optional fields (can be populated later)
- Blog: `hero_eyebrow`, `hero_title`, `hero_subtitle`, `hero_image`, `secondary_featured_articles`, all `consult_cta_*`
- Article: `category_label`, `last_reviewed_at`, `hero_image`, `hero_image_caption`, `glossary_terms`, `sources`, `disclaimer`, `show_comments`, `comments_heading`, `recommended_products_heading`, `recommended_products_description`

### Fields needing initial seed content
- At least 4–8 `blog_topic` entries (Digestion, Herbs, Skin & Hair, Sleep, Detox, Women's Health, Pain & Joints, Doshas)
- At least 3–4 `care_path` entries
- At least 1–2 `expert_profile` entries (author + reviewer)
- At least 3–4 `glossary_term` entries for the first article
- At least 2–3 `article_faq` entries for the first article
