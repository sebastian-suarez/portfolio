/**
 * Plays each diagram's entrance once, the first time it scrolls into view, and runs
 * its travelling pulses only while it is on screen.
 *
 * States on `.dg-wrap[data-reveal]`: none (no JS yet; a CSS failsafe shows the
 * diagram after a few seconds), `armed` (hidden, waiting) and `in` (shown). The
 * hidden state lives in CSS under `prefers-reduced-motion: no-preference`, so
 * reduced motion and no-JS both get the finished diagram.
 */
export function initDiagramReveal(): void {
  const wraps = Array.from(document.querySelectorAll<HTMLElement>('.dg-wrap'));
  if (wraps.length === 0) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');

  const run = (wrap: HTMLElement, on: boolean) => {
    const svg = wrap.querySelector<SVGSVGElement>('svg');
    if (!svg || typeof svg.pauseAnimations !== 'function') return;
    if (on) svg.unpauseAnimations();
    else svg.pauseAnimations();
  };

  if (!('IntersectionObserver' in window)) {
    for (const wrap of wraps) wrap.dataset.reveal = 'in';
    return;
  }

  for (const wrap of wraps) {
    wrap.dataset.reveal = reduced.matches ? 'in' : 'armed';
    run(wrap, false);
  }

  const visible = new Set<HTMLElement>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const wrap = entry.target as HTMLElement;
        if (entry.isIntersecting) visible.add(wrap);
        else visible.delete(wrap);
        if (entry.isIntersecting) wrap.dataset.reveal = 'in';
        run(wrap, entry.isIntersecting && !reduced.matches);
      }
    },
    { threshold: 0.3 },
  );
  for (const wrap of wraps) observer.observe(wrap);

  reduced.addEventListener('change', () => {
    for (const wrap of wraps) {
      if (reduced.matches) wrap.dataset.reveal = 'in';
      run(wrap, !reduced.matches && visible.has(wrap));
    }
  });
}
