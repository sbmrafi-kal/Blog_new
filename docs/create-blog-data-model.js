/**
 * Shopify Admin Console Script - Create Redesigned Blog Data Model
 * 
 * Instructions:
 * 1. Open your Shopify Admin in Chrome: https://admin.shopify.com/store/aucd1i-nr
 * 2. Press Option + Command + J (Mac) or Ctrl + Shift + J (Windows) to open Console.
 * 3. Copy this entire script, paste it into the console, and press Enter.
 */

(async function() {
  const storeMatch = window.location.pathname.match(/\/store\/([^/]+)/);
  const storeHandle = storeMatch ? storeMatch[1] : 'aucd1i-nr';
  const graphqlUrl = `/store/${storeHandle}/graphql`;

  console.log(`%cShopify Blog Data Setup starting on store: ${storeHandle}...`, 'color: #1e4b3c; font-size: 16px; font-weight: bold;');

  // Helper to make GraphQL calls
  async function callGraphQL(query, variables = {}) {
    const response = await fetch(graphqlUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ query, variables })
    });
    return response.json();
  }

  // 1. Define Metaobjects
  const metaobjects = [
    {
      name: "Blog Topic",
      type: "blog_topic",
      displayNameKey: "title",
      fieldDefinitions: [
        { key: "title", name: "Title", type: "single_line_text_field", required: true },
        { key: "handle", name: "Handle", type: "single_line_text_field", required: true },
        { key: "short_label", name: "Short label", type: "single_line_text_field" },
        { key: "secondary_label", name: "Hindi/Sanskrit label", type: "single_line_text_field" },
        { key: "description", name: "Description", type: "multi_line_text_field" },
        { key: "image", name: "Image", type: "file_reference", validations: [{ name: "file_type_restriction", value: "image" }] },
        { key: "icon", name: "Icon", type: "file_reference", validations: [{ name: "file_type_restriction", value: "image" }] },
        { key: "article_filter_tag", name: "Article filter tag", type: "single_line_text_field" },
        { key: "cta_label", name: "CTA label", type: "single_line_text_field" },
        { key: "sort_order", name: "Sort order", type: "number_integer" },
        { key: "accent_color", name: "Accent color", type: "color" },
        { key: "seo_title", name: "SEO title", type: "single_line_text_field" },
        { key: "seo_description", name: "SEO description", type: "multi_line_text_field" }
      ]
    },
    {
      name: "Care Path",
      type: "care_path",
      displayNameKey: "title",
      fieldDefinitions: [
        { key: "title", name: "Title", type: "single_line_text_field", required: true },
        { key: "subtitle", name: "Subtitle", type: "multi_line_text_field" },
        { key: "image", name: "Image", type: "file_reference", validations: [{ name: "file_type_restriction", value: "image" }] },
        { key: "linked_topic", name: "Linked topic", type: "metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "blog_topic" }] },
        { key: "link_url", name: "Link URL", type: "url" },
        { key: "cta_label", name: "CTA label", type: "single_line_text_field" },
        { key: "sort_order", name: "Sort order", type: "number_integer" }
      ]
    },
    {
      name: "Expert Profile",
      type: "expert_profile",
      displayNameKey: "name",
      fieldDefinitions: [
        { key: "name", name: "Name", type: "single_line_text_field", required: true },
        { key: "photo", name: "Photo", type: "file_reference", validations: [{ name: "file_type_restriction", value: "image" }] },
        { key: "role_label", name: "Role label", type: "single_line_text_field" },
        { key: "designation", name: "Designation", type: "single_line_text_field" },
        { key: "degree", name: "Degree", type: "single_line_text_field" },
        { key: "qualifications", name: "Qualifications", type: "single_line_text_field" },
        { key: "short_bio", name: "Short bio", type: "multi_line_text_field" },
        { key: "full_bio", name: "Full bio", type: "rich_text_field" },
        { key: "profile_url", name: "Profile URL", type: "url" },
        { key: "signature_text", name: "Signature text", type: "single_line_text_field" }
      ]
    },
    {
      name: "Glossary Term",
      type: "glossary_term",
      displayNameKey: "term",
      fieldDefinitions: [
        { key: "term", name: "Term", type: "single_line_text_field", required: true },
        { key: "secondary_term", name: "Sanskrit/Hindi term", type: "single_line_text_field" },
        { key: "pronunciation", name: "Pronunciation", type: "single_line_text_field" },
        { key: "short_definition", name: "Short definition", type: "multi_line_text_field", required: true },
        { key: "long_definition", name: "Long definition", type: "rich_text_field" },
        { key: "related_topic", name: "Related topic", type: "metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "blog_topic" }] }
      ]
    },
    {
      name: "Article Source",
      type: "article_source",
      displayNameKey: "title",
      fieldDefinitions: [
        { key: "title", name: "Source title", type: "single_line_text_field", required: true },
        { key: "publisher", name: "Publisher", type: "single_line_text_field" },
        { key: "author", name: "Author", type: "single_line_text_field" },
        { key: "url", name: "URL", type: "url" },
        { key: "published_date", name: "Published date", type: "date" },
        { key: "accessed_date", name: "Accessed date", type: "date" },
        { key: "note", name: "Note", type: "multi_line_text_field" }
      ]
    },
    {
      name: "Article FAQ",
      type: "article_faq",
      displayNameKey: "question",
      fieldDefinitions: [
        { key: "question", name: "Question", type: "single_line_text_field", required: true },
        { key: "answer", name: "Answer", type: "rich_text_field", required: true },
        { key: "sort_order", name: "Sort order", type: "number_integer" }
      ]
    }
  ];

  // 2. Define Blog Metafields
  const blogMetafields = [
    { namespace: "custom", key: "hero_eyebrow", name: "Hero eyebrow", type: "single_line_text_field" },
    { namespace: "custom", key: "hero_title", name: "Hero title", type: "single_line_text_field" },
    { namespace: "custom", key: "hero_subtitle", name: "Hero subtitle", type: "multi_line_text_field" },
    { namespace: "custom", key: "hero_image", name: "Hero image", type: "file_reference", validations: [{ name: "file_type_restriction", value: "image" }] },
    { namespace: "custom", key: "featured_article", name: "Featured article", type: "article_reference" },
    { namespace: "custom", key: "secondary_featured_articles", name: "Secondary featured articles", type: "list.article_reference" },
    { namespace: "custom", key: "topics", name: "Topics", type: "list.metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "blog_topic" }] },
    { namespace: "custom", key: "care_paths", name: "Care paths", type: "list.metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "care_path" }] },
    { namespace: "custom", key: "consult_cta_title", name: "Consultation CTA title", type: "single_line_text_field" },
    { namespace: "custom", key: "consult_cta_text", name: "Consultation CTA text", type: "multi_line_text_field" },
    { namespace: "custom", key: "consult_cta_button_label", name: "Consultation CTA button label", type: "single_line_text_field" },
    { namespace: "custom", key: "consult_cta_url", name: "Consultation CTA URL", type: "url" }
  ];

  // 3. Define Article Metafields
  const articleMetafields = [
    { namespace: "custom", key: "topic", name: "Topic", type: "metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "blog_topic" }] },
    { namespace: "custom", key: "category_label", name: "Category label", type: "single_line_text_field" },
    { namespace: "custom", key: "dek", name: "Short summary (dek)", type: "multi_line_text_field" },
    { namespace: "custom", key: "read_time_minutes", name: "Read time (minutes)", type: "number_integer" },
    { namespace: "custom", key: "last_reviewed_at", name: "Last reviewed date", type: "date" },
    { namespace: "custom", key: "reviewed_by", name: "Reviewed by", type: "metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "expert_profile" }] },
    { namespace: "custom", key: "written_by_profile", name: "Written by profile", type: "metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "expert_profile" }] },
    { namespace: "custom", key: "hero_image", name: "Hero image override", type: "file_reference", validations: [{ name: "file_type_restriction", value: "image" }] },
    { namespace: "custom", key: "hero_image_caption", name: "Hero image caption", type: "single_line_text_field" },
    { namespace: "custom", key: "at_a_glance", name: "At a glance", type: "list.single_line_text_field" },
    { namespace: "custom", key: "recommended_products", name: "Recommended products", type: "list.product_reference" },
    { namespace: "custom", key: "recommended_products_heading", name: "Recommended products heading", type: "single_line_text_field" },
    { namespace: "custom", key: "recommended_products_description", name: "Recommended products description", type: "multi_line_text_field" },
    { namespace: "custom", key: "glossary_terms", name: "Glossary terms", type: "list.metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "glossary_term" }] },
    { namespace: "custom", key: "sources", name: "Sources", type: "list.metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "article_source" }] },
    { namespace: "custom", key: "faqs", name: "FAQs", type: "list.metaobject_reference", validations: [{ name: "metaobject_definition_supported", value: "article_faq" }] },
    { namespace: "custom", key: "related_articles", name: "Related articles", type: "list.article_reference" },
    { namespace: "custom", key: "disclaimer", name: "Health disclaimer override", type: "multi_line_text_field" },
    { namespace: "custom", key: "show_comments", name: "Show comments", type: "boolean" },
    { namespace: "custom", key: "comments_heading", name: "Comments heading", type: "single_line_text_field" }
  ];

  // --- EXECUTE CREATIONS ---

  console.log("%cStep 1: Creating Metaobjects...", "color: blue; font-weight: bold;");
  const createMetaobjectMutation = `
    mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
      metaobjectDefinitionCreate(definition: $definition) {
        metaobjectDefinition { id type name }
        userErrors { field message }
      }
    }
  `;

  for (const definition of metaobjects) {
    try {
      const res = await callGraphQL(createMetaobjectMutation, { definition });
      if (res.data && res.data.metaobjectDefinitionCreate.metaobjectDefinition) {
        console.log(`✔ Metaobject definition '${definition.name}' (${definition.type}) created successfully!`);
      } else {
        const errs = res.data.metaobjectDefinitionCreate.userErrors.map(e => e.message).join(', ');
        console.warn(`✖ Failed to create metaobject definition '${definition.name}': ${errs}`);
      }
    } catch (e) {
      console.error(`Error creating metaobject definition '${definition.name}':`, e);
    }
  }

  // Helper to create metafield definition
  const createMetafieldMutation = `
    mutation CreateMetafieldDefinition($definition: MetafieldDefinitionInput!) {
      metafieldDefinitionCreate(definition: $definition) {
        createdDefinition { id namespace key name }
        userErrors { field message }
      }
    }
  `;

  console.log("%cStep 2: Creating Blog Metafields...", "color: blue; font-weight: bold;");
  for (const field of blogMetafields) {
    try {
      const variables = {
        definition: {
          ...field,
          ownerType: "BLOG"
        }
      };
      const res = await callGraphQL(createMetafieldMutation, variables);
      if (res.data && res.data.metafieldDefinitionCreate.createdDefinition) {
        console.log(`✔ Blog metafield '${field.name}' (${field.namespace}.${field.key}) created successfully!`);
      } else {
        const errs = res.data.metafieldDefinitionCreate.userErrors.map(e => e.message).join(', ');
        console.warn(`✖ Failed to create Blog metafield '${field.name}': ${errs}`);
      }
    } catch (e) {
      console.error(`Error creating Blog metafield '${field.name}':`, e);
    }
  }

  console.log("%cStep 3: Creating Article Metafields...", "color: blue; font-weight: bold;");
  for (const field of articleMetafields) {
    try {
      const variables = {
        definition: {
          ...field,
          ownerType: "ARTICLE"
        }
      };
      const res = await callGraphQL(createMetafieldMutation, variables);
      if (res.data && res.data.metafieldDefinitionCreate.createdDefinition) {
        console.log(`✔ Article metafield '${field.name}' (${field.namespace}.${field.key}) created successfully!`);
      } else {
        const errs = res.data.metafieldDefinitionCreate.userErrors.map(e => e.message).join(', ');
        console.warn(`✖ Failed to create Article metafield '${field.name}': ${errs}`);
      }
    } catch (e) {
      console.error(`Error creating Article metafield '${field.name}':`, e);
    }
  }

  console.log("%c✔ Data Model creation complete! You can now check them under Settings -> Custom data in your Shopify Admin.", "color: green; font-size: 14px; font-weight: bold;");
})();
