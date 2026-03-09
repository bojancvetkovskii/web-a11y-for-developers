const dropdowns = document.querySelectorAll('[data-dropdown]');

window.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;

  const openTrigger = document.querySelector('[aria-haspopup="menu"][aria-expanded="true"]');
  if (!openTrigger) return;

  e.preventDefault();
  setExpanded(openTrigger, false);
});

dropdowns.forEach((dropdown) => {
  const trigger = dropdown.querySelector('[aria-haspopup="menu"]');
  const menu = getMenu(trigger);

  if (!trigger || !menu) return;

  const items = menu.querySelectorAll('[role="menuitem"]');

  items.forEach((item) => item.setAttribute('tabindex', '-1'));

  trigger.addEventListener('click', (e) => {
    e.preventDefault();
    setExpanded(trigger, !isExpanded(trigger));
  });

  trigger.addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;

    e.preventDefault();
    setExpanded(trigger, true);

    focusItem(items, e.key === 'ArrowUp' ? items.length - 1 : 0);
  });

  menu.addEventListener('keydown', (e) => {
    const activeIdx = getActiveIdx(items);
    if (activeIdx === -1) return;

    let nextIdx;

    if (e.key === 'ArrowDown') {
      nextIdx = (activeIdx + 1) % items.length;
    } else if (e.key === 'ArrowUp') {
      nextIdx = (activeIdx - 1 + items.length) % items.length;
    } else if (e.key === 'Home') {
      nextIdx = 0;
    } else if (e.key === 'End') {
      nextIdx = items.length - 1;
    } else if (e.key === 'Tab') {
      // ? Let the browser move focus naturally
      setExpanded(trigger, false);
      return;
    } else {
      return;
    }

    e.preventDefault();
    focusItem(items, nextIdx);
  });

  menu.addEventListener('click', (e) => {
    const menuItem = e.target.closest('[role="menuitem"]');
    if (!menuItem) return;

    setExpanded(trigger, false);
  });

  dropdown.addEventListener('focusout', (e) => {
    if (!isExpanded(trigger)) return;
    if (dropdown.contains(e.relatedTarget)) return;

    setExpanded(trigger, false);
  });

  document.addEventListener('click', (e) => {
    if (!isExpanded(trigger)) return;
    if (dropdown.contains(e.target)) return;

    setExpanded(trigger, false);
  });
});

function getMenu(trigger) {
  if (!trigger) return null;

  return document.getElementById(trigger.getAttribute('aria-controls'));
}

function isExpanded(trigger) {
  return trigger?.getAttribute('aria-expanded') === 'true';
}

function setExpanded(trigger, expanded) {
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
    trigger.focus();
  }
}

function getActiveIdx(items) {
  return Array.from(items).findIndex((item) => item === document.activeElement);
}

function focusItem(items, idx) {
  items.forEach((item, itemIdx) => item.setAttribute('tabindex', itemIdx === idx ? '0' : '-1'));
  items[idx]?.focus();
}
