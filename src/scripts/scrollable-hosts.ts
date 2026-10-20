import { LAYOUT_EVENT } from './layout-event';

/**
 * Diagram hosts render with tabindex="0" so they are keyboard-scrollable
 * without JavaScript. Once scripts run, keep that (and the scroll hint) only
 * while a host actually overflows, so desktop readers get no idle tab stops.
 * Hosts inside a hidden tab panel measure 0, so tab switches re-run the check.
 */
export function initScrollableHosts(): void {
  const hosts = Array.from(document.querySelectorAll<HTMLElement>('.dg-host'));
  if (hosts.length === 0) return;

  const update = () => {
    for (const host of hosts) {
      const overflows = host.scrollWidth > host.clientWidth + 1;
      host.toggleAttribute('data-scrollable', overflows);
      if (overflows) host.tabIndex = 0;
      else host.removeAttribute('tabindex');
    }
  };

  update();
  let frame = 0;
  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(update);
  };
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener(LAYOUT_EVENT, schedule);
}
