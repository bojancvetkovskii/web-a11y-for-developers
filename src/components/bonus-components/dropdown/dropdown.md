## Dropdown (Menu)

A menu dropdown is a common UI pattern: a **trigger button** that opens a **popup menu** with a list
of actions.

Just like the other components in this course, we will build it by focusing on:

- HTML (semantic) structure
- ARIA attributes
- Keyboard accessibility rules
- Focus management rules
- A single source of truth for state

### HTML

This pattern is commonly referred to as a **menu button**:

- A `button` that opens a popup menu
- A container with `role="menu"`
- Items inside it with `role="menuitem"`

Example:

```html
<div class="dropdown" data-dropdown>
  <button
    type="button"
    id="dropdown-trigger-1"
    class="dropdown-trigger"
    aria-haspopup="menu"
    aria-expanded="false"
    aria-controls="dropdown-menu-1"
  >
    Account
  </button>

  <div id="dropdown-menu-1" class="dropdown-menu" role="menu" aria-labelledby="dropdown-trigger-1">
    <button type="button" role="menuitem" tabindex="-1">Profile</button>
    <button type="button" role="menuitem" tabindex="-1">Settings</button>
    <button type="button" role="menuitem" tabindex="-1">Log out</button>
  </div>
</div>
```

### ARIA attributes

#### Trigger button

- `aria-haspopup="menu"`
  - Tells assistive technologies the button opens a **menu** popup.
- `aria-controls="dropdown-menu-1"`
  - Connects the button with the element it controls (the menu).
- `aria-expanded="true|false"`
  - Conveys whether the controlled popup is open or closed.
  - We will use this as our **single source of truth** for open/closed state (same idea as the accordion).

#### Menu container

- `role="menu"`
  - Declares the popup as a menu.
- `aria-labelledby="dropdown-trigger-1"`
  - Labels the menu using the trigger’s visible text (“Account”).

### Keyboard controls

We need to support both opening/closing and navigating inside the menu.

#### Open/close

- **Click** on the trigger toggles the menu.
- **Escape** closes the menu and returns focus to the trigger.
- **Click outside** closes the menu.
- **Tab away** closes the menu (and lets the browser move focus naturally).

#### Navigate menu items (roving tabindex)

Menus should support arrow key navigation. But there’s a catch:

If every menu item is focusable, keyboard users would have to `Tab` through all of them to leave the
menu. This is the same usability problem we discussed with Tabs.

So we use **roving tabindex**:

- Exactly one menu item has `tabindex="0"` (focusable).
- All other menu items have `tabindex="-1"` (not in the tab order).
- Arrow keys move which item is focusable and then move focus to it.

For this component we will **wrap around**:

- ArrowDown on the last item moves to the first
- ArrowUp on the first item moves to the last

### JavaScript

We will wire the menu button up similarly to the Tabs/Modal patterns from the course:

- We keep state in one place: `aria-expanded`
- When opening: move focus into the menu (first item)
- When closing: move focus back to the trigger (unless the user is tabbing/clicking elsewhere)
- Implement arrow-key navigation by moving the roving tabindex

```js
const dropdowns = document.querySelectorAll('[data-dropdown]');

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const openTrigger = document.querySelector('[aria-haspopup="menu"][aria-expanded="true"]');
  if (!openTrigger) return;

  e.preventDefault();
  setExpanded(openTrigger, false, true);
});

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector('[aria-haspopup="menu"]');
  const menu = getMenu(trigger);
  const items = menu?.querySelectorAll('[role="menuitem"]') ?? [];

  items.forEach((item) => item.setAttribute('tabindex', '-1'));

  trigger?.addEventListener('click', (e) => {
    e.preventDefault();
    setExpanded(trigger, !isExpanded(trigger), true);
  });

  trigger?.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    e.preventDefault();
    setExpanded(trigger, true, false);
    focusItem(items, e.key === 'ArrowUp' ? items.length - 1 : 0);
  });

  menu?.addEventListener('keydown', (e) => {
    const activeIdx = getActiveIdx(items);
    if (activeIdx === -1) return;

    let nextIdx;

    if (e.key === 'ArrowDown') nextIdx = (activeIdx + 1) % items.length;
    else if (e.key === 'ArrowUp') nextIdx = (activeIdx - 1 + items.length) % items.length;
    else if (e.key === 'Home') nextIdx = 0;
    else if (e.key === 'End') nextIdx = items.length - 1;
    else if (e.key === 'Tab') return setExpanded(trigger, false, false);
    else return;

    e.preventDefault();
    focusItem(items, nextIdx);
  });

  menu?.addEventListener('click', (e) => {
    if (!e.target.closest('[role="menuitem"]')) return;
    setExpanded(trigger, false, true);
  });

  dropdown.addEventListener('focusout', (e) => {
    if (!isExpanded(trigger)) return;
    if (dropdown.contains(e.relatedTarget)) return;
    setExpanded(trigger, false, false);
  });

  document.addEventListener('click', (e) => {
    if (!isExpanded(trigger)) return;
    if (dropdown.contains(e.target)) return;
    setExpanded(trigger, false, false);
  });
});

function getMenu(trigger) {
  if (!trigger) return null;
  return document.getElementById(trigger.getAttribute('aria-controls'));
}

function isExpanded(trigger) {
  return trigger?.getAttribute('aria-expanded') === 'true';
}

function setExpanded(trigger, expanded, restoreFocus) {
  if (!trigger) return;

  // ? Single source of truth: `aria-expanded`
  trigger.setAttribute('aria-expanded', String(Boolean(expanded)));

  const menu = getMenu(trigger);
  const items = menu?.querySelectorAll('[role="menuitem"]') ?? [];

  if (expanded) {
    items.forEach((item, idx) => item.setAttribute('tabindex', idx === 0 ? '0' : '-1'));
    items[0]?.focus();
  } else {
    items.forEach((item) => item.setAttribute('tabindex', '-1'));
    if (restoreFocus) trigger.focus();
  }
}

function getActiveIdx(items) {
  return Array.from(items).findIndex((item) => item === document.activeElement);
}

function focusItem(items, idx) {
  items.forEach((item, itemIdx) => item.setAttribute('tabindex', itemIdx === idx ? '0' : '-1'));
  items[idx]?.focus();
}
```

### CSS (Anchor positioning + anchor-size)

We can position the popup menu relative to the trigger using **CSS Anchor Positioning**.

- The trigger is declared as an anchor using `anchor-name`.
- The menu is linked to it with `position-anchor`.
- The menu is placed under it with `position-area: bottom left`.

And here’s the neat part:

We can also size the menu based on the anchor using `anchor-size()`.
For example, make the menu at least as wide as the trigger:

```css
.dropdown-menu {
  min-width: anchor-size(--dropdown-trigger width, 12rem);
}
```

### Testing checklist

- **Mouse**: click trigger opens/closes, click outside closes
- **Keyboard**:
  - Enter/Space on trigger opens
  - ArrowDown/ArrowUp moves through items (roving tabindex)
  - Escape closes and returns focus to trigger
  - Tab closes and continues tabbing through the page
- **Focus**: focus moves into the menu on open; never “gets lost”
- **Screen reader**: trigger announces it has a popup menu and whether it’s expanded

Note: `role="menu"` is best for application-style action menus. For simple “list of links” navigation, a semantic list is often the better choice.

