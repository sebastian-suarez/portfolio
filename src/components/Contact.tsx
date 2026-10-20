import { ArrowIcon } from './Icons';
import { LightField } from './LightField';
import { mailto, site } from '../data/site';

export function Contact() {
  return (
    <>
      <section id="contact" className="contact section" aria-labelledby="contact-heading">
        <LightField variant="bottom" />
        <div className="wrap">
          <div className="contact-slab glass-panel">
            <div className="contact-copy">
              <h2 id="contact-heading">Open to backend lead and architect roles.</h2>
              <p>
                Product teams first. Remote from Medellín, Colombia, with full US-hours overlap. Senior IC scope works
                too.
              </p>
            </div>
            <div className="contact-actions">
              <a className="email" href={mailto}>
                {site.email} <ArrowIcon />
              </a>
              <div className="contact-links">
                <a href={site.github}>
                  GitHub <ArrowIcon />
                </a>
                <a href={site.linkedin}>
                  LinkedIn <ArrowIcon />
                </a>
                <a href="/resume/">
                  Résumé <ArrowIcon />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <footer className="site-footer wrap">
        <span>© {site.fullName}</span>
        <span>{site.location}</span>
        <a href="#top">
          Back to top <span aria-hidden="true">↑</span>
        </a>
      </footer>
    </>
  );
}
