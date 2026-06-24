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
    var isScrollLocked = false;

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

        // Lock scroll-spy to prevent it from fighting the smooth scroll
        isScrollLocked = true;

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

        // Update active state immediately
        links.forEach(function (l) {
          l.classList.remove('active');
        });
        link.classList.add('active');

        // Unlock scroll-spy after smooth scroll completes
        setTimeout(function () {
          isScrollLocked = false;
        }, 1200);
      });
    });

    // Scroll-Spy tracking
    var sections = [];
    links.forEach(function (link) {
      var hash = link.getAttribute('href');
      if (!hash) return;
      var hashIndex = hash.indexOf('#');
      if (hashIndex === -1) return;
      var targetId = hash.substring(hashIndex + 1);
      var target = document.getElementById(targetId);
      if (target) {
        sections.push({
          link: link,
          target: target
        });
      }
    });

    function updateActiveLink() {
      // Skip if scroll is locked (user just clicked a subnav link)
      if (isScrollLocked) return;

      var scrollPos = window.scrollY || window.pageYOffset;
      var headerHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height')
      ) || 60;
      var subnavHeight = subnav.parentElement ? subnav.parentElement.offsetHeight : 50;
      var threshold = headerHeight + subnavHeight + 20;

      var activeLink = null;
      var maxVisibleHeight = 0;

      sections.forEach(function (section) {
        var rect = section.target.getBoundingClientRect();
        // Calculate the visible height of this section in the viewport
        var visibleTop = Math.max(rect.top, threshold);
        var visibleBottom = Math.min(rect.bottom, window.innerHeight);
        var visibleHeight = 0;
        if (visibleTop < visibleBottom) {
          visibleHeight = visibleBottom - visibleTop;
        }

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          activeLink = section.link;
        }
      });

      // Fallback for top of page
      if (scrollPos < 100) {
        activeLink = links[0];
      }

      if (activeLink) {
        links.forEach(function (l) {
          if (l === activeLink) {
            l.classList.add('active');
          } else {
            l.classList.remove('active');
          }
        });
      }
    }

    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', function () {
      setTimeout(updateActiveLink, 100);
    });
    updateActiveLink(); // Run on init
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
    if ('IntersectionObserver' in window) {
      var tocLinks = sidebarToc ? sidebarToc.querySelectorAll('a[href^="#"]') : [];
      var mobileTocLinks = mobileToc ? mobileToc.querySelectorAll('a[href^="#"]') : [];
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var targetHref = '#' + entry.target.id;
              // Update desktop TOC
              tocLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === targetHref) {
                  link.classList.add('active');
                }
              });
              // Update mobile TOC
              mobileTocLinks.forEach(function (link) {
                link.classList.remove('active');
                if (link.getAttribute('href') === targetHref) {
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
  // 5. TOPIC CAROUSEL — Wheel scroll translation & dots sync
  // ============================================================
  function initTopicCarousel() {
    var outer = document.querySelector('.ka-blog-topic-carousel-outer');
    if (!outer) return;

    var track = outer.querySelector('.ka-blog-topic-carousel-track');
    var decks = outer.querySelectorAll('.ka-blog-topic-deck');
    if (!track || !decks.length) return;

    function handleScroll() {
      if (window.innerWidth < 980) {
        track.style.transform = '';
        decks.forEach(function (deck) {
          deck.classList.remove('active');
        });
        return;
      }

      var rect = outer.getBoundingClientRect();
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var outerTop = rect.top + scrollTop;
      var outerHeight = outer.offsetHeight;
      var viewportHeight = window.innerHeight;

      // Pin starts when container top meets top: 170px of viewport
      var stickyOffset = 170;
      var startScroll = outerTop - stickyOffset - 50;
      var endScroll = outerTop + outerHeight - viewportHeight;
      var totalScrollRange = endScroll - startScroll;

      if (totalScrollRange <= 0) return;

      var currentScroll = scrollTop - startScroll;
      var pct = currentScroll / totalScrollRange;

      if (pct < 0) pct = 0;
      if (pct > 1) pct = 1;

      // No horizontal translation on desktop (cross-fade handles deck switching)
      track.style.transform = 'none';

      // Set active deck for CSS transitions
      var activeIndex = Math.floor(pct * decks.length);
      if (activeIndex >= decks.length) activeIndex = decks.length - 1;
      if (pct === 1) activeIndex = decks.length - 1;

      decks.forEach(function (deck, index) {
        if (index === activeIndex) {
          deck.classList.add('active');
        } else {
          deck.classList.remove('active');
        }
      });
    }

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    // Initial run
    handleScroll();
  }

  // ============================================================
  // 6. AJAX FILTERING & PAGINATION
  // ============================================================
  function loadAjaxContent(url, scrollToId, isPopState) {
    var grid = document.querySelector('.ka-blog-article-grid');
    var pagination = document.querySelector('.ka-blog-pagination');
    var filterBar = document.querySelector('.ka-blog-filter-bar');
    var breadcrumbWrap = document.querySelector('.theme-header-custom__breadcrumbs-wrap');
    
    if (grid) grid.style.opacity = '0.35';
    if (pagination) pagination.style.opacity = '0.35';
    if (filterBar) filterBar.style.opacity = '0.35';
    if (breadcrumbWrap) breadcrumbWrap.style.opacity = '0.35';

    fetch(url)
      .then(function (response) {
        if (!response.ok) throw new Error('Network response not ok');
        return response.text();
      })
      .then(function (html) {
        var parser = new DOMParser();
        var doc = parser.parseFromString(html, 'text/html');
        
        var newGrid = doc.querySelector('.ka-blog-article-grid');
        var newPagination = doc.querySelector('.ka-blog-pagination');
        var newFilterBar = doc.querySelector('.ka-blog-filter-bar');
        var newBreadcrumbWrap = doc.querySelector('.theme-header-custom__breadcrumbs-wrap');
        
        if (grid && newGrid) {
          grid.innerHTML = newGrid.innerHTML;
        } else if (grid && !newGrid) {
          grid.innerHTML = '';
        }
        
        if (pagination && newPagination) {
          pagination.innerHTML = newPagination.innerHTML;
          pagination.style.display = 'flex';
        } else if (pagination) {
          pagination.innerHTML = '';
          pagination.style.display = 'none';
        } else if (!pagination && newPagination) {
          var pagContainer = document.createElement('nav');
          pagContainer.className = 'ka-blog-pagination';
          pagContainer.setAttribute('aria-label', 'Blog pagination');
          pagContainer.innerHTML = newPagination.innerHTML;
          grid.parentNode.insertBefore(pagContainer, grid.nextSibling);
        }
        
        if (filterBar && newFilterBar) {
          filterBar.innerHTML = newFilterBar.innerHTML;
        }
        
        if (breadcrumbWrap && newBreadcrumbWrap) {
          breadcrumbWrap.innerHTML = newBreadcrumbWrap.innerHTML;
          breadcrumbWrap.style.display = newBreadcrumbWrap.style.display;
        }
        
        if (grid) grid.style.opacity = '1';
        
        var currentPagination = document.querySelector('.ka-blog-pagination');
        if (currentPagination) currentPagination.style.opacity = '1';
        
        if (filterBar) filterBar.style.opacity = '1';
        if (breadcrumbWrap) breadcrumbWrap.style.opacity = '1';
        
        if (!isPopState) {
          history.pushState(null, '', url);
        }
        
        if (scrollToId) {
          var targetEl = document.getElementById(scrollToId);
          if (targetEl) {
            var headerHeight = parseInt(
              getComputedStyle(document.documentElement).getPropertyValue('--header-height')
            ) || 60;
            var subnav = document.querySelector('.ka-blog-subnav');
            var subnavHeight = subnav ? subnav.offsetHeight : 50;
            
            var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
            var offsetPosition = targetPosition - headerHeight - subnavHeight - 20;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }
      })
      .catch(function (err) {
        console.error('AJAX Load failed:', err);
        window.location.href = url;
      });
  }

  function initAjaxFiltering() {
    document.addEventListener('click', function (e) {
      var target = e.target;
      var isFilterLink = target.closest('.ka-blog-filter-bar a');
      var isPaginationLink = target.closest('.ka-blog-pagination a');
      
      if (!isFilterLink && !isPaginationLink) return;
      
      var link = isFilterLink || isPaginationLink;
      var url = link.getAttribute('href');
      if (!url) return;
      
      e.preventDefault();
      
      var scrollToId = null;
      if (isFilterLink) {
        scrollToId = 'articles';
      } else if (isPaginationLink) {
        if (url.indexOf('#articles') !== -1) {
          scrollToId = 'articles';
        } else if (url.indexOf('#latest') !== -1) {
          scrollToId = 'latest';
        } else {
          scrollToId = 'latest';
        }
      }
      
      loadAjaxContent(url, scrollToId, false);
    });

    window.addEventListener('popstate', function () {
      loadAjaxContent(window.location.href, null, true);
    });
  }

  // ============================================================
  // INIT — Run all on DOMContentLoaded
  // ============================================================
  function init() {
    initSubnav();
    initArticleTOC();
    initFAQ();
    initReadTime();
    initTopicCarousel();
    initAjaxFiltering();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
