import { Fragment, type CSSProperties } from 'react';
import { manifesto } from '../data/manifesto';

export function Manifesto() {
  const words = manifesto.split(' ');
  return (
    <section id="approach" className="border-t border-line py-40" aria-labelledby="approach-heading">
      <div className="wrap flex flex-col items-center gap-7 text-center">
        <h2 id="approach-heading" className="m-0 text-[18px] font-medium text-muted">
          How I work
        </h2>
        <p className="scrub m-0 max-w-[1000px] text-[clamp(1.75rem,3vw,2.75rem)] leading-[1.25] font-medium tracking-[-0.01em] text-ink">
          {words.map((word, i) => (
            <Fragment key={i}>
              <span className="word" style={{ '--i': i } as CSSProperties}>
                {word}
              </span>
              {i < words.length - 1 ? ' ' : null}
            </Fragment>
          ))}
        </p>
      </div>
    </section>
  );
}
