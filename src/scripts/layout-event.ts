/**
 * Fired after something other than a resize changes the page layout (a client-work
 * tab switch). Helpers that measure the page listen for it and re-measure.
 */
export const LAYOUT_EVENT = 'folio:layout';

export function announceLayout(): void {
  // Let the browser apply the change before anyone measures.
  requestAnimationFrame(() => window.dispatchEvent(new Event(LAYOUT_EVENT)));
}
