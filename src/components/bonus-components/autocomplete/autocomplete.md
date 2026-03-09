## Autocomplete (Combobox)

An **autocomplete** is a text input that suggests options as the user types. We build it as a **combobox** with a **listbox** of suggestions, using the same ideas as the other components: clear semantics, a single source of truth for state, and keyboard-friendly behavior.

From an accessibility standpoint we care about:

- Correct **roles** (combobox, listbox, option)
- **ARIA** that exposes expanded state and the currently highlighted suggestion
- **Keyboard** support (arrows, Enter, Escape)
- **Focus** staying in the input while the highlighted option is exposed to assistive tech

### HTML

We need:

- A **text input** that acts as the combobox
- A **listbox** (container with `role="listbox"`) whose options we show or hide based on the input value
- A **label** so the combobox has an accessible name

The listbox can start empty; we fill it with options from a data source (e.g. a `data-suggestions` attribute) and filter as the user types.

Example:

```html
<div
  class="autocomplete"
  data-autocomplete
  data-suggestions='["Apple", "Apricot", "Banana", "Cherry"]'
>
  <label for="autocomplete-input-1">Search fruit</label>
  <input
    id="autocomplete-input-1"
    type="text"
    class="autocomplete-input"
    role="combobox"
    aria-expanded="false"
    aria-controls="autocomplete-list-1"
    aria-autocomplete="list"
    aria-activedescendant=""
    autocomplete="off"
  />
  <div
    id="autocomplete-list-1"
    class="autocomplete-listbox"
    role="listbox"
    aria-label="Suggestions"
  >
    <!-- Options rendered by JS -->
  </div>
</div>
```

### ARIA attributes

#### Input (combobox)

- `role="combobox"`
  - Tells assistive technologies this is a combobox (an input that controls a list of suggestions).
- `aria-expanded="true|false"`
  - Whether the listbox is visible. We use this as the **single source of truth** for open/closed (same idea as accordion and dropdown).
- `aria-controls="autocomplete-list-1"`
  - Links the input to the listbox element.
- `aria-autocomplete="list"`
  - Indicates that suggestions are presented as a list (not inline completion).
- `aria-activedescendant="id-of-option"`
  - When the user moves through suggestions with the keyboard, we **do not move focus** into the list. Instead we keep focus in the input and set `aria-activedescendant` to the id of the currently highlighted option. Screen readers then announce that option as the “current” suggestion.

#### Listbox and options

- The list container has `role="listbox"` and an `id` that matches `aria-controls`.
- Each suggestion is a `role="option"` with a unique `id` (e.g. `autocomplete-list-1-option-0`) so we can reference it in `aria-activedescendant`.
- The highlighted option can also have `aria-selected="true"` for clarity.

### Keyboard controls

- **Arrow Down**: Open the list if closed; move the highlight to the next option (wrap to first at the end).
- **Arrow Up**: Move the highlight to the previous option (wrap to last at the start).
- **Enter**: Select the highlighted option (fill the input with its value and close the list).
- **Escape**: Close the list and clear the highlight; focus stays in the input.
- **Tab / Shift+Tab**: Close the list and move focus out (normal tab order).

Typing filters the list and opens it when there are matches; we update the highlighted option (e.g. first match) and `aria-activedescendant` accordingly.

### JavaScript

- **Single source of truth**: `aria-expanded` on the input. When there are filtered results we set it to `true` and show the listbox; when there are none or the user closes, we set it to `false`.
- **Filter**: On input (optionally debounced), filter the suggestions (e.g. prefix or substring match), re-render the listbox options with stable ids, set `aria-expanded`, and set `aria-activedescendant` to the first option’s id when the list opens.
- **Keyboard**: On keydown, handle Arrow Down/Up (update highlight and `aria-activedescendant`), Enter (select), Escape (close). Optionally scroll the highlighted option into view.
- **Mouse**: Clicking an option selects it (fills the input and closes the list).
- **Click outside**: Close the list when the user clicks elsewhere.

### CSS (Anchor positioning)

We position the listbox below the input using **CSS Anchor Positioning** (same idea as the dropdown):

- The input has `anchor-name: --autocomplete-input`.
- The listbox uses `position: fixed`, `position-anchor`, and `top: anchor(bottom)` (and a `@position-try` fallback) so it appears below and flips above when it would overflow the viewport.

We show or hide the listbox with CSS that keys off `aria-expanded` (e.g. `.autocomplete:has([role="combobox"][aria-expanded="true"]) .autocomplete-listbox { display: block }`).

### Debouncing (optional)

To avoid filtering on every keystroke while the user is typing quickly, we **debounce** the filter: on `input`, start a short timer (e.g. 250 ms); if another `input` fires before the timer runs, reset it. When the timer runs, run the filter and update the list. Arrow keys and Enter should run immediately (no debounce).

### Data structures: Tries

For **prefix-based** autocomplete (suggestions that start with the typed text), a **Trie** (prefix tree) is a good fit: each node represents a character, and we can quickly find all suggestions that share a prefix. The demo here uses a simple array filter; for large lists or strict prefix matching, a Trie is more efficient.

- [Trie (Wikipedia)](https://en.wikipedia.org/wiki/Trie)
- [WAI-ARIA APG: Combobox (Autocomplete)](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)

### Testing checklist

- **Mouse**: Typing shows filtered suggestions; clicking an option fills the input and closes the list; click outside closes the list.
- **Keyboard**:
  - Arrow Down/Up moves the highlight (with wrap); screen reader announces the highlighted option.
  - Enter selects the highlighted option.
  - Escape closes the list and clears the highlight.
  - Tab closes the list and moves focus.
- **Focus**: Focus stays in the input; the highlighted suggestion is exposed via `aria-activedescendant`.
- **Screen reader**: Combobox is announced with its label; expanded state and current suggestion are announced.
