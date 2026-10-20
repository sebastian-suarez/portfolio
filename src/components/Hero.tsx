import { Diagram } from './diagram/Diagram';
import { torquePath } from './diagram/torquePath';
import { mailto } from '../data/site';

/** 600 wide; 0.58 fits a 390 px phone and keeps the text near 9 px. */
const HERO_DIAGRAM_MIN_SCALE = 0.58;

export function Hero() {
  return (
    <section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <h1 id="hero-title" className="enter">
          Backend lead. Builds the whole machine.
        </h1>
        <p className="hero-lede enter d1">
          Node.js, TypeScript and AWS backends for product teams. The same discipline goes into my Rust daemons and
          sim-racing hardware.
        </p>
        <div className="actions enter d2">
          <a className="btn btn-primary" href={mailto}>
            Email me
          </a>
          <a className="btn btn-glass" href="#work">
            See the work
          </a>
        </div>
      </div>
      <figure className="glass-panel hero-figure enter d3">
        <Diagram data={torquePath} minScale={HERO_DIAGRAM_MIN_SCALE} />
        <figcaption>Torque path of the RS50 force-feedback bridge, Wine bottle to wheel.</figcaption>
      </figure>
    </section>
  );
}
