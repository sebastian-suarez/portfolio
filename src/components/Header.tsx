import { ArrowIcon } from './Icons';
import { site } from '../data/site';

export function Header() {
  return (
    <header className="identity-strip">
      <a className="personal-name" href="#top">
        <span className="signature" aria-hidden="true">
          ss
        </span>
        <span>
          <strong>{site.name}</strong>
          <span>{site.role}</span>
        </span>
      </a>
      <nav aria-label="Main navigation">
        <a href="#work">Work</a>
        <a href="#projects">Projects</a>
        <a href="#experience">Experience</a>
        <a href="#contact">Contact</a>
      </nav>
      <a className="resume-action" href="/resume/">
        Read résumé <ArrowIcon />
      </a>
    </header>
  );
}
