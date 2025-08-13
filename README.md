# WispNavigate.js

**WispNavigate.js** is a super lightweight JavaScript module for simple AJAX-based navigation using `<a>` tags with `wisp:navigate` or `wisp-navigate` attributes.  

Perfect for adding SPA-like behavior without heavy frameworks.  
Convert your classic website into a smooth SPA-like experience in no time.

This is a **super lite** version of the [gmargetic/Wisp.js](https://github.com/gmargetic/Wisp.js).

---

## ⚠️ Warning  
This project is still under active development. Expect bugs, unfinished features, and dragons 🐉. Use at your own risk!

---

## Installation

### NPM

(NPM package is not yet available.)

---

### CDN

Simply include WispNavigate.js via [jsDelivr](https://www.jsdelivr.com/):

```html
<script src="https://cdn.jsdelivr.net/gh/gmargetic/wispnavigate.js/wisp-navigate.min.js"></script>
```

---

### Local

```html
<script src="WispNavigate.js"></script>
```

---

## Usage

Add the `wisp:navigate` or `wisp-navigate` attribute to your links:

```html
<a href="/about" wisp:navigate>About Us</a>
```

Initialize **WispNavigate** (usually after DOM is ready):

```javascript
document.addEventListener('DOMContentLoaded', () => {
    WispNavigate.init({
        navigationProgressBar: true,
        navigationProgressBarColor: '#29d',
        navigationProgressBarHeight: '3px',
        enablePerformanceLogging: true,
        prefetchOnHover: true, // Prefetch pages on hover
        prefetchOnView: true   // Prefetch pages when link enters viewport
    });
});
```

---

## Features

- Simple, automatic AJAX page navigation
- Configurable progress bar
- **Prefetch on hover** - Load target pages when hovered
- **Prefetch on view** - Load target pages when scrolled into viewport
- Emits lifecycle events (`before`, `start`, `after-dom-update`, `success`, `error`, `complete`)
- Performance logging (optional)
- Automatic scroll to top
- Fallback to full page reload on errors

---

## Configuration Options

| Option                      | Default | Description |
| --------------------------- | ------- | ----------- |
| `navigationProgressBar`     | `true`  | Enable/disable progress bar |
| `navigationProgressBarColor`| `#29d`  | Progress bar color |
| `navigationProgressBarHeight`| `3px`  | Progress bar height |
| `enablePerformanceLogging`  | `false` | Log navigation performance in console |
| `prefetchOnHover`           | `false` | Prefetch target page HTML when link is hovered |
| `prefetchOnView`            | `false` | Prefetch target page HTML when link enters the viewport |

---

## Events

You can listen to these events for custom behaviors:

- `wisp:navigate-before` - Fired before navigation starts. Can be prevented using `event.preventDefault()`.
- `wisp:navigate-start` - Fired when navigation starts.
- `wisp:navigate-before-dom-update` - Fired before updating the DOM.
- `wisp:navigate-after-dom-update` - Fired after DOM update, before history push.
- `wisp:navigate-success` - Fired after successful navigation.
- `wisp:navigate-error` - Fired when navigation fails.
- `wisp:navigate-complete` - Always fired after navigation (success or fail).

Example:

```javascript
document.addEventListener('wisp:navigate-success', (e) => {
    console.log('Navigation successful to:', e.detail.url);
});
```

---

## License

[GNU GENERAL PUBLIC LICENSE Version 3](LICENSE)
