# Blog Redesign — QA Checklist

## Pre-deployment Setup

- [ ] All metafield definitions created in Shopify admin (see `shopify-admin-setup-checklist.md`)
- [ ] All metaobject definitions created (blog_topic, care_path, expert_profile, glossary_term, article_source, article_faq)
- [ ] At least 1 blog_topic seeded
- [ ] At least 1 expert_profile seeded (author)
- [ ] Blog template assigned: `blog.ayurveda` on target blog
- [ ] Article template assigned: `article.ayurveda` on at least 1 test article
- [ ] `custom-article-font` snippet exists in theme
- [ ] `product-card` snippet exists in theme

---

## Blog Landing Page (`/blogs/news`)

### Hero
- [ ] Eyebrow text renders from blog metafield → section setting → default
- [ ] Title renders from blog metafield → section setting → blog.title
- [ ] Subtitle renders with fallback chain
- [ ] CTA buttons link to #topics and #latest anchors
- [ ] Hero is responsive at 320px, 768px, 1024px, 1440px

### Subnav
- [ ] Sticky positioning works below header
- [ ] Smooth-scroll to each section anchor
- [ ] Active state updates on click
- [ ] Horizontal scroll on mobile overflow

### Care Paths
- [ ] Renders from blog metafield (list.metaobject_reference)
- [ ] Falls back to section blocks when metafield is empty
- [ ] Each path links to correct tag URL (`/blogs/news/tagged/{tag}`)
- [ ] Hover state on path rows
- [ ] Responsive: single column on mobile

### Featured Article
- [ ] Renders from blog metafield (article_reference)
- [ ] Falls back to `blog.articles.first`
- [ ] Image loads correctly
- [ ] Author name from metafield → article.author
- [ ] Read time displays when metafield set
- [ ] Link goes to correct article URL

### Topics Grid
- [ ] Renders from blog metafield (list.metaobject_reference)
- [ ] Falls back to `blog.all_tags` as plain cards
- [ ] 4-column on desktop, 2-column tablet, 1-column mobile
- [ ] Image cards with gradient overlay
- [ ] Hover animation (lift + image zoom)

### Latest Articles
- [ ] Paginated (9 per page)
- [ ] Full-bleed image cards render
- [ ] Pagination links work (Previous / 1 2 3 / Next)
- [ ] Article count displays in eyebrow
- [ ] 3-column desktop, 2-column tablet, 1-column mobile

### Consultation CTA
- [ ] Renders with metafield → section setting → default text
- [ ] Button is clickable when URL set, disabled-style when blank
- [ ] 3-step pathway visible
- [ ] Responsive layout

### Floating CTA
- [ ] Fixed position bottom-right
- [ ] Links to #consult anchor
- [ ] Visible on scroll, doesn't overlap footer

---

## Topic Page (`/blogs/news/tagged/digestion`)

### Topic Hero
- [ ] Breadcrumb: Journal / {topic_title}
- [ ] Enriched with blog_topic metaobject when available
- [ ] Falls back to raw tag name
- [ ] Secondary label (Hindi) renders when metaobject has it
- [ ] Hero card responsive

### Filter Bar
- [ ] Current tag highlighted as "All"
- [ ] Other blog tags shown as navigation
- [ ] Horizontal scroll on mobile

### Article Grid
- [ ] Shows articles filtered by tag
- [ ] Paginated (12 per page)
- [ ] Full-bleed image cards
- [ ] Article count in eyebrow

---

## Article Page (`/blogs/news/{article}`)

### Breadcrumbs
- [ ] Journal / {Topic} / {Article title}
- [ ] Each breadcrumb level links correctly
- [ ] Topic breadcrumb uses metafield → tag fallback

### Article Hero
- [ ] Category chip renders
- [ ] "Doctor-reviewed" chip shows when reviewer_profile exists
- [ ] H1 renders article.title
- [ ] Dek from metafield → excerpt fallback
- [ ] Author name from metafield → article.author
- [ ] Read time from metafield → JS calculation fallback
- [ ] Reviewer name when set
- [ ] Updated date from metafield → article.updated_at
- [ ] Hero image below hero card (with overlap effect)
- [ ] Hero image caption when set

### Two-Column Layout
- [ ] Content column on left, sidebar TOC on right (desktop)
- [ ] Single column on tablet/mobile
- [ ] Sidebar sticky scroll tracking

### Mobile TOC
- [ ] Hidden on desktop, visible on tablet/mobile
- [ ] Accordion toggle works (aria-expanded)
- [ ] Links scroll to correct heading
- [ ] Accordion closes after navigation

### Desktop TOC (Sidebar)
- [ ] Built dynamically from h2/h3 headings
- [ ] Active heading tracking via IntersectionObserver
- [ ] Smooth scroll on click
- [ ] Hidden when no headings found

### At a Glance
- [ ] Renders when metafield has values
- [ ] Splits on ": " for bold label + description
- [ ] Hidden when metafield is empty
- [ ] 2-column grid desktop, 1-column mobile

### Article Body
- [ ] `article.content` renders with typography styles
- [ ] Headings have IDs for TOC linking
- [ ] Lists, blockquotes, images styled
- [ ] 18px body text desktop, 16px mobile

### Product Recommendations
- [ ] Renders when `recommended_products` metafield has values
- [ ] Uses existing `product-card` snippet
- [ ] Hidden when no products set
- [ ] 3-column grid desktop, 1-column mobile
- [ ] Custom heading and description from metafields

### Glossary
- [ ] Renders when `glossary_terms` metafield has values
- [ ] Term in bold (deep orange)
- [ ] Secondary term (Sanskrit) when available
- [ ] Pronunciation when available
- [ ] Short definition
- [ ] Hidden when empty

### Sources
- [ ] Renders when `sources` metafield has values
- [ ] Ordered list with author, title, publisher, date, URL
- [ ] External links open in new tab with noopener
- [ ] Hidden when empty

### Health Disclaimer
- [ ] Always renders
- [ ] Article metafield overrides section default
- [ ] Bold "Health disclaimer:" label

### FAQ
- [ ] Renders when `faqs` metafield has values
- [ ] First item open by default
- [ ] Native `<details>/<summary>` — works without JS
- [ ] "+" / "–" indicator
- [ ] Aria-expanded set correctly
- [ ] Hidden when empty

### Author Card
- [ ] Renders from `written_by_profile` metaobject
- [ ] Falls back to basic `article.author` display
- [ ] Avatar: photo or initials
- [ ] Credentials: degree + qualifications
- [ ] Bio text
- [ ] Profile link when set

### Reviewer Card
- [ ] Renders when `reviewed_by` metaobject exists
- [ ] Hidden when not set
- [ ] Same layout as author card

### Related Articles
- [ ] Renders from `related_articles` metafield (limit 3)
- [ ] Falls back to same-tag articles
- [ ] Falls back to recent blog articles
- [ ] 3-column desktop, 1-column mobile
- [ ] Image, title, read-more link

### Share Row
- [ ] Email, LinkedIn, Facebook, WhatsApp share links
- [ ] Correct URL encoding
- [ ] External links open in new tab

### Comments
- [ ] Renders when `blog.comments_enabled?` is true
- [ ] Controlled by `show_comments` metafield (default true)
- [ ] Existing comments displayed with avatar, name, date, content
- [ ] Comment form with name, email, comment fields
- [ ] Success message (with moderation notice if applicable)
- [ ] Error display
- [ ] Pagination for 10+ comments

---

## Cross-cutting Checks

### Responsive
- [ ] 320px (small mobile)
- [ ] 375px (iPhone)
- [ ] 768px (tablet)
- [ ] 1024px (desktop)
- [ ] 1440px (large desktop)
- [ ] No horizontal overflow at any breakpoint

### Accessibility
- [ ] All images have alt text
- [ ] ARIA labels on navigation
- [ ] `aria-expanded` on accordions
- [ ] Keyboard navigation works for TOC, FAQ, forms
- [ ] Focus states visible
- [ ] Semantic HTML (article, section, nav, aside)
- [ ] `prefers-reduced-motion` disables animations

### Performance
- [ ] Lazy loading on below-fold images
- [ ] `fetchpriority="high"` on hero image
- [ ] CSS loads via stylesheet_tag
- [ ] JS loads with `defer`
- [ ] No external dependencies

### SEO
- [ ] Single H1 per page
- [ ] Heading hierarchy (H1 > H2 > H3)
- [ ] Breadcrumb structure
- [ ] Blog pagination with proper link tags
- [ ] Canonical URLs preserved (existing SEO URLs unchanged)

### Coexistence
- [ ] Existing `main-article-modular.liquid` still works
- [ ] No CSS leaks from `.ka-blog-*` scoped classes
- [ ] No ID collisions between old and new systems
- [ ] Both templates selectable in Shopify admin
