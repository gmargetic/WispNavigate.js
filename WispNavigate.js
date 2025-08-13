class WispNavigate {
    static config = {
        navigationProgressBar: true,
        navigationProgressBarColor: '#29d',
        navigationProgressBarHeight: '3px',
        enablePerformanceLogging: false,
        enablePrefetchOnHover: true,
        enablePrefetchOnView: true,
        prefetchDelay: 150 // ms before prefetch starts on hover
    };

    static #abortController = null;
    static #bound = false;
    static #prefetchCache = new Map();
    static #prefetchTimeout = null;
    static #observer = null;

    static init(userConfig = {}) {
        this.config = { ...this.config, ...userConfig };
        this.bindNavigation();
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname + window.location.search, { pushState: false });
        });
    }

    static bindNavigation() {
        if (this.#bound) return;
        this.#bound = true;

        // Click handler
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[wisp\\:navigate], a[wisp-navigate]');
            if (!link) return;

            const href = link.getAttribute('href');
            if (!this.#isNavigableLink(href, link)) return;

            e.preventDefault();
            this.handleNavigate(href);
        }, { capture: false, passive: false });

        // Prefetch on hover
        if (this.config.enablePrefetchOnHover) {
            document.addEventListener('mouseover', (e) => {
                const link = e.target.closest('a[wisp\\:navigate], a[wisp-navigate]');
                if (!link) return;

                const href = link.getAttribute('href');
                if (!this.#isNavigableLink(href, link)) return;

                clearTimeout(this.#prefetchTimeout);
                this.#prefetchTimeout = setTimeout(() => {
                    this.prefetch(href);
                }, this.config.prefetchDelay);
            }, { capture: false, passive: true });

            document.addEventListener('mouseout', () => {
                clearTimeout(this.#prefetchTimeout);
            }, { passive: true });
        }

        // Prefetch on view
        if (this.config.enablePrefetchOnView) {
            if (this.#observer) {
                this.#observer.disconnect();
            }
            this.#observer = new IntersectionObserver((entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        const link = entry.target;
                        const href = link.getAttribute('href');
                        if (this.#isNavigableLink(href, link)) {
                            this.prefetch(href);
                        }
                        this.#observer.unobserve(link);
                    }
                }
            }, { rootMargin: '200px' });

            document.querySelectorAll('a[wisp\\:navigate], a[wisp-navigate]').forEach(link => {
                const href = link.getAttribute('href');
                if (this.#isNavigableLink(href, link)) {
                    this.#observer.observe(link);
                }
            });
        }
    }

    static handleNavigate(href) {
        if (!href) return;
        if (this.#prefetchCache.has(href)) {
            this.#applyPrefetchedContent(href);
        } else {
            this.navigate(href);
        }
    }

    static async navigate(url, options = { pushState: true }) {
        const beforeNavigateEvent = new CustomEvent('wisp:navigate-before', {
            cancelable: true,
            detail: { url, options }
        });

        if (!document.dispatchEvent(beforeNavigateEvent)) return;

        // Cancel previous request
        if (this.#abortController) {
            this.#abortController.abort();
        }
        this.#abortController = new AbortController();

        try {
            const startTime = performance.now();

            document.dispatchEvent(new CustomEvent('wisp:navigate-start', {
                detail: { url, options }
            }));

            this.showNavigationProgressBar();

            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'X-Wisp-Navigate',
                    'Accept': 'text/html'
                },
                signal: this.#abortController.signal
            });

            if (!response.ok) {
                throw new Error(`Navigation failed: ${response.status} ${response.statusText}`);
            }

            const html = await response.text();
            this.#updateDOMFromHTML(html, url, options);

            if (this.config.enablePerformanceLogging) {
                const duration = performance.now() - startTime;
                console.debug(`[WispNavigate] Navigation took ${duration.toFixed(2)}ms`);
            }

            if (options.pushState !== false) {
                try {
                    window.history.pushState({}, '', url);
                } catch (pushErr) {
                    console.warn('[WispNavigate] pushState failed:', pushErr);
                }
            }

            document.dispatchEvent(new CustomEvent('wisp:navigate-success', {
                detail: { url, options }
            }));
        } catch (err) {
            if (err.name === 'AbortError') {
                console.info('[WispNavigate] Navigation aborted');
                return;
            }

            console.error('[WispNavigate] Navigation error:', err, err.stack);

            document.dispatchEvent(new CustomEvent('wisp:navigate-error', {
                detail: { url, options, error: err }
            }));

            window.location.href = url;
        } finally {
            this.hideNavigationProgressBar();

            document.dispatchEvent(new CustomEvent('wisp:navigate-complete', {
                detail: { url, options }
            }));
        }
    }

    static async prefetch(url) {
        if (this.#prefetchCache.has(url)) return;
        try {
            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'X-Wisp-Navigate',
                    'Accept': 'text/html'
                }
            });
            if (!response.ok) return;
            const html = await response.text();
            this.#prefetchCache.set(url, html);
        } catch (err) {
            console.debug('[WispNavigate] Prefetch failed for', url, err);
        }
    }

    static #applyPrefetchedContent(url) {
        const html = this.#prefetchCache.get(url);
        if (!html) return;
        this.#updateDOMFromHTML(html, url, { pushState: true });

        try {
            window.history.pushState({}, '', url);
        } catch (pushErr) {
            console.warn('[WispNavigate] pushState failed:', pushErr);
        }

        document.dispatchEvent(new CustomEvent('wisp:navigate-success', {
            detail: { url, options: { pushState: true }, prefetched: true }
        }));
    }

    static #updateDOMFromHTML(html, url, options) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        document.dispatchEvent(new CustomEvent('wisp:navigate-before-dom-update', {
            detail: { url, options, newDocument: doc }
        }));

        const newApp = doc.querySelector('#app');
        const currentApp = document.querySelector('#app');

        if (newApp && currentApp) {
            currentApp.innerHTML = newApp.innerHTML;
        } else {
            document.body.innerHTML = doc.body.innerHTML;
        }

        document.title = doc.title;

        document.dispatchEvent(new CustomEvent('wisp:navigate-after-dom-update', {
            detail: { url, options }
        }));

        this.#bound = false;
        this.bindNavigation();
        window.scrollTo(0, 0);
    }

    static #isNavigableLink(href, link) {
        return !!href &&
            href !== '#' &&
            link.target !== '_blank' &&
            !href.startsWith('mailto:') &&
            !href.startsWith('tel:') &&
            (!/^(https?:)?\/\//.test(href) || href.startsWith(location.origin));
    }

    static showNavigationProgressBar() {
        if (!this.config.navigationProgressBar) return;
        this.injectNavigationProgressBar();
        const bar = document.getElementById('wisp-progress-bar');
        if (!bar) return;
        bar.style.opacity = '1';
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = '80%'; }, 10);
    }

    static hideNavigationProgressBar() {
        if (!this.config.navigationProgressBar) return;
        const bar = document.getElementById('wisp-progress-bar');
        if (!bar) return;
        bar.style.width = '100%';
        setTimeout(() => {
            bar.style.opacity = '0';
            bar.style.width = '0';
        }, 400);
    }

    static injectNavigationProgressBar() {
        if (document.getElementById('wisp-progress-bar')) return;
        if (!document.body) {
            console.warn('[WispNavigate] Cannot inject progress bar - document.body not ready');
            return;
        }
        const bar = document.createElement('div');
        bar.id = 'wisp-progress-bar';
        const color = this.config.navigationProgressBarColor || '#29d';
        const height = this.config.navigationProgressBarHeight || '3px';
        bar.style.cssText = `
            position:fixed;top:0;left:0;height:${height};width:0;
            background:${color};z-index:99999;transition:width 0.2s,opacity 0.4s;
            opacity:0;
        `;
        document.body.appendChild(bar);
    }
}

document.addEventListener('DOMContentLoaded', () =>
    WispNavigate.init({
        navigationProgressBar: true,
        navigationProgressBarColor: '#29d',
        navigationProgressBarHeight: '3px',
        enablePerformanceLogging: true,
        enablePrefetchOnHover: true,
        enablePrefetchOnView: true
    })
);

window.WispNavigate = WispNavigate;
