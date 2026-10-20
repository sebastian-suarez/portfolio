/**
 * GSAP ScrollTrigger fallback for browsers without CSS scroll-driven animations.
 * Values mirror the CSS in global.css: the manifesto word scrub runs over the
 * paragraph's cover range, each word from 8% + i * 0.5% to 22% + i * 0.5%;
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
    const timeline = gsap.timeline({
      scrollTrigger: { trigger: manifesto, start: 'top bottom', end: 'bottom top', scrub: true },
    });
    words.forEach((word, i) => {
      const start = 0.08 + i * 0.005;
      timeline.fromTo(word, { opacity: 0.18 }, { opacity: 1, duration: 0.14, ease: 'none' }, start);
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
}
