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
