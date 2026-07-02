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
    var subnavContainers = document.querySelectorAll('.ka-blog-subnav, .ka-blog-breadcrumb-subnav');
    if (subnavContainers.length === 0) return;

    var links = [];
    subnavContainers.forEach(function (container) {
      container.querySelectorAll('a[href*="#"]').forEach(function (link) {
        links.push(link);
      });
    });

    var isScrollLocked = false;

    links.forEach(function (link) {
      link.addEventListener('click', function (e) {
        var hash = link.getAttribute('href');
        if (!hash) return;

        var hashIndex = hash.indexOf('#');
        if (hashIndex === -1) return;

        var targetId = hash.substring(hashIndex + 1);
        var target = document.getElementById(targetId);
        if (!target) return;

        e.preventDefault();

        isScrollLocked = true;

        var headerHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-height')
        ) || 60;

        var breadcrumbsWrap = document.querySelector('.theme-header-custom__breadcrumbs-wrap');
        var subnavHeight = breadcrumbsWrap ? breadcrumbsWrap.offsetHeight : 50;

        var targetPosition =
          target.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = targetPosition - headerHeight - subnavHeight - 20;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        var targetHref = link.getAttribute('href');
        links.forEach(function (l) {
          if (l.getAttribute('href') === targetHref) {
            l.classList.add('active');
          } else {
            l.classList.remove('active');
          }
        });

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
        var existing = sections.find(function (s) { return s.target === target; });
        if (existing) {
          existing.links.push(link);
        } else {
          sections.push({
            links: [link],
            target: target
          });
        }
      }
    });

    function updateActiveLink() {
      if (isScrollLocked) return;

      var scrollPos = window.scrollY || window.pageYOffset;
      var headerHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--header-height')
      ) || 60;
      var breadcrumbsWrap = document.querySelector('.theme-header-custom__breadcrumbs-wrap');
      var subnavHeight = breadcrumbsWrap ? breadcrumbsWrap.offsetHeight : 50;
      var threshold = headerHeight + subnavHeight + 25;

      var activeSection = null;
      var maxVisibleHeight = 0;

      sections.forEach(function (section) {
        var rect = section.target.getBoundingClientRect();
        var visibleTop = Math.max(rect.top, threshold);
        var visibleBottom = Math.min(rect.bottom, window.innerHeight);
        var visibleHeight = 0;
        if (visibleTop < visibleBottom) {
          visibleHeight = visibleBottom - visibleTop;
        }

        if (visibleHeight > maxVisibleHeight) {
          maxVisibleHeight = visibleHeight;
          activeSection = section;
        }
      });

      // Fallback for top of page
      if (scrollPos < 100 && sections.length > 0) {
        links.forEach(function (l) {
          if (l.getAttribute('href') === '#overview') {
            l.classList.add('active');
          } else {
            l.classList.remove('active');
          }
        });
        return;
      }

      if (activeSection) {
        links.forEach(function (l) {
          l.classList.remove('active');
        });
        activeSection.links.forEach(function (l) {
          l.classList.add('active');
        });
      }
    }

    window.addEventListener('scroll', updateActiveLink);
    window.addEventListener('load', function () {
      setTimeout(updateActiveLink, 100);
    });
    updateActiveLink();
  }

  // ============================================================
  // 2. ARTICLE TOC — Build from headings, desktop active tracking,
  //    mobile accordion toggle
  // ============================================================
  function initArticleTOC() {
    var articleContent = document.querySelector('.ka-article-content');
    if (!articleContent) return;

    var rawHeadings = articleContent.querySelectorAll('.ka-article-body h2, .ka-article-body h3');
    var headings = Array.prototype.slice.call(rawHeadings).filter(function (heading) {
      if (heading.closest('.ka-ingredients-container') || heading.closest('.ka-ingredient-card')) {
        return false;
      }
      var text = heading.textContent.toLowerCase().trim();
      if (text.indexOf('try this today') > -1 || 
          text.indexOf('key ayurvedic ingredients') > -1 || 
          text.indexOf('ayurveda glossary') > -1 || 
          text.indexOf('words to know') > -1 ||
          text.indexOf('faq') > -1) {
        return false;
      }
      return true;
    });
    var sidebarToc = document.querySelector('.ka-article-sidebar');
    var mobileToc = document.querySelector('.ka-article-toc-mobile');

    // Ensure all headings have IDs dynamically if missing and avoid duplicate IDs
    var seenIds = {};
    headings.forEach(function (heading, index) {
      if (!heading.id) {
        var slug = heading.textContent
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
        if (!slug) {
          slug = 'heading';
        }
        var uniqueSlug = slug;
        var count = 1;
        while (seenIds[uniqueSlug] || document.getElementById(uniqueSlug)) {
          uniqueSlug = slug + '-' + count;
          count++;
        }
        heading.id = uniqueSlug;
        seenIds[uniqueSlug] = true;
      } else {
        seenIds[heading.id] = true;
      }
    });

    if (!headings.length) {
      if (sidebarToc) sidebarToc.style.display = 'none';
      if (mobileToc) mobileToc.style.display = 'none';
      return;
    }

    var isTOCScrollLocked = false;
    var tocLinks = [];
    var mobileTocLinks = [];

    // Build TOC links from headings (for sidebar and mobile)
    function buildTocLinks(container, listSelector) {
      var list = container.querySelector(listSelector);
      if (!list) return;

      // Only build if the list is empty (avoid double-building on dynamic content)
      if (list.children.length > 0) return;

      headings.forEach(function (heading) {
        var text = heading.textContent.trim();
        if (!text) return;

        // Capitalize the first letter of the heading text
        var capitalizedText = text.charAt(0).toUpperCase() + text.slice(1);

        var li = document.createElement('li');
        var a = document.createElement('a');
        a.textContent = capitalizedText;
        a.href = '#' + heading.id;
        a.addEventListener('click', function (e) {
          e.preventDefault();

          // Lock scrollspy updates during smooth scroll
          isTOCScrollLocked = true;

          // Update active highlights immediately
          var targetHref = '#' + heading.id;
          if (tocLinks && tocLinks.length) {
            tocLinks.forEach(function (link) {
              if (link.getAttribute('href') === targetHref) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }
          if (mobileTocLinks && mobileTocLinks.length) {
            mobileTocLinks.forEach(function (link) {
              if (link.getAttribute('href') === targetHref) {
                link.classList.add('active');
              } else {
                link.classList.remove('active');
              }
            });
          }

          scrollToHeading(heading);

          setTimeout(function () {
            isTOCScrollLocked = false;
          }, 1000);

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
      tocLinks = sidebarToc.querySelectorAll('a[href^="#"]');
    }

    if (mobileToc) {
      buildTocLinks(mobileToc, '.ka-article-toc-mobile__list');
      mobileTocLinks = mobileToc.querySelectorAll('a[href^="#"]');

      var toggle = mobileToc.querySelector('.ka-article-toc-mobile__toggle');
      var content = mobileToc.querySelector('.ka-article-toc-mobile__content');
      if (toggle && content) {
        toggle.addEventListener('click', function () {
          var expanded = toggle.getAttribute('aria-expanded') === 'true';
          toggle.setAttribute('aria-expanded', String(!expanded));
          if (!expanded) {
            content.classList.add('is-open');
            content.style.maxHeight = content.scrollHeight + 'px';
            content.style.paddingBottom = '16px';
          } else {
            content.style.maxHeight = '0px';
            content.style.paddingBottom = '0px';
            setTimeout(function () {
              if (toggle.getAttribute('aria-expanded') === 'false') {
                content.classList.remove('is-open');
              }
            }, 350);
          }
        });
      }
    }

    // Desktop active heading tracking via IntersectionObserver
    if ('IntersectionObserver' in window) {
      // Highlight first link as active by default
      if (tocLinks.length > 0) tocLinks[0].classList.add('active');
      if (mobileTocLinks.length > 0) mobileTocLinks[0].classList.add('active');

      var observer = new IntersectionObserver(
        function (entries) {
          if (isTOCScrollLocked) return;
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

    // Initialize the Niagara Scrubber for mobile devices
    if (headings.length > 0) {
      initNiagaraScrubber(headings);
    }
  }

  function initNiagaraScrubber(headings) {
    var bar = document.getElementById('kaScrubberBar');
    var track = document.getElementById('kaScrubberNumsTrack');
    var bubble = document.getElementById('kaScrubberBubble');
    
    if (!bar || !track || !bubble) return;
    
    track.innerHTML = '';
    
    headings.forEach(function (heading, index) {
      var idxNum = String(index + 1).padStart(2, '0');
      var barSpan = document.createElement('span');
      barSpan.textContent = idxNum;
        barSpan.setAttribute('data-index', index);
      track.appendChild(barSpan);
    });
    
    var barSpans = track.querySelectorAll('span');
    var totalItems = headings.length;
    var isDragging = false;
    var activeIdx = -1;
    var lastShiftX = -1;
    
    function highlightItem(index, shiftX) {
      shiftX = shiftX || 0;
      if (index === activeIdx && shiftX === lastShiftX) return;
      activeIdx = index;
      lastShiftX = shiftX;
      
      barSpans.forEach(function (span, i) {
        var diff = Math.abs(i - index);
        if (diff === 0) {
          span.style.transform = 'translateX(' + (-36 - shiftX) + 'px) scale(3.0)';
          span.style.color = 'var(--ka-green)';
          span.style.backgroundColor = 'transparent';
          span.style.opacity = '1';
          span.classList.add('active');
        } else if (diff === 1) {
          span.style.transform = 'translateX(' + (-20 - shiftX * 0.5) + 'px) scale(1.8)';
          span.style.color = 'var(--ka-green)';
          span.style.backgroundColor = 'transparent';
          span.style.opacity = '0.6';
          span.classList.remove('active');
        } else if (diff === 2) {
          span.style.transform = 'translateX(' + (-8 - shiftX * 0.2) + 'px) scale(1.2)';
          span.style.color = 'var(--ka-green)';
          span.style.backgroundColor = 'transparent';
          span.style.opacity = '0.4';
          span.classList.remove('active');
        } else {
          span.style.transform = 'translateX(0) scale(1)';
          span.style.color = 'var(--ka-green)';
          span.style.backgroundColor = 'transparent';
          span.style.opacity = '0.4';
          span.classList.remove('active');
        }
      });
      
      if (headings[index]) {
        var bubbleNum = bubble.querySelector('.bubble-num');
        var bubbleTitle = bubble.querySelector('.bubble-title');
        
        if (bubbleNum) bubbleNum.textContent = String(index + 1).padStart(2, '0');
        if (bubbleTitle) bubbleTitle.textContent = headings[index].textContent.trim();
        
        var activeSpan = barSpans[index];
        if (activeSpan) {
          var rect = activeSpan.getBoundingClientRect();
          bubble.style.top = (rect.top + (rect.height / 2)) + 'px';
        }
      }
    }
    
    function handleDragStart() {
      isDragging = true;
      bar.classList.add('is-active');
      bubble.classList.add('is-active');
      var wrapper = document.querySelector('.ka-blog-wrapper');
      if (wrapper) {
        wrapper.classList.add('ka-bg-blurred');
      }
    }
    
    function handleDragMove(e) {
      if (!isDragging) return;
      
      var touch = e.touches[0];
      var touchY = touch.clientY;
      var touchX = touch.clientX;
      
      // Calculate how far left the user has dragged from the right edge
      var dragLeft = Math.max(0, window.innerWidth - touchX);
      var maxDragLeft = window.innerWidth / 3; // Cap shift at 1/3rd of the screen width
      var shiftX = Math.min(dragLeft, maxDragLeft);
      
      var trackRect = track.getBoundingClientRect();
      var relativeY = touchY - trackRect.top;
      var percentage = Math.max(0, Math.min(1, relativeY / trackRect.height));
      var index = Math.floor(percentage * totalItems);
      if (index >= totalItems) index = totalItems - 1;
      if (index < 0) index = 0;
      
      highlightItem(index, shiftX);
      e.preventDefault();
    }
    
    function handleDragEnd() {
      if (!isDragging) return;
      isDragging = false;
      
      bar.classList.remove('is-active');
      bubble.classList.remove('is-active');
      var wrapper = document.querySelector('.ka-blog-wrapper');
      if (wrapper) {
        wrapper.classList.remove('ka-bg-blurred');
      }
      
      var targetIndex = activeIdx;
      
      // Reset transforms
      barSpans.forEach(function (span) {
        span.style.transform = '';
        span.style.color = '';
        span.style.backgroundColor = '';
        span.style.opacity = '';
        span.classList.remove('active');
      });
      activeIdx = -1;
      lastShiftX = -1;
      
      if (targetIndex >= 0 && targetIndex < totalItems && headings[targetIndex]) {
        var targetHeading = headings[targetIndex];
        
        var headerHeight = parseInt(
          getComputedStyle(document.documentElement).getPropertyValue('--header-height')
        ) || 60;
        
        var breadcrumbsWrap = document.querySelector('.theme-header-custom__breadcrumbs-wrap');
        var subnavHeight = breadcrumbsWrap ? breadcrumbsWrap.offsetHeight : 50;
        
        var targetPosition = targetHeading.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = targetPosition - headerHeight - subnavHeight - 24;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    
    bar.addEventListener('touchstart', function (e) {
      handleDragStart();
      handleDragMove(e);
    }, { passive: false });
    
    bar.addEventListener('touchmove', handleDragMove, { passive: false });
    bar.addEventListener('touchend', handleDragEnd);
    bar.addEventListener('touchcancel', handleDragEnd);
    
    var helpBtn = document.querySelector('.ka-article-toc-mobile__help-btn');
    var tutorialOverlay = document.getElementById('kaTutorialOverlay');
    
    if (helpBtn && tutorialOverlay) {
      helpBtn.addEventListener('click', function () {
        var originalScrollY = window.pageYOffset || document.documentElement.scrollTop;
        tutorialOverlay.classList.add('is-active');
        
        var mockHand = tutorialOverlay.querySelector('.ka-niagara-tutorial-hand');
        if (mockHand) {
          mockHand.style.animation = 'none';
          void mockHand.offsetWidth;
          mockHand.style.animation = 'kaTutorialSwipe 3s ease-in-out forwards';
        }
        
        var mockTitleEl = tutorialOverlay.querySelector('.mock-title');
        var mockNumEl = tutorialOverlay.querySelector('.mock-num');
        
        // Find actual article sections or fall back to defaults
        var articleSections = document.querySelectorAll('section[id^="sec-"], section[id^="key-"], .ka-article-faq');
        var mockData = [
          { title: "Introduction", num: "01" },
          { title: "Key Takeaways", num: "02" },
          { title: "Summary", num: "03" }
        ];
        
        if (articleSections.length >= 3) {
          mockData = [];
          articleSections.forEach(function (sec, idx) {
            if (idx < 3) {
              var heading = sec.querySelector('h2, h3')?.textContent?.trim() || "Section";
              if (heading.length > 22) heading = heading.substring(0, 19) + "...";
              var numStr = (idx + 1) < 10 ? "0" + (idx + 1) : "" + (idx + 1);
              mockData.push({ title: heading, num: numStr });
            }
          });
        }
        
        // Initial state
        if (mockTitleEl && mockNumEl && mockData[0]) {
          mockTitleEl.textContent = mockData[0].title;
          mockNumEl.textContent = mockData[0].num;
        }
        
        // Frame updates to simulate drag/scrub progress
        setTimeout(function () {
          if (mockTitleEl && mockNumEl && mockData[1]) {
            mockTitleEl.textContent = mockData[1].title;
            mockNumEl.textContent = mockData[1].num;
          }
        }, 1200);
        
        setTimeout(function () {
          if (mockTitleEl && mockNumEl && mockData[2]) {
            mockTitleEl.textContent = mockData[2].title;
            mockNumEl.textContent = mockData[2].num;
          }
        }, 2200);
        
        // Auto scroll demo: scroll to bottom of article, then back to original position
        setTimeout(function () {
          var targetBottom = Math.min(
            document.documentElement.scrollHeight - window.innerHeight,
            (document.querySelector('.ka-article-content')?.offsetTop || 0) + (document.querySelector('.ka-article-content')?.offsetHeight || 0)
          );
          window.scrollTo({ top: targetBottom, behavior: 'smooth' });
        }, 500);

        setTimeout(function () {
          window.scrollTo({ top: originalScrollY, behavior: 'smooth' });
        }, 2200);

        setTimeout(function () {
          tutorialOverlay.classList.remove('is-active');
        }, 3600);
      });
    }
  }

  // Scroll Progress Bar Tracker
  function initMobileScrollProgressBar() {
    var bar = document.querySelector('.ka-mobile-scroll-progress-bar');
    var article = document.querySelector('.ka-article-content');
    var comments = document.getElementById('comments') || document.querySelector('.ka-blog-container:last-of-type');
    
    if (!bar || !article) return;
    
    window.addEventListener('scroll', function () {
      if (window.innerWidth >= 980) return;
      
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var startY = article.offsetTop;
      var endY = comments ? comments.offsetTop : (article.offsetTop + article.offsetHeight);
      
      var totalScrollable = endY - startY - window.innerHeight;
      if (totalScrollable <= 0) {
        bar.style.width = '0%';
        return;
      }
      
      var scrolled = scrollTop - startY;
      var percentage = (scrolled / totalScrollable) * 100;
      percentage = Math.max(0, Math.min(100, percentage));
      
      bar.style.width = percentage + '%';
    });
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

    var details = faqSection.querySelectorAll('details');
    details.forEach(function (detail) {
      var summary = detail.querySelector('summary');
      var answer = detail.querySelector('.ka-faq-answer');
      if (!summary || !answer) return;

      // Set initial aria state
      summary.setAttribute(
        'aria-expanded',
        detail.hasAttribute('open') ? 'true' : 'false'
      );

      summary.addEventListener('click', function (e) {
        e.preventDefault();
        
        var isOpen = detail.hasAttribute('open');
        
        if (!isOpen) {
          detail.setAttribute('open', 'true');
          summary.setAttribute('aria-expanded', 'true');
          
          answer.style.height = 'auto';
          var targetHeight = answer.offsetHeight;
          
          answer.style.height = '0px';
          answer.style.opacity = '0';
          answer.style.overflow = 'hidden';
          answer.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
          
          answer.offsetHeight; // force reflow
          
          answer.style.height = targetHeight + 'px';
          answer.style.opacity = '1';
          
          setTimeout(function () {
            if (detail.hasAttribute('open')) {
              answer.style.removeProperty('height');
              answer.style.removeProperty('opacity');
              answer.style.removeProperty('overflow');
              answer.style.removeProperty('transition');
            }
          }, 300);
        } else {
          summary.setAttribute('aria-expanded', 'false');
          var currentHeight = answer.offsetHeight;
          
          answer.style.height = currentHeight + 'px';
          answer.style.overflow = 'hidden';
          answer.style.transition = 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease';
          answer.style.opacity = '1';
          
          answer.offsetHeight; // force reflow
          
          answer.style.height = '0px';
          answer.style.opacity = '0';
          
          setTimeout(function () {
            if (summary.getAttribute('aria-expanded') === 'false') {
              detail.removeAttribute('open');
              answer.style.removeProperty('height');
              answer.style.removeProperty('opacity');
              answer.style.removeProperty('overflow');
              answer.style.removeProperty('transition');
            }
          }, 300);
        }
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

    var container = outer.querySelector('.ka-blog-topic-carousel-container');
    var decks = outer.querySelectorAll('.ka-blog-topic-deck');
    var dots = outer.querySelectorAll('.ka-blog-topic-dot');
    var prevBtn = outer.querySelector('.ka-blog-topic-arrow--prev');
    var nextBtn = outer.querySelector('.ka-blog-topic-arrow--next');
    if (!container || !decks.length) return;

    function updateActiveState() {
      var scrollLeft = container.scrollLeft;
      var activeIndex = 0;
      var minDiff = Infinity;
      decks.forEach(function (deck, idx) {
        var diff = Math.abs(scrollLeft - deck.offsetLeft);
        if (diff < minDiff) {
          minDiff = diff;
          activeIndex = idx;
        }
      });
      var decksCount = decks.length;

      dots.forEach(function (dot, idx) {
        if (idx === activeIndex) {
          dot.classList.add('active');
        } else {
          dot.classList.remove('active');
        }
      });

      decks.forEach(function (deck, idx) {
        if (idx === activeIndex) {
          deck.classList.add('active');
        } else {
          deck.classList.remove('active');
        }
      });

      // Update arrows disabled state
      if (prevBtn) {
        prevBtn.disabled = (activeIndex === 0);
      }
      if (nextBtn) {
        nextBtn.disabled = (activeIndex === decksCount - 1);
      }
    }

    function scrollToTopicsTopOnMobile() {
      if (window.innerWidth < 980) {
        var topicsSec = document.getElementById('topics');
        if (topicsSec) {
          var headerHeight = parseInt(
            getComputedStyle(document.documentElement).getPropertyValue('--header-height')
          ) || 60;
          var targetPosition = topicsSec.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;
          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });
        }
      }
    }

    // Scroll listener on container
    container.addEventListener('scroll', updateActiveState);

    // Initial check
    setTimeout(updateActiveState, 100);

    // Dot clicks
    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        var index = parseInt(dot.getAttribute('data-index'));
        var targetDeck = decks[index];
        if (targetDeck) {
          container.scrollTo({
            left: targetDeck.offsetLeft,
            behavior: 'smooth'
          });
        }
      });
    });

    // Arrow clicks
    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var scrollLeft = container.scrollLeft;
        var activeIndex = 0;
        var minDiff = Infinity;
        decks.forEach(function (deck, idx) {
          var diff = Math.abs(scrollLeft - deck.offsetLeft);
          if (diff < minDiff) {
            minDiff = diff;
            activeIndex = idx;
          }
        });
        var targetIndex = Math.max(0, activeIndex - 1);
        var targetDeck = decks[targetIndex];
        if (targetDeck) {
          container.scrollTo({
            left: targetDeck.offsetLeft,
            behavior: 'smooth'
          });
          scrollToTopicsTopOnMobile();
        }
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var scrollLeft = container.scrollLeft;
        var activeIndex = 0;
        var minDiff = Infinity;
        decks.forEach(function (deck, idx) {
          var diff = Math.abs(scrollLeft - deck.offsetLeft);
          if (diff < minDiff) {
            minDiff = diff;
            activeIndex = idx;
          }
        });
        var targetIndex = Math.min(decks.length - 1, activeIndex + 1);
        var targetDeck = decks[targetIndex];
        if (targetDeck) {
          container.scrollTo({
            left: targetDeck.offsetLeft,
            behavior: 'smooth'
          });
          scrollToTopicsTopOnMobile();
        }
      });
    }

    // Handle resize
    window.addEventListener('resize', updateActiveState);
  }

  // ============================================================
  // 5.1. HERO SEARCH & EXPLORE TOPICS REDIRECT
  // ============================================================
  function initHeroSearchExploreRedirect() {
    var exploreBtn = document.querySelector('.ka-blog-hero-actions a[href="#topics"]');
    var searchInput = document.querySelector('.ka-blog-hero-search input[name="q"]');
    if (!exploreBtn || !searchInput) return;

    exploreBtn.addEventListener('click', function (e) {
      var query = searchInput.value.trim();
      if (query) {
        e.preventDefault();
        var scopedQuery = 'title:(' + query + ') OR body:(' + query + ') OR tag:(' + query + ')';
        window.location.href = '/search?type=article&q=' + encodeURIComponent(scopedQuery) + '&options[prefix]=last';
      }
    });
  }

  // ============================================================
  // 5.2. SCOPED SEARCH INTERCEPTOR (Title, Description, or Tags/Topics)
  // ============================================================
  function initScopedSearch() {
    document.addEventListener('submit', function(e) {
      var form = e.target;
      if (form && (form.classList.contains('search') || form.classList.contains('ka-blog-hero-search') || form.action.includes('/search'))) {
        var qInput = form.querySelector('input[name="q"]');
        if (qInput && qInput.value.trim()) {
          var query = qInput.value.trim();
          if (!query.includes('title:(') && !query.includes('body:(') && query !== '*') {
            e.preventDefault();
            var scopedQuery = 'title:(' + query + ') OR body:(' + query + ') OR tag:(' + query + ')';
            var searchUrl = form.action || '/search';
            var url = new URL(searchUrl, window.location.origin);
            url.searchParams.set('q', scopedQuery);
            url.searchParams.set('options[prefix]', 'last');
            var inputs = form.querySelectorAll('input[type="hidden"]');
            inputs.forEach(function(input) {
              if (input.name !== 'q') {
                url.searchParams.set(input.name, input.value);
              }
            });
            window.location.href = url.toString();
          }
        }
      }
    });
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
  // 7. FLOATING CTA — Hide when approaching the footer
  // ============================================================
  function initFloatingCTA() {
    var cta = document.querySelector('.ka-blog-floating-cta');
    var footer = document.querySelector('.theme-footer');
    if (!cta || !footer) return;

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            cta.classList.add('ka-blog-floating-cta--hidden');
          } else {
            cta.classList.remove('ka-blog-floating-cta--hidden');
          }
        });
      }, {
        root: null,
        rootMargin: '0px 0px 80px 0px',
        threshold: 0
      });
      observer.observe(footer);
    } else {
      var checkVisibility = function () {
        var footerRect = footer.getBoundingClientRect();
        if (footerRect.top < window.innerHeight + 80) {
          cta.classList.add('ka-blog-floating-cta--hidden');
        } else {
          cta.classList.remove('ka-blog-floating-cta--hidden');
        }
      };
      window.addEventListener('scroll', checkVisibility);
      window.addEventListener('resize', checkVisibility);
      checkVisibility();
    }
  }

  // ============================================================
  // 7.1. ASK GURUJI CHATBOT WIDGET LOGIC
  // ============================================================
  function initChatbot() {
    var trigger = document.getElementById('ka-chatbot-trigger');
    var windowEl = document.getElementById('ka-chatbot-window');
    var messagesContainer = document.getElementById('ka-chatbot-messages');
    var form = document.getElementById('ka-chatbot-form');
    var input = document.getElementById('ka-chatbot-input');

    if (!trigger || !windowEl || !messagesContainer || !form || !input) return;

    var backupQuestions = [
      "What is Agni?",
      "Cooling recipes for Pitta",
      "How to balance Vata?",
      "How to balance Kapha?",
      "What is Ashwagandha?",
      "How does stress affect health?",
      "What is tongue scraping?",
      "Is warm milk good before bed?",
      "What are viruddha ahara?",
      "What is Dinacharya daily routine?",
      "What is Ojas in Ayurveda?",
      "How to improve appetite?",
      "Is ghee good for cooking?",
      "What is Triphala?",
      "How to detox at home?",
      "How to care for joints?",
      "What herbs support memory?",
      "What is Abhyanga massage?",
      "How to prevent dry skin?",
      "How to grow hair faster?",
      "What causes morning grogginess?",
      "How to treat acidity naturally?",
      "What are seasonal guidelines?",
      "Is fasting recommended?",
      "What is panchakarma?",
      "How to practice mindful eating?"
    ];
    var backupIndex = 0;

    var botResponses = {
      "what is this page about?": "This page is the Kerala Ayurveda Wellness Journal, a dedicated portal for classical Ayurvedic wisdom, custom diet guidelines, care paths, and holistic health updates.",
      "how useful is it?": "It provides verified Ayurvedic guidelines, expert-reviewed articles, dynamic wellness topics, and self-care routines to help you achieve long-term balance.",
      "how can i improve sleep?": "For restful sleep, favor a calming evening routine: massage your feet with warm oil, avoid screen time after 9 PM, and drink a cup of warm milk with nutmeg.",
      "i want to speak with a vaidya.": "We can connect you with an expert Ayurvedic Vaidya for a personalized wellness plan. WhatsApp consultations are opening soon!",
      "what is agni?": "Agni is the digestive fire. To steady your agni, eat warm cooked meals at consistent times daily, and try a pre-meal slice of fresh ginger with rock salt.",
      "cooling recipes for pitta": "To soothe Pitta (heat), favor sweet ripe fruits, coriander, fennel, and coconut water. Limit hot spices, chillies, sour pickles, and fried foods.",
      "how to balance vata?": "Vata dosha represents air and space. When out of balance, it brings dryness, coldness, and anxiety. Favour warm, moist, grounding foods, and regular routines.",
      "how to balance kapha?": "Kapha dosha represents earth and water. When out of balance, it brings heaviness, congestion, and lethargy. Favour warm, light, spicy foods and active exercise.",
      "what is ashwagandha?": "Ashwagandha is a renowned adaptogen that supports energy levels, reduces stress, and calms the nervous system.",
      "how does stress affect health?": "Stress raises cortisol and disrupts Vata dosha, leading to poor digestion, sleep issues, and fatigue. Meditation and herbal support help restore balance.",
      "what is tongue scraping?": "Tongue scraping (Jihwa Nirlekhana) in the morning removes toxins (Ama), improves taste perception, and supports digestive and oral health.",
      "is warm milk good before bed?": "Yes! Warm milk acts as a natural sedative. Adding a pinch of nutmeg or cardamom aids digestion and sleep quality.",
      "what are viruddha ahara?": "Viruddha Ahara refers to incompatible food combinations (e.g., milk with fruit or fish) that disrupt digestion and accumulate toxins.",
      "what is dinacharya daily routine?": "Dinacharya is the daily Ayurvedic routine, including early waking, tongue scraping, self-massage (Abhyanga), and structured meal times to align with nature.",
      "what is ojas in ayurveda?": "Ojas is the vital energy or essence of all bodily tissues, representing immunity, strength, vigor, and overall radiant health.",
      "how to improve appetite?": "Improve your appetite by drinking warm ginger-water, chewing ginger with salt before meals, and eating only when your previous meal is digested.",
      "is ghee good for cooking?": "Yes! Ghee (clarified butter) has a high smoke point, stimulates Agni (digestive fire), nourishes tissues, and improves absorption of fat-soluble nutrients.",
      "what is triphala?": "Triphala is a classical formula of three fruits (Amalaki, Bibhitaki, Haritaki) that acts as a gentle bowel tonic and rich antioxidant.",
      "how to detox at home?": "Do a gentle home detox by drinking warm water, sipping cumin-coriander-fennel tea, and eating light, warm Kitchari for a day or two.",
      "how to care for joints?": "Nourish your joints by massaging them with warm sesame or Mahanarayan oil, keeping active, and avoiding dry, cold foods that aggravate Vata.",
      "what herbs support memory?": "Medhya Rasayana (cognitive herbs) like Brahmi, Shankhapushpi, and Gotu Kola are highly praised for memory, focus, and brain health.",
      "what is abhyanga massage?": "Abhyanga is self-massage using warm herbal oil. It calms the nervous system, supports skin tone, increases circulation, and grounds Vata.",
      "how to prevent dry skin?": "Address dry skin from within: drink warm water, consume healthy fats (ghee, olive oil), and perform daily oil massage (Abhyanga).",
      "how to grow hair faster?": "Promote hair growth by oiling the scalp with Bhringraj or coconut oil, eating nutrient-rich foods, and reducing stress to balance Pitta.",
      "what causes morning grogginess?": "Morning grogginess is often due to Ama (undigested waste) or late dinners. Try eating a light dinner by 7 PM and sleeping before 10 PM.",
      "how to treat acidity naturally?": "Soothe acidity with cooling herbs like Amalaki, Shatavari, or licorice. Drink coconut water, and avoid spicy, fried, or sour foods.",
      "what are seasonal guidelines?": "Ayurvedic seasonal routine (Ritucharya) adjusts your diet and lifestyle to balance the environmental shifts in Vata, Pitta, and Kapha.",
      "is fasting recommended?": "Ayurveda recommends light fasting (sips of warm water or ginger tea) during congestion or low appetite to help burn toxins (Ama).",
      "what is panchakarma?": "Panchakarma is a deep Ayurvedic detoxification process of five therapies (like Vamana, Virechana, Basti) managed under medical supervision.",
      "how to practice mindful eating?": "Eat in a calm environment, chew your food thoroughly, avoid distractions like phones, and eat until you are about 75% full."
    };

    var greetingTriggered = false;

    // Toggle Chatbot Window
    function openChatbot() {
      windowEl.classList.remove('ka-chatbot-hidden');
      windowEl.setAttribute('aria-hidden', 'false');
      trigger.classList.add('is-open');
      trigger.innerHTML = '<span class="ka-close-x" style="font-size: 20px; font-weight: bold; line-height: 1;">✕</span>';
      input.focus();
      
      if (!greetingTriggered) {
        greetingTriggered = true;
        showTypingIndicator();
        setTimeout(function () {
          removeTypingIndicator();
          addMessage("Pranam! I am Guruji, your Ayurvedic guide. How can I help you find balance today?", 'bot');
        }, 1200);
      }
    }

    function closeChatbot() {
      windowEl.classList.add('ka-chatbot-hidden');
      windowEl.setAttribute('aria-hidden', 'true');
      trigger.classList.remove('is-open');
      trigger.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ka-chatbot-trigger-icon" style="margin-right: 8px; display: inline-block; vertical-align: middle;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg><span style="vertical-align: middle;">Ask Guruji</span>';
    }

    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      var isHidden = windowEl.classList.contains('ka-chatbot-hidden');
      if (isHidden) {
        openChatbot();
      } else {
        closeChatbot();
      }
    });

    // Close on clicking outside
    document.addEventListener('click', function (e) {
      if (!windowEl.classList.contains('ka-chatbot-hidden')) {
        if (!windowEl.contains(e.target) && !trigger.contains(e.target)) {
          closeChatbot();
        }
      }
    });

    // Scroll to bottom helper
    function scrollToBottom() {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Add message bubble
    function addMessage(text, sender) {
      var msgDiv = document.createElement('div');
      msgDiv.classList.add('ka-chatbot-message');
      msgDiv.classList.add('ka-chatbot-message-' + sender);
      
      var p = document.createElement('p');
      p.textContent = text;
      msgDiv.appendChild(p);
      
      // Insert before quick options if they exist
      var quickOpts = messagesContainer.querySelector('.ka-chatbot-quick-options');
      if (quickOpts) {
        messagesContainer.insertBefore(msgDiv, quickOpts);
      } else {
        messagesContainer.appendChild(msgDiv);
      }
      
      scrollToBottom();
    }

    // Simulate typing indicator
    function showTypingIndicator() {
      var bubble = document.createElement('div');
      bubble.classList.add('ka-chatbot-typing-bubble');
      bubble.id = 'ka-chatbot-typing-indicator';
      
      for (var i = 0; i < 3; i++) {
        var dot = document.createElement('div');
        dot.classList.add('ka-chatbot-typing-dot');
        bubble.appendChild(dot);
      }
      
      var quickOpts = messagesContainer.querySelector('.ka-chatbot-quick-options');
      if (quickOpts) {
        messagesContainer.insertBefore(bubble, quickOpts);
      } else {
        messagesContainer.appendChild(bubble);
      }
      scrollToBottom();
    }

    function removeTypingIndicator() {
      var indicator = document.getElementById('ka-chatbot-typing-indicator');
      if (indicator) {
        indicator.parentNode.removeChild(indicator);
      }
    }

    // Keyword responder mapping
    function getBotResponse(userMsg, isTyped) {
      if (isTyped) {
        return "We'll be live soon!";
      }

      var msg = userMsg.toLowerCase().trim();
      
      if (botResponses[msg]) {
        return botResponses[msg];
      }
      
      // Fallback searches
      if (msg.indexOf('sleep') > -1) {
        return botResponses["how can i improve sleep?"];
      }
      if (msg.indexOf('agni') > -1 || msg.indexOf('digest') > -1) {
        return botResponses["what is agni?"];
      }
      if (msg.indexOf('pitta') > -1) {
        return botResponses["cooling recipes for pitta"];
      }
      if (msg.indexOf('vaidya') > -1 || msg.indexOf('doctor') > -1 || msg.indexOf('speak') > -1) {
        return botResponses["i want to speak with a vaidya."];
      }
      
      return "Pranam! Ayurveda teaches us to seek balance through custom diet, herbs, and daily routines. Try selecting one of our quick questions for verified Ayurvedic guides.";
    }

    var isBotResponding = false;
    var chatbotQueue = [];

    // Process question helper
    function processQuestion(questionText, isTyped) {
      if (isBotResponding) {
        chatbotQueue.push({ text: questionText, isTyped: isTyped });
        addMessage(questionText, 'user');
        return;
      }

      isBotResponding = true;
      addMessage(questionText, 'user');
      showTypingIndicator();
      
      setTimeout(function () {
        removeTypingIndicator();
        var response = getBotResponse(questionText, isTyped);
        addMessage(response, 'bot');
        isBotResponding = false;
        
        if (chatbotQueue.length > 0) {
          var nextQ = chatbotQueue.shift();
          showTypingForQueue(nextQ.text, nextQ.isTyped);
        }
      }, 2000);
    }

    function showTypingForQueue(questionText, isTyped) {
      isBotResponding = true;
      showTypingIndicator();
      
      setTimeout(function () {
        removeTypingIndicator();
        var response = getBotResponse(questionText, isTyped);
        addMessage(response, 'bot');
        isBotResponding = false;
        
        if (chatbotQueue.length > 0) {
          var nextQ = chatbotQueue.shift();
          showTypingForQueue(nextQ.text, nextQ.isTyped);
        }
      }, 2000);
    }

    // Form submit handler
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      
      input.value = '';
      processQuestion(text, true);
    });

    // Quick option clicks
    messagesContainer.addEventListener('click', function (e) {
      if (e.target.classList.contains('ka-chatbot-option-btn')) {
        var question = e.target.getAttribute('data-question');
        if (question) {
          var siblings = Array.prototype.slice.call(e.target.parentNode.children);
          var btnIndex = siblings.indexOf(e.target);
          if (btnIndex >= 0 && btnIndex < 3) {
            if (backupQuestions.length > 0) {
              var nextQ = backupQuestions[backupIndex % backupQuestions.length];
              backupIndex++;
              e.target.textContent = nextQ;
              e.target.setAttribute('data-question', nextQ);
            }
          }
          processQuestion(question, false);
        }
      }
    });
  }


  // ============================================================
  // 9. TOC TOGGLE — Drop down and collapse sidebar Table of Contents
  // ============================================================
  function initTocToggle() {
    var toggle = document.querySelector('.ka-article-toc-toggle');
    var list = document.querySelector('.ka-article-sidebar__list');
    var icon = document.querySelector('.ka-article-toc-icon');
    var card = document.querySelector('.ka-article-toc-card');
    if (!toggle || !list || !icon) return;

    toggle.addEventListener('click', function () {
      var isCollapsed = list.classList.contains('ka-collapsed');
      if (isCollapsed) {
        list.classList.remove('ka-collapsed');
        if (card) card.classList.remove('toc-is-collapsed');
        icon.textContent = '▼';
        list.style.maxHeight = list.scrollHeight + 'px';
        setTimeout(function () {
          list.style.maxHeight = '';
        }, 300);
      } else {
        list.style.maxHeight = list.scrollHeight + 'px';
        // Force reflow
        list.offsetHeight;
        list.classList.add('ka-collapsed');
        if (card) card.classList.add('toc-is-collapsed');
        icon.textContent = '▲';
        list.style.maxHeight = '0px';
      }
    });
  }

  // ============================================================
  // 11. COMMENTS — Expanding composer, formatting, popup fields
  // ============================================================
  function initComments() {
    var textarea = document.getElementById('ka-comment-body');
    var composer = document.getElementById('ka-comment-composer');
    var container = document.querySelector('.ka-comment-textarea-container');
    var cancelBtn = document.querySelector('.ka-comment-btn-cancel');
    var nextBtn = document.querySelector('.ka-comment-btn-next');
    var popupCard = document.querySelector('.ka-comment-popup-card');
    var popupClose = document.querySelector('.ka-comment-popup-close');
    var formatBtns = document.querySelectorAll('.ka-comment-format-btn');

    if (!composer || !textarea || !container) return;

    var chatbotTrigger = document.getElementById('ka-chatbot-trigger');
    var authorInput = document.getElementById('ka-comment-author');
    var emailInput = document.getElementById('ka-comment-email');

    function hideChatbot() {
      if (window.innerWidth < 980 && chatbotTrigger) {
        chatbotTrigger.style.setProperty('display', 'none', 'important');
      }
    }

    function showChatbot() {
      if (chatbotTrigger) {
        chatbotTrigger.style.display = '';
      }
    }

    composer.addEventListener('focus', hideChatbot);
    if (authorInput) authorInput.addEventListener('focus', hideChatbot);
    if (emailInput) emailInput.addEventListener('focus', hideChatbot);

    function checkActiveFocus() {
      setTimeout(function() {
        if (
          document.activeElement !== composer &&
          document.activeElement !== authorInput &&
          document.activeElement !== emailInput &&
          !container.classList.contains('is-expanded')
        ) {
          showChatbot();
        }
      }, 150);
    }

    composer.addEventListener('blur', checkActiveFocus);
    if (authorInput) authorInput.addEventListener('blur', checkActiveFocus);
    if (emailInput) emailInput.addEventListener('blur', checkActiveFocus);

    // 1. Focus expansion, clicking container, & synchronization
    composer.addEventListener('focus', function () {
      container.classList.add('is-expanded');
      hideChatbot();
    });

    container.addEventListener('click', function (e) {
      // Focus the contenteditable composer if the user clicks inside the container box
      // but not on formatting or action buttons
      if (!e.target.closest('.ka-comment-controls') && !e.target.closest('.ka-comment-popup-card')) {
        composer.focus();
      }
    });

    composer.addEventListener('input', function () {
      textarea.value = composer.innerHTML;
    });

    // Helper to update bold/italic button active highlights
    function updateFormatStates() {
      try {
        formatBtns.forEach(function (btn) {
          var format = btn.getAttribute('data-format');
          if (document.queryCommandState && document.queryCommandState(format)) {
            btn.classList.add('is-active');
          } else {
            btn.classList.remove('is-active');
          }
        });
      } catch (err) {
        console.warn('Failed to query command state:', err);
      }
    }

    composer.addEventListener('keyup', updateFormatStates);
    composer.addEventListener('mouseup', updateFormatStates);
    document.addEventListener('selectionchange', function () {
      if (document.activeElement === composer) {
        updateFormatStates();
      }
    });

    // 2. Formatting Bold & Italic click events
    formatBtns.forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        composer.focus(); // Focus composer FIRST so selection is active in it
        var format = btn.getAttribute('data-format');
        document.execCommand(format, false, null);
        updateFormatStates();
        // Sync formatting results
        textarea.value = composer.innerHTML;
      });
    });

    // Helper to toggle empty box height when details popup opens/closes
    function updateEmptyBoxHeight() {
      var emptyBox = document.querySelector('.ka-article-comments-empty');
      if (!emptyBox) return;
      if (popupCard && !popupCard.classList.contains('ka-comment-popup-hidden')) {
        emptyBox.classList.add('popup-is-open');
      } else {
        emptyBox.classList.remove('popup-is-open');
      }
    }

    // 3. Cancel button action
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function (e) {
        e.preventDefault();
        composer.innerHTML = '';
        textarea.value = '';
        container.classList.remove('is-expanded');
        if (popupCard) popupCard.classList.add('ka-comment-popup-hidden');
        if (nextBtn) nextBtn.style.display = 'inline-block';
        updateEmptyBoxHeight();
        showChatbot();
      });
    }

    // 4. Next/Comment button action (triggers name/email popup)
    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.preventDefault();
        if (!composer.innerText.trim()) {
          composer.focus();
          return;
        }
        if (popupCard) {
          popupCard.classList.remove('ka-comment-popup-hidden');
          nextBtn.style.display = 'none';
          updateEmptyBoxHeight();
          popupCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    }

    // 5. Popup Close action
    if (popupClose) {
      popupClose.addEventListener('click', function (e) {
        e.preventDefault();
        if (popupCard) popupCard.classList.add('ka-comment-popup-hidden');
        if (nextBtn) nextBtn.style.display = 'inline-block';
        updateEmptyBoxHeight();
      });
    }

    // 6. Click outside to collapse if empty
    document.addEventListener('click', function (e) {
      if (!container.contains(e.target) && (!popupCard || !popupCard.contains(e.target))) {
        if (!composer.innerText.trim()) {
          container.classList.remove('is-expanded');
          if (popupCard) popupCard.classList.add('ka-comment-popup-hidden');
          if (nextBtn) nextBtn.style.display = 'inline-block';
          updateEmptyBoxHeight();
        }
      }
    });

    // 7. Auto-fade success note
    var successMsg = document.querySelector('.ka-form-success');
    if (successMsg) {
      setTimeout(function () {
        successMsg.style.transition = 'opacity 1s ease, transform 1s ease';
        successMsg.style.opacity = '0';
        successMsg.style.transform = 'translateY(-10px)';
        setTimeout(function () {
          successMsg.style.display = 'none';
        }, 1000);
      }, 5000);
    }
  }



  // ============================================================
  // PREMIUM SCROLL ACTIONS (Progress bar, Parallax, reveals)
  // ============================================================
  function initScrollAnimations() {
    // 1. Create and inject scroll progress bar if not exists
    var progressBar = document.querySelector('.ka-scroll-progress-bar');
    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.className = 'ka-scroll-progress-bar';
      document.body.appendChild(progressBar);
    }

    // 2. Track scroll to update progress bar width and apply parallax zoom to hero images
    var ticking = false;
    var heroImages = document.querySelectorAll('.ka-blog-hero__bg, .ka-blog-topic-hero__image-wrap img, .ka-blog-article-hero__image-wrap img');

    function updateScrollEffects() {
      // Update progress bar
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      var scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = scrollPercent + '%';

      // Parallax zoom for heroes
      heroImages.forEach(function (img) {
        var rect = img.getBoundingClientRect();
        if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
          var scrolledFromTop = window.pageYOffset;
          img.style.transform = 'translate3d(0, ' + (scrolledFromTop * 0.12) + 'px, 0) scale(' + (1 + scrolledFromTop * 0.00015) + ')';
        }
      });

      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(updateScrollEffects);
        ticking = true;
      }
    }, { passive: true });

    // First section reveal trigger based on viewport width:
    // - Desktop: Trigger as soon as scroll starts (> 5px)
    // - Mobile: Trigger when scrolled 20% from initial starting position
    window.addEventListener('scroll', function () {
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      
      // Immediate reveal for Key Takeaways and TOC elements on scroll start
      if (scrollTop > 5) {
        var sidebar = document.querySelector('.ka-article-sidebar');
        var mobileToc = document.querySelector('.ka-article-toc-mobile');
        var summaryCard = document.querySelector('.ka-article-summary-card');
        if (sidebar) sidebar.classList.add('is-visible');
        if (mobileToc) mobileToc.classList.add('is-visible');
        if (summaryCard) summaryCard.classList.add('is-visible');
      }

      if (window.innerWidth >= 980) {
        if (scrollTop > 5) {
          var firstSection = document.querySelector('.reveal-on-scroll');
          if (firstSection) firstSection.classList.add('is-visible');
        }
      } else {
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight > 0 && (scrollTop / docHeight) >= 0.20) {
          var firstSection = document.querySelector('.reveal-on-scroll');
          if (firstSection) firstSection.classList.add('is-visible');
        }
      }
    }, { passive: true });

    // Initial update
    updateScrollEffects();

    // 3. Scroll reveals via IntersectionObserver
    if ('IntersectionObserver' in window) {
      if (document.querySelector('.ka-blog-topic-hero') || window.location.pathname.indexOf('/tagged/') !== -1) {
        return;
      }
      var revealTargets = document.querySelectorAll(
        '.ka-blog-container section, ' +
        '.ka-blog-section, ' +
        '.ka-blog-section--tight, ' +
        '.ka-blog-topic-deck, ' +
        '.ka-blog-topic-hero, ' +
        '.ka-blog-hero-shell'
      );

      var grids = document.querySelectorAll('.ka-blog-topic-deck');
      grids.forEach(function (grid) {
        var children = grid.children;
        for (var i = 0; i < children.length; i++) {
          var child = children[i];
          child.classList.add('reveal-on-scroll');
          var delayClass = 'reveal-delay-' + ((i % 5) + 1);
          child.classList.add(delayClass);
        }
      });

      revealTargets.forEach(function (el) {
        if (!el.classList.contains('ka-blog-article-grid') && !el.classList.contains('ka-blog-topic-deck')) {
          el.classList.add('reveal-on-scroll');
        }
      });

      var revealObserver = new IntersectionObserver(function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '0px 0px -40px 0px'
      });

      document.querySelectorAll('.reveal-on-scroll').forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  }

  // ============================================================
  // RELATED ARTICLES CAROUSEL — Slide behavior on desktop
  // ============================================================
  function initRelatedArticlesCarousel() {
    var track = document.querySelector('.ka-related-articles-track');
    var prevBtn = document.querySelector('.ka-related-arrow--prev');
    var nextBtn = document.querySelector('.ka-related-arrow--next');
    
    if (!track || !prevBtn || !nextBtn) return;
    
    function updateButtons() {
      prevBtn.disabled = track.scrollLeft <= 5;
      nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 5;
    }

    function scrollToRelatedHeader() {
      var headerEl = document.querySelector('#related');
      if (headerEl) {
        var offset = 80; // approximate sticky header height
        var bodyRect = document.body.getBoundingClientRect().top;
        var elementRect = headerEl.getBoundingClientRect().top;
        var elementPosition = elementRect - bodyRect;
        var offsetPosition = elementPosition - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
    
    prevBtn.addEventListener('click', function () {
      if (window.innerWidth < 980) {
        track.scrollBy({ left: -track.clientWidth, behavior: 'smooth' });
        setTimeout(scrollToRelatedHeader, 300);
      } else {
        var cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 22 : track.clientWidth;
        track.scrollBy({ left: -cardWidth, behavior: 'smooth' });
      }
    });
    
    nextBtn.addEventListener('click', function () {
      if (window.innerWidth < 980) {
        track.scrollBy({ left: track.clientWidth, behavior: 'smooth' });
        setTimeout(scrollToRelatedHeader, 300);
      } else {
        var cardWidth = track.firstElementChild ? track.firstElementChild.offsetWidth + 22 : track.clientWidth;
        track.scrollBy({ left: cardWidth, behavior: 'smooth' });
      }
    });
    
    track.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    
    // Run initial check
    setTimeout(updateButtons, 250);
  }

  // Why Trust Collapsible Card
  function initWhyTrustCard() {
    var card = document.getElementById('ka-why-trust-card');
    if (!card) return;
    
    // Copy the logo from the header into the trust card
    var placeholder = card.querySelector('.ka-why-trust-logo-placeholder');
    if (placeholder) {
      var headerLogoImg = document.querySelector('.theme-header-custom__brand-image');
      var headerLogoText = document.querySelector('.theme-header-custom__brand-text');
      if (headerLogoImg) {
        var clonedImg = headerLogoImg.cloneNode(true);
        clonedImg.className = 'ka-why-trust-brand-image';
        placeholder.innerHTML = '';
        placeholder.appendChild(clonedImg);
      } else if (headerLogoText) {
        var clonedText = headerLogoText.cloneNode(true);
        clonedText.className = 'ka-why-trust-brand-text';
        placeholder.innerHTML = '';
        placeholder.appendChild(clonedText);
      }
    }

    var header = card.querySelector('.ka-why-trust-header');
    var content = card.querySelector('.ka-why-trust-content');
    if (!header || !content) return;

    header.addEventListener('click', function () {
      var isOpen = card.classList.contains('is-open');
      if (isOpen) {
        card.classList.remove('is-open');
        header.setAttribute('aria-expanded', 'false');
        content.style.maxHeight = '0px';
      } else {
        card.classList.add('is-open');
        header.setAttribute('aria-expanded', 'true');
        content.style.maxHeight = content.scrollHeight + 'px';
        // Scroll the card fully into view immediately
        var headerEl = document.querySelector('.theme-header-custom');
        var headerHeight = headerEl ? headerEl.offsetHeight : 60;
        var breadcrumbsWrap = document.querySelector('.theme-header-custom__breadcrumbs-wrap');
        var subnavHeight = breadcrumbsWrap ? breadcrumbsWrap.offsetHeight : 50;
        
        var targetPosition = card.getBoundingClientRect().top + window.pageYOffset;
        var offsetPosition = targetPosition - headerHeight - subnavHeight - 24;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  }

  // ============================================================
  // GENERIC SMOOTH SCROLL WITH HEADER OFFSET FOR ANCHOR LINKS
  // ============================================================
  function initAnchorOffsets() {
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
      anchor.addEventListener('click', function(e) {
        var targetId = this.getAttribute('href');
        if (targetId === '#' || targetId.length < 2) return;
        var targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          var headerEl = document.querySelector('.theme-header-custom');
          var headerHeight = headerEl ? headerEl.offsetHeight : 60;
          var breadcrumbsWrap = document.querySelector('.theme-header-custom__breadcrumbs-wrap');
          var subnavHeight = breadcrumbsWrap ? breadcrumbsWrap.offsetHeight : 50;
          
          var targetPosition = targetEl.getBoundingClientRect().top + window.pageYOffset;
          var offsetPosition = targetPosition - headerHeight - subnavHeight - 24;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          
          if (history.pushState) {
            history.pushState(null, null, targetId);
          } else {
            location.hash = targetId;
          }
        }
      });
    });
  }

  // ============================================================
  // INIT — Run all on DOMContentLoaded
  // ============================================================
  function init() {
    try { initSubnav(); } catch(e) { console.error("initSubnav error:", e); }
    try { initArticleTOC(); } catch(e) { console.error("initArticleTOC error:", e); }
    try { initFAQ(); } catch(e) { console.error("initFAQ error:", e); }
    try { initReadTime(); } catch(e) { console.error("initReadTime error:", e); }
    try { initTopicCarousel(); } catch(e) { console.error("initTopicCarousel error:", e); }
    try { initHeroSearchExploreRedirect(); } catch(e) { console.error("initHeroSearchExploreRedirect error:", e); }
    try { initScopedSearch(); } catch(e) { console.error("initScopedSearch error:", e); }
    try { initAjaxFiltering(); } catch(e) { console.error("initAjaxFiltering error:", e); }
    try { initFloatingCTA(); } catch(e) { console.error("initFloatingCTA error:", e); }
    try { initChatbot(); } catch(e) { console.error("initChatbot error:", e); }
    try { initTocToggle(); } catch(e) { console.error("initTocToggle error:", e); }
    try { initComments(); } catch(e) { console.error("initComments error:", e); }
    try { initScrollAnimations(); } catch(e) { console.error("initScrollAnimations error:", e); }
    try { initRelatedArticlesCarousel(); } catch(e) { console.error("initRelatedArticlesCarousel error:", e); }
    try { initMobileScrollProgressBar(); } catch(e) { console.error("initMobileScrollProgressBar error:", e); }
    try { initWhyTrustCard(); } catch(e) { console.error("initWhyTrustCard error:", e); }
    try { initAnchorOffsets(); } catch(e) { console.error("initAnchorOffsets error:", e); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
