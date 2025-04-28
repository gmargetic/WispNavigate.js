class WispNavigate {
    static config = {
        navigationProgressBar: true,
        navigationProgressBarColor: '#29d',
        navigationProgressBarHeight: '3px',
        enablePerformanceLogging: false
    };

    /**
     * Initializes WispNavigate with user configuration
     * @static
     * @param {Object} [userConfig={}] - User configuration overrides
     */
    static init(userConfig = {}) {
        this.config = { ...this.config, ...userConfig };
        this.bindNavigation();
        window.addEventListener('popstate', () => {
            this.navigate(window.location.pathname + window.location.search, { pushState: false });
        });
    }

    /**
     * Binds navigation handlers to links with wisp:navigate
     * @static
     */
    static bindNavigation() {
        document.querySelectorAll('a[wisp\\:navigate], a[wisp-navigate]').forEach(link => {
            link.removeEventListener('click', this.handleNavigate);
            link.addEventListener('click', this.handleNavigate);
        });
    }

    /**
     * Handles navigation link clicks
     * @static
     * @param {Event} e - Click event
     */
    static handleNavigate = (e) => {
        e.preventDefault();
        const url = e.currentTarget.getAttribute('href');
        if (!url || url === '#') return;

        this.navigate(url);
    };

    /**
     * Navigates to URL with AJAX
     * @static
     * @async
     * @param {string} url - URL to navigate to
     * @param {Object} [options={pushState: true}] - Navigation options
     */
    static async navigate(url, options = { pushState: true }) {
        // Dispatch before-navigate event
        const beforeNavigateEvent = new CustomEvent('wisp:navigate-before', {
            cancelable: true,
            detail: { url, options }
        });

        const shouldProceed = document.dispatchEvent(beforeNavigateEvent);
        if (!shouldProceed) return;

        try {
            const startTime = performance.now();

            // Dispatch starting event
            document.dispatchEvent(new CustomEvent('wisp:navigate-start', {
                detail: { url, options }
            }));

            this.showNavigationProgressBar();

            const response = await fetch(url, {
                headers: {
                    'X-Requested-With': 'X-Wisp-Navigate',
                    'Accept': 'text/html'
                }
            });

            if (!response.ok) {
                throw new Error(`Navigation failed: ${response.status}`);
            }

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Dispatch before-dom-update event
            document.dispatchEvent(new CustomEvent('wisp:navigate-before-dom-update', {
                detail: { url, options, newDocument: doc }
            }));

            // Replace only #app if it exists, otherwise replace entire body
            const newApp = doc.querySelector('#app');
            const currentApp = document.querySelector('#app');

            if (newApp && currentApp) {
                currentApp.innerHTML = newApp.innerHTML;
            } else {
                document.body.innerHTML = doc.body.innerHTML;
            }

            document.title = doc.title;

            // Dispatch after-dom-update event
            document.dispatchEvent(new CustomEvent('wisp:navigate-after-dom-update', {
                detail: { url, options }
            }));

            if (this.config.enablePerformanceLogging) {
                const duration = performance.now() - startTime;
                console.debug(`WispNavigate took ${duration.toFixed(2)}ms`);
            }

            this.bindNavigation();

            window.scrollTo(0, 0);
            if (options.pushState !== false) {
                window.history.pushState({}, '', url);
            }

            // Dispatch successful navigation event
            document.dispatchEvent(new CustomEvent('wisp:navigate-success', {
                detail: { url, options }
            }));
        } catch (err) {
            console.error('Navigation error:', err);

            // Dispatch error event
            document.dispatchEvent(new CustomEvent('wisp:navigate-error', {
                detail: { url, options, error: err }
            }));

            window.location.href = url; // fallback to full page load
        } finally {
            this.hideNavigationProgressBar();

            // Dispatch complete event (always fires, regardless of success/error)
            document.dispatchEvent(new CustomEvent('wisp:navigate-complete', {
                detail: { url, options }
            }));
        }
    }

    /**
     * Shows navigation progress bar
     * @static
     */
    static showNavigationProgressBar() {
        if (!this.config.navigationProgressBar) return;
        this.injectNavigationProgressBar();
        const bar = document.getElementById('wisp-progress-bar');
        if (!bar) return;
        bar.style.opacity = '1';
        bar.style.width = '0';
        setTimeout(() => { bar.style.width = '80%'; }, 10);
    }

    /**
     * Hides navigation progress bar
     * @static
     */
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

    /**
     * Injects progress bar into DOM
     * @static
     */
    static injectNavigationProgressBar() {
        if (document.getElementById('wisp-progress-bar')) return;
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () =>
    WispNavigate.init({
        navigationProgressBar: true,
        navigationProgressBarColor: '#29d',
        navigationProgressBarHeight: '3px',
        enablePerformanceLogging: true
    })
);

// Expose to global scope if needed
window.WispNavigate = WispNavigate;
