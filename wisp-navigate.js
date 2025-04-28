(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    } else {
        global.WispNavigate = factory();
    }
})(typeof window !== "undefined" ? window : this, function () {

    class WispNavigate {
        static config = {
            navigationProgressBar: true,
            navigationProgressBarColor: '#29d',
            navigationProgressBarHeight: '3px',
            enablePerformanceLogging: false
        };

        static init(userConfig = {}) {
            this.config = { ...this.config, ...userConfig };
            this.bindNavigation();
            window.addEventListener('popstate', () => {
                this.navigate(window.location.pathname + window.location.search, { pushState: false });
            });
        }

        static bindNavigation() {
            document.querySelectorAll('a[wisp\\:navigate], a[wisp-navigate]').forEach(link => {
                link.removeEventListener('click', this.handleNavigate);
                link.addEventListener('click', this.handleNavigate);
            });
        }

        static handleNavigate = (e) => {
            e.preventDefault();
            const url = e.currentTarget.getAttribute('href');
            if (!url || url === '#') return;
            this.navigate(url);
        };

        static async navigate(url, options = { pushState: true }) {
            const beforeNavigateEvent = new CustomEvent('wisp:navigate-before', {
                cancelable: true,
                detail: { url, options }
            });

            const shouldProceed = document.dispatchEvent(beforeNavigateEvent);
            if (!shouldProceed) return;

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
                    }
                });

                if (!response.ok) {
                    throw new Error(`Navigation failed: ${response.status}`);
                }

                const html = await response.text();
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

                if (this.config.enablePerformanceLogging) {
                    const duration = performance.now() - startTime;
                    console.debug(`WispNavigate took ${duration.toFixed(2)}ms`);
                }

                this.bindNavigation();

                window.scrollTo(0, 0);
                if (options.pushState !== false) {
                    window.history.pushState({}, '', url);
                }

                document.dispatchEvent(new CustomEvent('wisp:navigate-success', {
                    detail: { url, options }
                }));
            } catch (err) {
                console.error('Navigation error:', err);

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
            enablePerformanceLogging: true
        })
    );

    return WispNavigate;
});
