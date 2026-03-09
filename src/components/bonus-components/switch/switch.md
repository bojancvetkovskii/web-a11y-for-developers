## Switch

The Switch is a UI control that represents an immediate **on/off** setting (think "Enable notifications", "Use dark mode", etc.).
From an accessibility standpoint, we want to make sure it has:

- A correct **semantic role**
- A reliable **state attribute**
- Correct **keyboard behavior**
- A visible **focus indicator**

Just like our other components, we'll keep the implementation simple and use a **single source of truth** for state.

### HTML

We'll use a `button` and give it `role="switch"`.

Why a `button`?
Because it's already keyboard-focusable and clickable, and it has built-in "press" semantics.

Now we need to expose the Switch state.
For switches, the state attribute is:

- `aria-checked="true|false"`

This is the equivalent of "on/off" for a switch and it's what screen readers announce.

We also need an accessible name (label). The simplest way is to include visible text inside the button.

Example:

```html
<button type="button" class="switch" role="switch" aria-checked="false">
  <span class="switch-track" aria-hidden="true">
    <span class="switch-thumb" aria-hidden="true"></span>
  </span>
  <span class="switch-label">Enable notifications</span>
</button>
```

Notes:

- The visual track/thumb are marked with `aria-hidden="true"` so they don't pollute the accessibility tree.
- The label text inside the button becomes the Switch's accessible name.

### Keyboard controls

If you use a `button`, you get keyboard interaction for free:

- **Tab**: focuses the switch
- **Enter / Space**: activates it (fires a click)

If you don't use a native interactive element (for example a `div`), then you must implement:

- `tabindex="0"` to make it focusable
- key handling for **Space** and **Enter**

### JavaScript

Just like we did with the Accordion and Tabs, we want a single source of truth to tell us whether the
Switch is on or off.

For the Switch, that source of truth is `aria-checked`.

```js
const switches = document.querySelectorAll('[role="switch"]');

switches.forEach((switchEl) => {
  switchEl.addEventListener('click', (e) => {
    e.preventDefault();
    toggle();
  });

  function toggle() {
    // ? Single source of truth: `aria-checked`
    const checked = switchEl.getAttribute('aria-checked') === 'true';
    switchEl.setAttribute('aria-checked', String(Boolean(!checked)));
  }
});
```

Key idea:

- We are not storing state in a separate variable.
- We read `aria-checked` when we need state, and we update `aria-checked` when state changes.

### CSS

Now that `aria-checked` is our single source of truth, styling becomes easy.
We can key the visuals off of:

- `.switch[aria-checked="true"]`

Example idea:

```css
.switch[aria-checked='true'] .switch-track {
  background: var(--brand-secondary);
  border-color: var(--brand-secondary);
}
```

Also make sure:

- Focus is clearly visible (`:focus-visible`)
- Motion respects user preferences (`prefers-reduced-motion`)

### Testing checklist

- **Mouse**: click toggles state
- **Keyboard**: Tab focuses, Space/Enter toggles
- **Screen reader**: announces something like "Enable notifications, switch, on/off"
- **Focus**: you can always see where you are on the page

If you want to go deeper, check out the [WAI-ARIA APG - Patterns](https://www.w3.org/WAI/ARIA/apg/patterns/switch/) and compare your Switch behavior against them.
