import { mailto, site } from '../data/site';

export function Nav() {
  return (
    <nav className="sticky top-0 z-10 border-b border-line bg-ground" aria-label="Primary">
      <div className="wrap flex min-h-[72px] flex-wrap items-center justify-between gap-6">
        <a
          href="#top"
          className="font-display text-[22px] font-bold leading-none tracking-[0.01em] text-ink no-underline hover:text-ink"
        >
          {site.name}
        </a>
        <div className="flex flex-wrap items-center gap-7">
          <a className="navlink text-[15px]" href="#work">
            Work
          </a>
          <a className="navlink text-[15px]" href="#approach">
            Approach
          </a>
          <a className="navlink text-[15px]" href="#contact">
            Contact
          </a>
          <a className="btn btn-primary hidden h-[42px] px-[18px] text-[15px] min-[400px]:inline-flex" href={mailto}>
            Email me
          </a>
        </div>
      </div>
    </nav>
  );
}
