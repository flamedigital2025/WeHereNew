        // --- LENIS INERTIAL SMOOTH SCROLLER INITIALIZATION ---
        let lenisInstance = null;

        function initLenis() {
            if (window.innerWidth > 991) {
                if (!lenisInstance) {
                    lenisInstance = new Lenis({
                        duration: 1.2, // Premium buttery glide deceleration
                        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
                        direction: 'vertical',
                        gestureDirection: 'vertical',
                        smooth: true,
                        mouseMultiplier: 1.0,
                        smoothTouch: false,
                        infinite: false
                    });
                }
            } else {
                if (lenisInstance) {
                    lenisInstance.destroy();
                    lenisInstance = null;
                }
            }
        }

        initLenis();

        function raf(time) {
            if (lenisInstance) {
                lenisInstance.raf(time);
            }
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);

        // DOM Elements
        const navBar = document.getElementById('main-nav');
        const mobileToggle = document.getElementById('mobile-toggle');
        const navMenu = document.getElementById('nav-menu');
        const heroVideo = document.getElementById('hero-video');
        const heroTrack = document.querySelector('.app-scroller');
        const scrollIndicator = document.getElementById('scroll-indicator');
        const slides = document.querySelectorAll('.hero-slide');

        const transitioningPanel = document.getElementById('transitioning-panel');

        // Page target definition
        const isHeroPage = !!heroVideo && !!document.getElementById('hero-logo-placeholder');
        const horizontalSlides = document.getElementById('horizontal-slides');
        const viewportContainer = document.getElementById('viewport-container');
        const appScroller = document.querySelector('.app-scroller');
        const siteTail = document.getElementById('site-tail');
        const processSection = document.getElementById('process');
        const processSlides = document.getElementById('process-slides');
        const navLogo = document.getElementById('nav-logo');
        const heroLogoPlaceholder = document.getElementById('hero-logo-placeholder');

        // Hero content elements for scroll-driven animations
        const heroTag = document.getElementById('hero-tag');
        const heroHeading = document.getElementById('hero-heading');
        const heroCta = document.getElementById('hero-cta');

        // Dynamic Floating Logo Setup
        let floatingLogo = document.getElementById('floating-logo');
        if (!floatingLogo) {
            floatingLogo = document.createElement('img');
            floatingLogo.id = 'floating-logo';
            floatingLogo.className = 'floating-logo-img';
            floatingLogo.src = 'assets/main-logo.webp';
            floatingLogo.alt = 'Wehere Media Logo';
            document.body.appendChild(floatingLogo);
        }

        // Cache coordinates to prevent layout thrashing and jerks on resize/scroll
        let cachedStartRect = null;
        let cachedEndRect = null;

        function cacheLogoBounds() {
            if (!isHeroPage) return;
            // Temporarily restore visibility to get accurate rects
            const origPlaceholderVis = heroLogoPlaceholder.style.visibility;
            const origNavOpacity = navLogo.style.opacity;

            heroLogoPlaceholder.style.visibility = 'visible';
            navLogo.style.opacity = '1';

            const pRect = heroLogoPlaceholder.getBoundingClientRect();
            const nRect = navLogo.getBoundingClientRect();

            cachedStartRect = {
                top: pRect.top, // Kept viewport-relative because slides stay fixed in viewport
                left: pRect.left,
                width: pRect.width,
                height: pRect.height
            };

            cachedEndRect = {
                top: nRect.top,
                left: nRect.left,
                width: nRect.width,
                height: nRect.height
            };

            heroLogoPlaceholder.style.visibility = origPlaceholderVis;
            navLogo.style.opacity = origNavOpacity;
        }

        // Handle active elements on window resize
        window.addEventListener('resize', () => {
            initLenis();
            if (isHeroPage) {
                syncDesktopScrollLayout();
                cacheLogoBounds();
            }
            if (window.innerWidth <= 991) {
                if (transitioningPanel) {
                    transitioningPanel.style.transform = 'none';
                    transitioningPanel.style.opacity = '1';
                    transitioningPanel.style.borderRadius = '0';
                    transitioningPanel.style.pointerEvents = 'auto';
                }
                if (horizontalSlides) horizontalSlides.style.transform = 'none';
                if (processSlides) {
                    processSlides.style.transform = '';
                }
                document.querySelectorAll('.overlay-section').forEach(section => {
                    section.style.transform = '';
                    section.style.opacity = '';
                    section.style.visibility = '';
                    section.style.pointerEvents = '';
                });
                if (processSection) {
                    processSection.style.transform = '';
                    processSection.style.opacity = '';
                    processSection.style.visibility = '';
                    processSection.style.pointerEvents = '';
                }
                if (viewportContainer) {
                    viewportContainer.style.position = '';
                    viewportContainer.style.top = '';
                }
                if (floatingLogo) floatingLogo.style.display = 'none';
                if (navLogo) navLogo.style.opacity = '1';
                if (heroLogoPlaceholder) heroLogoPlaceholder.style.visibility = 'visible';
            } else {
                if (floatingLogo && isHeroPage) floatingLogo.style.display = 'block';
            }
        });

        // Cache on window load to ensure logo dimensions are fully computed
        window.addEventListener('load', cacheLogoBounds);

        function getPanelWidthPx(panel, viewportWidth) {
            if (panel.classList.contains('full-slide-panel')) return viewportWidth;
            if (panel.classList.contains('services-intro-panel')) return viewportWidth * 0.5;
            if (panel.classList.contains('service-slide-panel')) return viewportWidth * 0.42;
            return viewportWidth;
        }

        function syncHorizontalLayout() {
            if (!horizontalSlides) return;
            if (window.innerWidth <= 991) {
                horizontalSlides.style.width = '';
                horizontalSlides.dataset.maxShift = '';
                Array.from(horizontalSlides.children).forEach(panel => {
                    panel.style.width = '';
                });
                return;
            }
            const vw = window.innerWidth;
            let totalWidth = 0;
            Array.from(horizontalSlides.children).forEach(panel => {
                const w = getPanelWidthPx(panel, vw);
                panel.style.width = `${w}px`;
                totalWidth += w;
            });
            horizontalSlides.style.width = `${totalWidth}px`;
            horizontalSlides.dataset.maxShift = String(Math.max(0, totalWidth - vw));
        }

        const HORIZONTAL_SCROLL_VH = 8;
        const PROBLEM_REVEAL_VH = 1.2;
        const WHY_CHOOSE_REVEAL_VH = 1.2;
        const PROCESS_REVEAL_VH = 1.2;
        const PROCESS_HORIZONTAL_VH = 6;
        const PROCESS_PANEL_VW = 0.44;
        const INDUSTRIES_REVEAL_VH = 1.2;
        const CASE_STUDIES_REVEAL_VH = 1.2;

        function smoothstep(t) {
            const c = Math.max(0, Math.min(1, t));
            return c * c * (3 - 2 * c);
        }

        function getScrollPhases() {
            const H = window.innerHeight;
            const heroScrollMax = H * 3;
            const transitionDuration = H * 1.0;
            const horizontalScrollStart = heroScrollMax + transitionDuration;
            const horizontalScrollDuration = H * HORIZONTAL_SCROLL_VH;
            const horizontalScrollEnd = horizontalScrollStart + horizontalScrollDuration;
            const problemRevealStart = horizontalScrollEnd;
            const problemRevealDuration = H * PROBLEM_REVEAL_VH;
            const whyChooseRevealStart = problemRevealStart + problemRevealDuration;
            const whyChooseRevealDuration = H * WHY_CHOOSE_REVEAL_VH;
            const processRevealStart = whyChooseRevealStart + whyChooseRevealDuration;
            const processRevealDuration = H * PROCESS_REVEAL_VH;
            const processHorizontalStart = processRevealStart + processRevealDuration;
            const processHorizontalDuration = H * PROCESS_HORIZONTAL_VH;
            const industriesRevealStart = processHorizontalStart + processHorizontalDuration;
            const industriesRevealDuration = H * INDUSTRIES_REVEAL_VH;
            const caseStudiesRevealStart = industriesRevealStart + industriesRevealDuration;
            const caseStudiesRevealDuration = H * CASE_STUDIES_REVEAL_VH;

            const overlayMap = {
                problem: { start: problemRevealStart, duration: problemRevealDuration },
                'why-choose-us': { start: whyChooseRevealStart, duration: whyChooseRevealDuration },
                industries: { start: industriesRevealStart, duration: industriesRevealDuration },
                'case-studies': { start: caseStudiesRevealStart, duration: caseStudiesRevealDuration }
            };

            const scrollEnd = caseStudiesRevealStart + caseStudiesRevealDuration;

            return {
                H, heroScrollMax, transitionDuration,
                horizontalScrollStart, horizontalScrollDuration, horizontalScrollEnd,
                problemRevealStart, problemRevealDuration,
                whyChooseRevealStart, whyChooseRevealDuration,
                processRevealStart, processRevealDuration,
                processHorizontalStart, processHorizontalDuration,
                industriesRevealStart, industriesRevealDuration,
                caseStudiesRevealStart, caseStudiesRevealDuration,
                overlayMap,
                scrollEnd
            };
        }

        function getScrollerReleaseY() {
            if (!appScroller) return 0;
            return Math.max(0, appScroller.offsetHeight - window.innerHeight);
        }

        function syncViewportPin(scrollY) {
            if (!viewportContainer || window.innerWidth <= 991) return;
            const releaseY = getScrollerReleaseY();
            const pastScrolly = scrollY >= releaseY;
            if (pastScrolly) {
                viewportContainer.style.position = 'absolute';
                viewportContainer.style.top = `${releaseY}px`;
                viewportContainer.style.pointerEvents = 'none';
                document.body.classList.add('scrolly-complete');
            } else {
                viewportContainer.style.position = 'fixed';
                viewportContainer.style.top = '0';
                viewportContainer.style.pointerEvents = '';
                document.body.classList.remove('scrolly-complete');
            }
        }

        function initTailReveal() {
            if (!siteTail) return;
            const revealEls = siteTail.querySelectorAll('.tail-reveal, .tail-section');
            const observer = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-inview');
                    }
                });
            }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
            revealEls.forEach(el => observer.observe(el));
        }

        function getHorizontalScrollMetrics() {
            return getScrollPhases();
        }

        function getProblemRevealStart() {
            return getScrollPhases().problemRevealStart;
        }

        function getWhyChooseRevealStart() {
            return getScrollPhases().whyChooseRevealStart;
        }

        function getProcessRevealStart() {
            return getScrollPhases().processRevealStart;
        }

        function getIndustriesRevealStart() {
            return getScrollPhases().industriesRevealStart;
        }

        function getCaseStudiesRevealStart() {
            return getScrollPhases().caseStudiesRevealStart;
        }

        function getTailSectionScrollY(sectionId) {
            const el = document.getElementById(sectionId);
            return el ? el.offsetTop + 10 : 0;
        }

        function syncProcessLayout() {
            if (!processSlides) return;
            if (window.innerWidth <= 991) {
                processSlides.style.width = '';
                processSlides.dataset.maxShift = '';
                Array.from(processSlides.children).forEach(panel => {
                    panel.style.width = '';
                });
                return;
            }
            const vw = window.innerWidth;
            const panelWidth = vw * PROCESS_PANEL_VW;
            const panels = Array.from(processSlides.children);
            panels.forEach(panel => {
                panel.style.width = `${panelWidth}px`;
            });
            const totalWidth = panelWidth * panels.length;
            processSlides.style.width = `${totalWidth}px`;
            processSlides.dataset.maxShift = String(Math.max(0, totalWidth - vw));
        }

        function updateOverlaySection(section, scrollY, revealStart, revealDuration) {
            if (!section) return;
            if (window.innerWidth <= 991) {
                section.style.transform = '';
                section.style.pointerEvents = '';
                section.style.visibility = '';
                return;
            }

            const scrollEnd = getScrollPhases().scrollEnd;

            section.style.visibility = '';
            section.style.opacity = '';

            if (scrollY < revealStart) {
                section.style.transform = 'translateY(100%)';
                section.style.pointerEvents = 'none';
                return;
            }

            const progress = Math.min(1, (scrollY - revealStart) / revealDuration);
            const ease = smoothstep(progress);
            section.style.transform = `translateY(${(1 - ease) * 100}%)`;
            section.style.pointerEvents = ease > 0.35 ? 'auto' : 'none';
        }

        function updateProcessSection(scrollY) {
            if (!processSection || !processSlides) return;
            if (window.innerWidth <= 991) {
                processSection.style.transform = '';
                processSection.style.opacity = '';
                processSection.style.visibility = '';
                processSection.style.pointerEvents = '';
                processSlides.style.transform = '';
                return;
            }

            const scrollEnd = getScrollPhases().scrollEnd;

            processSection.style.visibility = '';
            processSection.style.opacity = '';

            const phases = getScrollPhases();
            const {
                processRevealStart, processRevealDuration,
                processHorizontalStart, processHorizontalDuration
            } = phases;

            if (scrollY < processRevealStart) {
                processSection.style.transform = 'translateY(100%)';
                processSection.style.pointerEvents = 'none';
                processSlides.style.transform = 'translateX(0)';
                return;
            }

            const revealProgress = Math.min(1, (scrollY - processRevealStart) / processRevealDuration);
            const revealEase = smoothstep(revealProgress);
            processSection.style.transform = `translateY(${(1 - revealEase) * 100}%)`;
            processSection.style.pointerEvents = revealEase > 0.35 ? 'auto' : 'none';

            if (scrollY >= processHorizontalStart) {
                const hProgress = Math.min(1, (scrollY - processHorizontalStart) / processHorizontalDuration);
                const maxShift = parseFloat(processSlides.dataset.maxShift || '0') || 0;
                processSlides.style.transform = `translate3d(-${hProgress * maxShift}px, 0, 0)`;
            } else {
                processSlides.style.transform = 'translateX(0)';
            }
        }

        function updateOverlaySections(scrollY) {
            const phases = getScrollPhases();
            Object.entries(phases.overlayMap).forEach(([id, meta]) => {
                updateOverlaySection(document.getElementById(id), scrollY, meta.start, meta.duration);
            });
            updateProcessSection(scrollY);
        }

        function getPanelScrollY(panelId) {
            const { horizontalScrollStart, horizontalScrollDuration } = getHorizontalScrollMetrics();
            const maxShift = parseFloat(horizontalSlides?.dataset.maxShift || '0');
            if (!horizontalSlides || !maxShift) return horizontalScrollStart;
            let offset = 0;
            for (const panel of horizontalSlides.children) {
                if (panel.id === panelId) break;
                offset += panel.offsetWidth;
            }
            return horizontalScrollStart + (offset / maxShift) * horizontalScrollDuration;
        }

        // Scrollable distance + one viewport (max scrollY = animation range)
        function syncScrollTrackHeight() {
            if (!appScroller) return;
            if (window.innerWidth <= 991) {
                appScroller.style.height = '';
                return;
            }
            const H = window.innerHeight;
            const phases = getScrollPhases();
            appScroller.style.height = `${phases.scrollEnd + H}px`;
        }

        function syncDesktopScrollLayout() {
            syncScrollTrackHeight();
            syncHorizontalLayout();
            syncProcessLayout();
            const scrollY = window.scrollY || 0;
            updateOverlaySections(scrollY);
            syncViewportPin(scrollY);
        }

        syncDesktopScrollLayout();
        window.addEventListener('resize', syncDesktopScrollLayout);
        window.addEventListener('load', () => {
            syncDesktopScrollLayout();
            initTailReveal();
        });
        initTailReveal();

        // --- STICKY NAVBAR CLASS TOGGLE (Mobile Fallback) ---
        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 991) {
                if (window.scrollY > 50) {
                    navBar.classList.add('scrolled');
                } else {
                    navBar.classList.remove('scrolled');
                }
            }
        });

        // --- MOBILE NAV TOGGLE ---
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });

        // --- LERP SCROLL SYSTEM VARIABLES ---
        let currentScrollY = 0;
        let smoothedScrollY = 0;
        const LERP_FACTOR = 1.0; // React/GSAP style: Sync perfectly with the native smooth scroll without artificial lag
        let targetTime = 0;
        let scrollTimeout;

        // Synchronize native window scroll coordinate
        window.addEventListener('scroll', () => {
            currentScrollY = window.scrollY;
        });

        // Mobile play-on-scroll control
        function handleMobileScroll() {
            if (!isHeroPage) return;
            const heroStickyEl = document.getElementById('hero-sticky');
            if (!heroStickyEl) return;
            const heroTrackRect = heroStickyEl.getBoundingClientRect();
            const isHeroVisible = heroTrackRect.bottom > 0 && heroTrackRect.top < window.innerHeight;

            if (isHeroVisible) {
                if (heroVideo.paused) {
                    heroVideo.play().catch(() => { });
                }
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    heroVideo.pause();
                }, 150);
            } else {
                heroVideo.pause();
            }
        }

        window.addEventListener('scroll', () => {
            if (window.innerWidth <= 991) {
                handleMobileScroll();
            }
        });

        // Video scrubbing setup: ensure video is ready for currentTime seeking
        let videoReady = false;

        function onVideoReady() {
            if (videoReady) return;
            videoReady = true;
            // Force play and immediately pause to warm up and initialize the browser decoder pipeline
            const playPromise = heroVideo.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    setTimeout(() => {
                        heroVideo.pause();
                        heroVideo.currentTime = 0;
                    }, 50);
                }).catch(() => {
                    heroVideo.pause();
                    heroVideo.currentTime = 0;
                });
            } else {
                heroVideo.pause();
                heroVideo.currentTime = 0;
            }
        }

        if (isHeroPage) {
            if (heroVideo.readyState >= 2) {
                onVideoReady();
            } else {
                heroVideo.addEventListener('loadedmetadata', onVideoReady, { once: true });
                heroVideo.addEventListener('loadeddata', onVideoReady, { once: true });
                heroVideo.addEventListener('canplay', onVideoReady, { once: true });
                heroVideo.addEventListener('canplaythrough', onVideoReady, { once: true });
            }

            // Mobile fallback
            heroVideo.addEventListener('loadedmetadata', () => {
                if (window.innerWidth <= 991) handleMobileScroll();
            });
        }

        // --- UNIFIED HIGH-PERFORMANCE ANIMATION LOOP ---
        function playbackLoop() {
            if (!isHeroPage) return;
            const H = window.innerHeight;

            if (window.innerWidth > 991) {
                // Smooth LERP scroll coordinate
                smoothedScrollY += (currentScrollY - smoothedScrollY) * LERP_FACTOR;
                if (Math.abs(currentScrollY - smoothedScrollY) < 0.05) {
                    smoothedScrollY = currentScrollY;
                }

                updateOverlaySections(smoothedScrollY);
                syncViewportPin(smoothedScrollY);

                const heroScrollMax = H * 3; // 300vh
                const transitionDuration = H * 1.0; // 100vh — slower bottom-right reveal
                const { horizontalScrollStart, horizontalScrollDuration } = getHorizontalScrollMetrics();

                // --- 1. DYNAMIC LOGO DOCKING ENGINE ---
                if (!cachedStartRect || !cachedEndRect) {
                    cacheLogoBounds();
                }

                // Logo docking spans 220vh of the 300vh hero section
                const logoScrollMax = H * 2.2;
                const logoProgress = Math.max(0, Math.min(1, smoothedScrollY / logoScrollMax));
                const logoEase = Math.pow(logoProgress, 2); // timing for heading/CTA sync
                const logoMotionEase = 1 - Math.pow(1 - logoProgress, 2); // ease-out for smooth dock
                const handoffStart = 0.96;

                // Pin to exact end coords in the final stretch to prevent position drift
                const motionT = logoMotionEase >= handoffStart ? 1 : logoMotionEase;
                const currentLeft = cachedStartRect.left + motionT * (cachedEndRect.left - cachedStartRect.left);
                const currentTop = cachedStartRect.top + motionT * (cachedEndRect.top - cachedStartRect.top);
                const currentWidth = cachedStartRect.width + motionT * (cachedEndRect.width - cachedStartRect.width);
                const currentHeight = cachedStartRect.height + motionT * (cachedEndRect.height - cachedStartRect.height);

                floatingLogo.style.left = `${currentLeft}px`;
                floatingLogo.style.top = `${currentTop}px`;
                floatingLogo.style.width = `${currentWidth}px`;
                floatingLogo.style.height = `${currentHeight}px`;

                heroLogoPlaceholder.style.visibility = 'hidden';

                // Smooth cross-fade only once floating logo has reached the nav position
                if (logoMotionEase >= 1 || logoProgress >= 1) {
                    navLogo.style.opacity = '1';
                    floatingLogo.style.opacity = '0';
                    floatingLogo.style.visibility = 'hidden';
                    floatingLogo.style.display = 'none';
                } else if (logoMotionEase >= handoffStart) {
                    const fade = (logoMotionEase - handoffStart) / (1 - handoffStart);
                    navLogo.style.opacity = String(fade);
                    floatingLogo.style.opacity = String(1 - fade);
                    floatingLogo.style.visibility = 'visible';
                    floatingLogo.style.display = 'block';
                } else {
                    navLogo.style.opacity = '0';
                    floatingLogo.style.opacity = '1';
                    floatingLogo.style.visibility = 'visible';
                    floatingLogo.style.display = 'block';
                }

                floatingLogo.style.pointerEvents = 'none';

                // --- STICKY NAVBAR TRANSPARENT IN HERO SECTION ---
                if (smoothedScrollY > heroScrollMax) {
                    navBar.classList.add('scrolled');
                } else {
                    navBar.classList.remove('scrolled');
                }

                // --- 2. CINEMATIC BACKGROUND VIDEO SEEK & SCROLL-DRIVEN CONTENT ---
                if (smoothedScrollY <= heroScrollMax) {
                    const heroProgress = smoothedScrollY / heroScrollMax;

                    // React/Framer-Motion style video scrubbing with seek protection
                    const isVideoScrubable = (videoReady || heroVideo.readyState >= 1) && heroVideo.duration && !heroVideo.seeking;
                    if (isVideoScrubable) {
                        const targetDuration = heroVideo.duration - 0.1;
                        const newTime = Math.max(0, Math.min(targetDuration, heroProgress * targetDuration));
                        if (Math.abs(newTime - heroVideo.currentTime) > 0.05) {
                            heroVideo.currentTime = newTime;
                        }
                    }

                    // Keep slide visible
                    slides.forEach(slide => {
                        slide.style.opacity = 1;
                        slide.style.pointerEvents = 'auto';
                        slide.classList.add('active');
                    });

                    // --- SCROLL-DRIVEN HERO CONTENT ANIMATIONS ---
                    // All phases spread across full hero section to match logo speed

                    // Tag: shifts right in sync with logo motion — no fade
                    const TAG_LOCK_X = 630;
                    heroTag.style.opacity = '1';
                    heroTag.style.transform = `translateX(${logoMotionEase * TAG_LOCK_X}px)`;

                    // Phase 2: Heading reveals only after logo moves halfway
                    const HEADING_BASE_Y = -220;
                    const REVEAL_START_OFFSET = 25;
                    const LOGO_REVEAL_START = 0.38;  // reveal begins earlier
                    const LOGO_REVEAL_END = 0.55;    // reveal completes here
                    const revealProgress = Math.max(0, Math.min(1, (logoEase - LOGO_REVEAL_START) / (LOGO_REVEAL_END - LOGO_REVEAL_START)));
                    const revealEase = revealProgress * revealProgress * (3 - 2 * revealProgress);
                    const headingRevealOpacity = revealEase;
                    const headingRevealY = HEADING_BASE_Y + REVEAL_START_OFFSET * (1 - revealEase);

                    // Phase 3: Heading shifts upward after reveal completes
                    const HEADING_SCROLL_MAX = 80;
                    const headingShift = Math.max(0, Math.min(1, (logoEase - LOGO_REVEAL_END) / 0.3));
                    const headingEase = headingShift * headingShift * (3 - 2 * headingShift);
                    const headingScrollY = -headingEase * HEADING_SCROLL_MAX;
                    const finalHeadingY = headingRevealY + headingScrollY;

                    heroHeading.style.opacity = String(headingRevealOpacity);
                    heroHeading.style.transform = `translateY(${finalHeadingY}px)`;

                    // Phase 4: CTA button fades up after heading reveal
                    const ctaProgress = Math.max(0, Math.min(1, (logoEase - 0.75) / 0.15));
                    const ctaEase = ctaProgress * ctaProgress * (3 - 2 * ctaProgress);
                    heroCta.style.opacity = String(ctaEase);
                    const CTA_BASE_OFFSET = 10;
                    heroCta.style.transform = `translateY(${20 - ctaEase * 20 + finalHeadingY + CTA_BASE_OFFSET}px)`;

                    // Scroll indicator
                    if (heroProgress > 0.1) {
                        scrollIndicator.classList.add('hide');
                    } else {
                        scrollIndicator.classList.remove('hide');
                    }

                    // Reset panel transition
                    transitioningPanel.style.transform = 'scale(0)';
                    transitioningPanel.style.opacity = '0';
                    transitioningPanel.style.borderRadius = '200px';
                    transitioningPanel.style.pointerEvents = 'none';

                } else if (smoothedScrollY > heroScrollMax && smoothedScrollY <= horizontalScrollStart) {
                    // Lock video near the end to prevent stalls or black frames
                    if (heroVideo.duration && !heroVideo.seeking) {
                        const targetEnd = heroVideo.duration - 0.1;
                        if (Math.abs(heroVideo.currentTime - targetEnd) > 0.05) {
                            heroVideo.currentTime = targetEnd;
                        }
                    }

                    const rawTransProgress = (smoothedScrollY - heroScrollMax) / transitionDuration;
                    const transProgress = Math.max(0, Math.min(1,
                        rawTransProgress * rawTransProgress * (3 - 2 * rawTransProgress)
                    ));

                    slides.forEach(slide => {
                        slide.style.opacity = 1;
                        slide.style.pointerEvents = 'none';
                    });
                    scrollIndicator.classList.add('hide');

                    const scale = transProgress;
                    const borderRadius = (1 - transProgress) * 200; // 200px -> 0px

                    transitioningPanel.style.transform = `scale(${scale})`;
                    transitioningPanel.style.opacity = scale;
                    transitioningPanel.style.borderRadius = `${borderRadius}px`;
                    transitioningPanel.style.pointerEvents = 'auto';

                    horizontalSlides.style.transform = 'translateX(0vw)';

                } else {
                    // Lock video near the end to prevent stalls or black frames
                    if (heroVideo.duration && !heroVideo.seeking) {
                        const targetEnd = heroVideo.duration - 0.1;
                        if (Math.abs(heroVideo.currentTime - targetEnd) > 0.05) {
                            heroVideo.currentTime = targetEnd;
                        }
                    }

                    const horProgress = (smoothedScrollY - horizontalScrollStart) / horizontalScrollDuration;
                    const clampedProgress = Math.max(0, Math.min(1, horProgress));
                    const maxHorizontalShift = parseFloat(horizontalSlides.dataset.maxShift || '0') || 0;

                    slides.forEach(slide => {
                        slide.style.opacity = 1;
                        slide.style.pointerEvents = 'none';
                    });
                    scrollIndicator.classList.add('hide');

                    transitioningPanel.style.transform = 'scale(1)';
                    transitioningPanel.style.opacity = '1';
                    transitioningPanel.style.borderRadius = '0px';
                    transitioningPanel.style.pointerEvents = 'auto';

                    horizontalSlides.style.transform = `translate3d(-${clampedProgress * maxHorizontalShift}px, 0, 0)`;
                }

                // --- 3. LERPed NAVIGATION LINK HIGHLIGHTING ---
                const navLinks = document.querySelectorAll('.nav-link');
                navLinks.forEach(link => link.classList.remove('active-link'));
                if (smoothedScrollY < H * 3.7) {
                    const homeLink = document.querySelector('.nav-link[href="#"]');
                    if (homeLink) homeLink.classList.add('active-link');
                } else if (smoothedScrollY < getPanelScrollY('showcase-panel') - H * 0.15) {
                    const expLink = document.querySelector('.nav-link[href="#experience"]');
                    if (expLink) expLink.classList.add('active-link');
                } else {
                    const showLink = document.querySelector('.nav-link[href="#showcase"]');
                    if (showLink) showLink.classList.add('active-link');
                }

            } else {
                // Mobile layout resets
                if (floatingLogo) floatingLogo.style.display = 'none';
                if (navLogo) navLogo.style.opacity = '1';
                if (heroLogoPlaceholder) heroLogoPlaceholder.style.visibility = 'visible';
                if (heroHeading) {
                    heroHeading.style.opacity = '1';
                    heroHeading.style.transform = 'none';
                }
                if (heroCta) {
                    heroCta.style.opacity = '1';
                    heroCta.style.transform = 'none';
                }

                // Mobile active nav link highlighting
                const sections = document.querySelectorAll('section');
                const navLinks = document.querySelectorAll('.nav-link');
                let currentSec = "";
                sections.forEach(section => {
                    const sectionTop = section.offsetTop;
                    if (currentScrollY >= (sectionTop - 300)) {
                        currentSec = section.getAttribute('id');
                    }
                });
                navLinks.forEach(link => {
                    link.classList.remove('active-link');
                    if (link.getAttribute('href') === `#${currentSec}`) {
                        link.classList.add('active-link');
                    }
                });
            }
            requestAnimationFrame(playbackLoop);
        }

        // Start animation loop only on pages that contain the cinematic hero elements
        if (isHeroPage) {
            requestAnimationFrame(playbackLoop);
        }

        // --- NAVIGATION ANCHOR SMOOTH SCROLL MAPPING ---
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', e => {
                const targetId = anchor.getAttribute('href');
                if (window.innerWidth > 991) {
                    const H = window.innerHeight;
                    let targetY = 0;
                    if (targetId === '#') {
                        targetY = 0;
                    } else if (targetId === '#experience') {
                        targetY = getPanelScrollY('services-intro-panel') + 10;
                    } else if (targetId === '#showcase') {
                        targetY = getPanelScrollY('showcase-panel') + 10;
                    } else if (targetId === '#problem') {
                        targetY = getProblemRevealStart() + 10;
                    } else if (targetId === '#why-choose-us') {
                        targetY = getWhyChooseRevealStart() + 10;
                    } else if (targetId === '#process') {
                        targetY = getProcessRevealStart() + 10;
                    } else if (targetId === '#industries') {
                        targetY = getIndustriesRevealStart() + 10;
                    } else if (targetId === '#case-studies') {
                        targetY = getCaseStudiesRevealStart() + 10;
                    } else if (targetId.startsWith('#')) {
                        const sectionId = targetId.slice(1);
                        const tailEl = document.getElementById(sectionId);
                        if (tailEl && siteTail && siteTail.contains(tailEl)) {
                            targetY = getTailSectionScrollY(sectionId);
                        } else if (getScrollPhases().overlayMap[sectionId]) {
                            targetY = getScrollPhases().overlayMap[sectionId].start + 10;
                        }
                    }

                    e.preventDefault();
                    if (lenisInstance) {
                        lenisInstance.scrollTo(targetY, { duration: 1.6 });
                    } else {
                        window.scrollTo({ top: targetY, behavior: 'smooth' });
                    }
                }
            });
        });

        // --- BENTO GRID CARD MOUSE SHADOW EFFECTS ---
        const cards = document.querySelectorAll('.bento-card, .industry-card');
        cards.forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
