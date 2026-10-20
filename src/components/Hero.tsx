import { Diagram } from './diagram/Diagram';
import { torquePath } from './diagram/torquePath';
import { mailto } from '../data/site';

/** 600 wide; 0.58 fits a 390 px phone exactly and keeps the text near 9 px. */
const HERO_DIAGRAM_MIN_SCALE = 0.58;

export function Hero() {
  return (
    <header className="pt-16 pb-24">
      <div className="wrap flex flex-col gap-14">
        <h1 className="enter font-display m-0 max-w-[1000px] text-[clamp(3rem,6.2vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.02em] text-ink">
          Backend lead. Builds the whole machine.
        </h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(560px,100%),1fr))] items-start gap-12">
          <div className="flex max-w-[440px] flex-col gap-8">
            <p className="enter d1 m-0 text-[20px] leading-[1.5] text-muted">
              Node.js, TypeScript and AWS backends for product teams. The same discipline goes into my Rust daemons and
              sim-racing hardware.
            </p>
            <div className="enter d2 flex flex-wrap gap-3">
              <a className="btn btn-primary" href={mailto}>
                Email me
              </a>
              <a className="btn btn-ghost" href="#work">
                See the work
              </a>
            </div>
          </div>
          <figure className="enter d3 m-0 flex w-full max-w-[600px] flex-col gap-[14px] justify-self-end">
            <Diagram data={torquePath} minScale={HERO_DIAGRAM_MIN_SCALE} />
            <figcaption className="text-[14px] leading-[1.4] text-muted">
              Torque path of the RS50 force-feedback bridge, Wine bottle to wheel.
            </figcaption>
          </figure>
        </div>
      </div>
    </header>
  );
}
