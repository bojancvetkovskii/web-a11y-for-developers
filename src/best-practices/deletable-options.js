const optionsList = document.querySelector('.options-list');
const resetListButton = optionsList.nextElementSibling;
const originalOptions = Array.from(optionsList.querySelectorAll('li')).map((el) =>
  el.cloneNode(true),
);

resetListButton.addEventListener('click', () => {
  optionsList.textContent = '';
  originalOptions.forEach((item) => optionsList.appendChild(item));
});

// Event delegation for better performance - fewer click listeners
optionsList.addEventListener('click', (e) => {
  const removeButton = e.target.closest('button.remove');
  if (!removeButton) return;

  const currentOptions = Array.from(optionsList.querySelectorAll('li'));
  const deletingLastElement = currentOptions.length === 1;

  const listElement = removeButton.parentElement;
  const idx = currentOptions.indexOf(listElement);

  if (idx === -1) return;

  let newIdx;

  if (idx === currentOptions.length - 1) {
    // Deleting last element - move focus to previous element
    newIdx = Math.max(idx - 1, 0);
  } else {
    // Deleting any other element - move focus to next element
    newIdx = idx + 1;
  }

  if (deletingLastElement) {
    // Focus an "Add item" button or something similar
    resetListButton.focus();
  } else {
    // Focus the new item (depends on what you need to focus on your own items)
    currentOptions[newIdx].querySelector('button.remove')?.focus();
  }
  // Delete the clicked item
  listElement.remove();
});
