
# WispNavigate.js

**WispNavigate.js** is a super lightweight JavaScript class for simple AJAX-based navigation using `<a>` tags with `wisp:navigate` or `wisp-navigate` attributes.  

Perfect for adding SPA-like behavior without heavy frameworks.

Convert your classic website to SPA-like beauty in a no time.

This is super lite version of the [gmargetic/Wisp.js](https://github.com/gmargetic/Wisp.js)

---

## ⚠️ **Warning**  
This project is still under active development. Expect bugs, unfinished features, and dragons. Use at your own risk!

---

## Installation

### CDN (recommended)

Simply include WispNavigate.js via [jsDelivr](https://www.jsdelivr.com/):

```html
<script src="https://cdn.jsdelivr.net/gh/gmargetic/wispnavigate.js/wisp-navigate.min.js"></script>
```

### Include the script in your project:

```html
<script src="WispNavigate.js"></script>
```

### ~NPM~

~npm install wisp-navigate~

(NPM package is not yet available.)


### Or import it via your bundler.

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

- `wisp:navigate-before` - Fired before navigation starts. Can be prevented using `event.preventDefault()`.
- `wisp:navigate-start` - Fired once navigation starts (after confirmation that it should proceed).
- `wisp:navigate-before-dom-update` - Fired before updating the DOM, providing access to the new document.
- `wisp:navigate-after-dom-update` - Fired after the DOM is updated, but before pushState.
- `wisp:navigate-success` - Fired after successful navigation.
- `wisp:navigate-error` - Fired when navigation fails.
- `wisp:navigate-complete` - Always fired when navigation is complete, regardless of success or failure.

Example:

```javascript
document.addEventListener('wisp:navigate-success', (event) => {
    console.log('Navigation successful to:', e.detail.url);
});
```

---

## License

GNU GENERAL PUBLIC LICENSE Version 3
[LICENSE](LICENSE)

---
