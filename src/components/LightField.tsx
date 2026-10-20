/**
 * The blurred rings and fold the glass panels sit on. Decorative only.
 * `variant` picks one of the placements defined in global.css.
 */
export function LightField({ variant }: { variant: 'top' | 'middle' | 'bottom' }) {
  return (
    <div className={`light-field light-field-${variant}`} aria-hidden="true">
      <span className="light-ring ring-one" />
      <span className="light-ring ring-two" />
      <span className="light-fold" />
    </div>
  );
}
