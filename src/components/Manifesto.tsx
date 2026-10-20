import { Fragment, type CSSProperties } from 'react';
import { manifesto } from '../data/manifesto';

export function Manifesto() {
  const words = manifesto.split(' ');
  return (
    <section id="approach" className="section wrap" aria-labelledby="approach-heading">
      <div className="manifesto glass-panel">
        <h2 id="approach-heading">How I work</h2>
        <p className="scrub">
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
