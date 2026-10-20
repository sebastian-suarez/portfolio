import { ArrowIcon } from './Icons';
import { site } from '../data/site';

/**
 * `base` is '' on the home page (plain #hash links) and '/' elsewhere, so the
 * nav still lands on the home page's sections from /404.html at any path.
 */
export function Header({ base = '' }: { base?: '' | '/' }) {
  return (
    <header className="identity-strip">
      <a className="personal-name" href={base ? '/' : '#top'}>
        <span className="signature" aria-hidden="true">
          ss
        </span>
        <span>
          <strong>{site.name}</strong>
          <span>{site.role}</span>
        </span>
      </a>
      <nav aria-label="Main navigation">
        <a href={`${base}#work`}>Work</a>
        <a href={`${base}#projects`}>Projects</a>
        <a href={`${base}#experience`}>Experience</a>
        <a href={`${base}#contact`}>Contact</a>
      </nav>
      <a className="resume-action" href="/resume/">
        Read résumé <ArrowIcon />
      </a>
    </header>
  );
}
