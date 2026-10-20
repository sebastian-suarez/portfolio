import { LAYOUT_EVENT } from './layout-event';

/**
 * GSAP ScrollTrigger fallback for browsers without CSS scroll-driven animations.
 * Values mirror the CSS in global.css: the manifesto word scrub runs over the
 * paragraph's cover range, each word from 8% + i * 0.5% to 22% + i * 0.5%,
 * and moves colour (never opacity) from --scrub-from to ink so text stays readable;
 * the card rise covers entry 0% → 70%, which is 0.7 × min(card height, viewport
 * height) of scrolling from the moment the card's top crosses the viewport bottom.
 * The pinned column is position: sticky, which needs no fallback.
 */
export async function initMotionFallback(): Promise<void> {
  if (typeof CSS === 'undefined' || typeof CSS.supports !== 'function') return;
  if (CSS.supports('animation-timeline: view()')) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const words = Array.from(document.querySelectorAll<HTMLElement>('.scrub .word'));
  const manifesto = document.querySelector<HTMLElement>('.scrub');
  const cards = Array.from(document.querySelectorAll<HTMLElement>('.rise'));
  if (!manifesto && cards.length === 0) return;

  const [{ gsap }, { ScrollTrigger }] = await Promise.all([import('gsap'), import('gsap/ScrollTrigger')]);
  gsap.registerPlugin(ScrollTrigger);

  if (manifesto && words.length > 0) {
    const styles = getComputedStyle(document.documentElement);
    const from = styles.getPropertyValue('--scrub-from').trim() || '#7d8aa3';
    const to = styles.getPropertyValue('--color-ink').trim() || '#233047';
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: manifesto, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    words.forEach((word, i) => {
      const start = 0.08 + i * 0.005;
      timeline.fromTo(word, { color: from }, { color: to, duration: 0.14, ease: 'none' }, start);
    });
    // Pad the timeline to the full cover range so scroll progress maps 1:1.
    timeline.set({}, {}, 1);
  }

  for (const card of cards) {
    gsap.fromTo(
      card,
      { opacity: 0.25, scale: 0.94, y: 24 },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: () => `+=${Math.round(0.7 * Math.min(card.offsetHeight, window.innerHeight))}`,
          invalidateOnRefresh: true,
          scrub: true,
        },
      },
    );
  }

  // Tab switches change the page height; trigger positions below the tabs go stale.
  window.addEventListener(LAYOUT_EVENT, () => ScrollTrigger.refresh());
}
