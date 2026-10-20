import { mailto, site } from '../data/site';

export function Contact() {
  return (
    <section id="contact" className="bg-accent pt-[140px] pb-12 text-on-accent" aria-labelledby="contact-heading">
      <div className="wrap flex flex-col gap-24">
        <div className="grid grid-cols-[repeat(auto-fit,minmax(min(520px,100%),1fr))] items-end gap-12">
          <div className="flex flex-col gap-5">
            <h2
              id="contact-heading"
              className="font-display m-0 max-w-[14ch] text-[clamp(2.75rem,5vw,4.5rem)] leading-[0.98] font-bold tracking-[-0.02em] text-on-accent"
            >
              Open to backend lead and architect roles.
            </h2>
            <p className="m-0 max-w-[46ch] text-[20px] leading-[1.5] text-on-accent">
              Product teams first. Remote from Medellín, Colombia, with full US-hours overlap. Senior IC scope works too.
            </p>
          </div>
          <div className="flex flex-col items-start gap-6">
            <a className="btn btn-dark h-[72px] px-9 text-[22px]" href={mailto}>
              Email me
            </a>
            <div className="flex flex-wrap gap-6 text-[17px] font-medium">
              <a className="darklink" href={site.linkedin}>
                LinkedIn
              </a>
              <a className="darklink" href={site.github}>
                GitHub
              </a>
            </div>
          </div>
        </div>
        <footer className="flex flex-wrap justify-between gap-4 border-t border-on-accent pt-6 text-[15px] text-on-accent">
          <span>{site.fullName}</span>
          <span>{site.location}</span>
        </footer>
      </div>
    </section>
  );
}
