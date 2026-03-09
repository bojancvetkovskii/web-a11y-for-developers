const DEBOUNCE_MS = 150;

function debounce(fn, ms) {
  let timer = null;

  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

const autocompletes = document.querySelectorAll('[data-autocomplete]');

autocompletes.forEach((root) => {
  const input = root.querySelector('[role="combobox"]');

  const listbox = getListbox(input);
  if (!input || !listbox) return;

  const suggestions = parseSuggestions(root);
  let activeIndex = -1;

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();

      openIfClosed();
      moveHighlight(1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();

      openIfClosed();
      moveHighlight(-1);
    } else if (e.key === 'Enter') {
      e.preventDefault();

      const options = listbox.querySelectorAll('[role="option"]');

      if (options[activeIndex]) {
        selectOption(options[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();

      setExpanded(false);
      activeIndex = -1;
      input.setAttribute('aria-activedescendant', '');
    }
  });

  listbox.addEventListener('click', (e) => {
    const option = e.target.closest('[role="option"]');

    if (option) selectOption(option);
  });

  document.addEventListener('click', (e) => {
    if (root.contains(e.target)) return;

    setExpanded(false);
  });

  function openIfClosed() {
    if (input.getAttribute('aria-expanded') !== 'true') runFilter();
  }

  function runFilter() {
    const q = (input.value || '').trim().toLowerCase();
    let filtered = suggestions;

    if (q !== '') {
      filtered = suggestions.filter(
        (s) => s.toLowerCase().startsWith(q) || s.toLowerCase().includes(q),
      );
    }

    renderOptions(filtered);

    const expanded = filtered.length > 0;
    setExpanded(expanded);
    activeIndex = expanded ? 0 : -1;

    if (!expanded) {
      input.setAttribute('aria-activedescendant', '');
      return;
    }

    const options = listbox.querySelectorAll('[role="option"]');
    options.forEach((o) => o.removeAttribute('aria-selected'));

    if (options[0]) {
      input.setAttribute('aria-activedescendant', options[0].id);
      options[0].setAttribute('aria-selected', 'true');
      options[0].scrollIntoView({ block: 'nearest' });
    }
  }

  const debouncedRunFilter = debounce(runFilter, DEBOUNCE_MS);

  input.addEventListener('input', () => debouncedRunFilter());

  function renderOptions(items) {
    const listboxId = listbox.id;

    listbox.replaceChildren(
      ...items.map((text, i) => {
        const el = document.createElement('div');
        el.id = `${listboxId}-option-${i}`;
        el.setAttribute('role', 'option');
        el.textContent = text;
        return el;
      }),
    );
  }

  function moveHighlight(delta) {
    const options = listbox.querySelectorAll('[role="option"]');
    if (options.length === 0) return;

    options.forEach((o) => o.removeAttribute('aria-selected'));

    activeIndex = (activeIndex + delta + options.length) % options.length;
    const active = options[activeIndex];

    input.setAttribute('aria-activedescendant', active.id);
    active.setAttribute('aria-selected', 'true');
    active.scrollIntoView({ block: 'nearest' });
  }

  function selectOption(option) {
    input.value = option.textContent ?? '';
    setExpanded(false);
    activeIndex = -1;

    input.setAttribute('aria-activedescendant', '');
  }

  function setExpanded(expanded) {
    input.setAttribute('aria-expanded', String(expanded));
  }
});

function getListbox(combobox) {
  const id = combobox?.getAttribute('aria-controls');
  if (!id) return null;

  return document.getElementById(id);
}

function parseSuggestions(root) {
  try {
    const raw = root.getAttribute('data-suggestions');
    if (!raw) return [];

    return JSON.parse(raw);
  } catch {
    return [];
  }
}
