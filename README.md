
# WispNavigate.js

**WispNavigate.js** is a super lightweight JavaScript class for simple AJAX-based navigation using `<a>` tags with `wisp:navigate` or `wisp-navigate` attributes.  
Perfect for adding SPA-like behavior without heavy frameworks.
This is lite version of [https://github.com/gmargetic/Wisp.js](gmargetic/Wisp.js)

---

## ⚠️ **Warning**  
This project is still under active development. Expect bugs, unfinished features, and dragons. Use at your own risk!

---

## Installation

Include the script in your project:

```html
<script src="WispNavigate.js"></script>
```

Or import it via your bundler.

---

## Usage

Add the `wisp:navigate` or `wisp-navigate` attribute to your links:

```html
<a href="/about" wisp:navigate>About Us</a>
```

Initialize WispNavigate (usually after DOM is ready):

```javascript
document.addEventListener('DOMContentLoaded', () => {
    WispNavigate.init({
        navigationProgressBar: true,
        navigationProgressBarColor: '#29d',
        navigationProgressBarHeight: '3px',
        enablePerformanceLogging: true
    });
});
```

---

## Features

- Simple, automatic AJAX page navigation
- Configurable progress bar during navigation
- Emits lifecycle events (`before`, `start`, `after-dom-update`, `success`, `error`, `complete`)
- Performance logging (optional)
- Automatic scroll to top
- Fallback to full page reload on errors

---

## Configuration Options

| Option                     | Default | Description |
| --------------------------- | ------- | ----------- |
| `navigationProgressBar`     | `true`  | Enable/disable progress bar |
| `navigationProgressBarColor`| `#29d`  | Progress bar color |
| `navigationProgressBarHeight`| `3px`  | Progress bar height |
| `enablePerformanceLogging`  | `false` | Log navigation performance in console |

---

## Events

You can listen to these events for custom behaviors:

- `wisp:navigate-before`
- `wisp:navigate-start`
- `wisp:navigate-before-dom-update`
- `wisp:navigate-after-dom-update`
- `wisp:navigate-success`
- `wisp:navigate-error`
- `wisp:navigate-complete`

Example:

```javascript
document.addEventListener('wisp:navigate-success', (e) => {
    console.log('Navigation successful to:', e.detail.url);
});
```

---

## License

GNU GENERAL PUBLIC LICENSE Version 3
[LICENSE](LICENSE)

---
