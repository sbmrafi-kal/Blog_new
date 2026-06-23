/**
 * ka-blog-redesign.js
 * Kerala Ayurveda Blog Redesign — Vanilla JS behaviors
 * Scoped to .ka-blog-wrapper containers
 *
 * Includes:
 *  1. Blog subnav smooth-scroll
 *  2. Article TOC — desktop active tracking + mobile accordion
 *  3. FAQ accordion (progressive enhancement on <details>)
 *  4. Read time calculation fallback
 */

(function () {
  'use strict';

  // ============================================================
  // 1. BLOG SUBNAV — Smooth scroll for anchor links
  // ============================================================
  function initSubnav() {
    var subnav = document.querySelector('.ka-blog-subnav');
    if (!subnav) return;

    var links = subnav.querySelectorAll('a[href*="#"]');
    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (!hash) return;

        // Extract the hash part
        var hashIndex = hash.indexOf('#');
        if (hashIndex === -1) return;

        var targetId = hash.substring(hashIndex + 1);
        var target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        var headerHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-height')
        ) || 60;

        var subnavHeight = subnav.parentElement
          ? subnav.parentElement.offsetHeight
          : 50;

        var targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = targetPosition - headerHeight - subnavHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        // Update active state
        links.forEach(function (l) {
          l.classList.remove('active');
        });
        link.classList.add('active');
      });
    });
  }

  // ============================================================
  // 2. ARTICLE TOC — Build from headings, desktop active tracking,
  //    mobile accordion toggle
  // ============================================================
  function initArticleTOC() {
    var articleContent = document.querySelector('.ka-article-content');
    if (!articleContent) return;

    var headings = articleContent.querySelectorAll('.ka-article-body h2, .ka-article-body h3');
    var sidebarToc = document.querySelector('.ka-article-sidebar');
    var mobileToc = document.querySelector('.ka-article-toc-mobile');

    // Ensure all headings have IDs dynamically if missing
    headings.forEach(function (heading, index) {
      if (!heading.id) {
        var slug = heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (!slug) {
          slug = 'heading-' + index;
        }
        heading.id = slug;
      }
    });

    if (!headings.length) {
      if (sidebarToc) sidebarToc.style.display = 'none';
      if (mobileToc) mobileToc.style.display = 'none';
      return;
    }

    // Build TOC links from headings (for sidebar and mobile)
    function buildTocLinks(container, listSelector) {
      var list = container.querySelector(listSelector);
      if (!list) return;

      // Only build if the list is empty (avoid double-building on dynamic content)
      if (list.children.length > 0) return;

      headings.forEach(function (heading) {
        var text = heading.textContent.trim();
        if (!text) return;

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.textContent = text;
        a.href = '#' + heading.id;
        a.addEventListener('click', function (e) {
          e.preventDefault();
          scrollToHeading(heading);

          // Close mobile accordion after nav
          if (mobileToc) {
            var toggle = mobileToc.querySelector(
              '.ka-article-toc-mobile__toggle'
            );
            var content = mobileToc.querySelector(
              '.ka-article-toc-mobile__content'
            );
            if (
              toggle &&
              toggle.getAttribute('aria-expanded') === 'true'
            ) {
              toggle.setAttribute('aria-expanded', 'false');
              if (content) content.classList.remove('is-open');
            }
          }
        });
        li.appendChild(a);
        list.appendChild(li);
      });
    }

    if (sidebarToc) {
      buildTocLinks(sidebarToc, '.ka-article-sidebar__list');
    }

    if (mobileToc) {
      buildTocLinks(mobileToc, '.ka-article-toc-mobile__list');

      // Mobile toggle
      var toggle = mobileToc.querySelector('.ka-article-toc-mobile__toggle');
      var content = mobileToc.querySelector(
        '.ka-article-toc-mobile__content'
      );
      if (toggle && content) {
        toggle.addEventListener('click', function () {
          var expanded =
            toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));
          content.classList.toggle('is-open');
        });
      }
    }

    // Desktop active heading tracking via IntersectionObserver
    if (sidebarToc && 'IntersectionObserver' in window) {
      var tocLinks = sidebarToc.querySelectorAll('a[href^="#"]');
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              tocLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === '#' + entry.target.id) {
                  link.classList.add('active');
                }
              });
            }
          });
        },
        {
          rootMargin: '-20% 0px -60% 0px',
          threshold: 0,
        }
      );

      headings.forEach(function (heading) {
        observer.observe(heading);
      });
    }
  }

  function scrollToHeading(heading) {
    var headerHeight = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--header-height')
    ) || 60;

    var targetPosition =
      heading.getBoundingClientRect().top + window.pageYOffset;
    var offsetPosition = targetPosition - headerHeight - 30;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth',
    });
  }

  // ============================================================
  // 3. FAQ ACCORDION — Progressive enhancement
  //    Uses native <details>/<summary>, adds smooth open/close
  // ============================================================
  function initFAQ() {
    var faqSection = document.querySelector('.ka-article-faq');
    if (!faqSection) return;

    // The <details> element handles open/close natively
    // We just ensure aria attributes are correct
    var details = faqSection.querySelectorAll('details');
    details.forEach(function (detail) {
      var summary = detail.querySelector('summary');
      if (!summary) return;

      // Set initial aria state
      summary.setAttribute(
        'aria-expanded',
        detail.hasAttribute('open') ? 'true' : 'false'
      );

      detail.addEventListener('toggle', function () {
        summary.setAttribute(
          'aria-expanded',
          detail.open ? 'true' : 'false'
        );
      });
    });
  }

  // ============================================================
  // 4. READ TIME — Calculate from article content word count
  // ============================================================
  function initReadTime() {
    var readTimeEl = document.querySelector('[data-ka-read-time]');
    if (!readTimeEl) return;

    // Only calculate if no explicit read time was set
    if (readTimeEl.textContent.trim()) return;

    var articleContent = document.querySelector('.ka-article-content');
    if (!articleContent) return;

    var text = articleContent.textContent || '';
    var wordCount = text.split(/\s+/).filter(function (w) {
      return w.length > 0;
    }).length;
    var minutes = Math.max(1, Math.ceil(wordCount / 200));
    readTimeEl.textContent = minutes + ' min read';
  }

  // ============================================================
  // INIT — Run all on DOMContentLoaded
  // ============================================================
  function init() {
    initSubnav();
    initArticleTOC();
    initFAQ();
    initReadTime();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
