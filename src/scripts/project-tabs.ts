import { announceLayout } from './layout-event';

/**
 * Client-work tabs, ported from the new design's folio.js. Without JS every panel
 * shows stacked and the tab list stays hidden. Tabs are toggle buttons
 * (aria-pressed); the active panel is kept in the URL hash, so links work, and in
 * history state, so Back returns to whichever tab each entry showed.
 */
export function initProjectTabs(): void {
  const root = document.querySelector<HTMLElement>('.client-work');
  if (!root) return;
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('.project-tab'));
  const panels = Array.from(root.querySelectorAll<HTMLElement>('.project-panel'));
  const panelFor = (button: HTMLButtonElement) => document.getElementById(button.getAttribute('aria-controls') ?? '');
  if (buttons.length === 0 || buttons.length !== panels.length || buttons.some((button) => !panelFor(button))) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const initialButton = buttons.find((button) => button.getAttribute('aria-pressed') === 'true') ?? buttons[0];
  const initial = panelFor(initialButton) as HTMLElement;
  let active: HTMLElement | null = null;
  let animation: Animation | null = null;

  const fromHash = () => panels.find((panel) => `#${panel.id}` === window.location.hash);
  const byId = (id: unknown) => panels.find((panel) => panel.id === id);
  const currentState = (): Record<string, unknown> =>
    history.state && typeof history.state === 'object' ? (history.state as Record<string, unknown>) : {};

  function select(panel: HTMLElement | null | undefined, updateURL = false, animate = true): void {
    if (!panel || panel === active) return;
    const previous = active;
    if (animation) {
      animation.cancel();
      animation = null;
    }
    for (const item of panels) item.hidden = item !== panel;
    for (const button of buttons) button.setAttribute('aria-pressed', String(button.getAttribute('aria-controls') === panel.id));
    active = panel;
    if (updateURL) {
      // Record the tab being left on the entry being left, then push the new one.
      if (previous) history.replaceState({ ...currentState(), project: previous.id }, '');
      history.pushState({ project: panel.id }, '', `#${panel.id}`);
    }
    if (animate && previous && !reducedMotion.matches && typeof panel.animate === 'function') {
      // The design's crossfade.
      animation = panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 280, easing: 'cubic-bezier(.22,1,.36,1)' });
    }
    // Panels differ in height and unhide diagrams: overflow and scroll positions must be re-measured.
    announceLayout();
  }

  for (const button of buttons) button.addEventListener('click', () => select(panelFor(button), true));

  const restore = () => {
    const panel = fromHash();
    if (panel) select(panel, false, false);
    else if (!window.location.hash || window.location.hash === '#top' || window.location.hash === '#work') select(initial, false, false);
  };
  window.addEventListener('popstate', (event) => {
    const remembered = byId((event.state as { project?: unknown } | null)?.project);
    if (remembered) select(remembered, false, false);
    else restore();
  });
  window.addEventListener('hashchange', restore);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches && animation) {
      animation.cancel();
      animation = null;
    }
  });

  select(fromHash() ?? initial, false, false);
  root.dataset.tabs = 'ready';
}
