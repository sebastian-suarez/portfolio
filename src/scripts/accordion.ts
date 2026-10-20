/**
 * Gives the accordion buttons a real toggle. Hover and focus still preview a
 * pane through CSS; a click (or Enter/Space) opens it and sets aria-expanded.
 * On touch and narrow layouts the chips are visible by default, so those
 * buttons start expanded and a click collapses them instead.
 */
export function initAccordion(): void {
  const panes = Array.from(document.querySelectorAll<HTMLElement>('.acc .pane'));
  if (panes.length === 0) return;
  const compact = window.matchMedia('(hover: none), (max-width: 899px)');

  const entries = panes.flatMap((pane) => {
    const button = pane.querySelector<HTMLButtonElement>('.pane-btn');
    return button ? [{ pane, button }] : [];
  });
  const set = (entry: (typeof entries)[number], open: boolean) => {
    entry.pane.dataset.state = open ? 'open' : 'closed';
    entry.button.setAttribute('aria-expanded', String(open));
  };

  if (compact.matches) entries.forEach((entry) => set(entry, true));

  for (const entry of entries) {
    entry.button.addEventListener('click', () => {
      const open = entry.button.getAttribute('aria-expanded') !== 'true';
      if (open && !compact.matches) {
        for (const other of entries) if (other !== entry) set(other, false);
      }
      set(entry, open);
    });
  }
}
