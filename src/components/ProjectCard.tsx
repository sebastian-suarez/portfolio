import { Diagram } from './diagram/Diagram';
import type { Project } from '../data/projects';

/** Card diagrams are 760 wide; the floor keeps their text legible on phones. */
const CARD_DIAGRAM_MIN_SCALE = 0.6;

export function ProjectCard({ title, blurb, tags, repo, diagram }: Project) {
  return (
    <article className="card rise flex min-w-0 flex-col gap-7 rounded-2xl border border-line-2 bg-surface p-10 max-[899px]:p-6">
      <div className="flex flex-col gap-3">
        <h3 className="font-display m-0 text-[34px] leading-[1.05] font-semibold text-ink">{title}</h3>
        <p className="m-0 max-w-[62ch] text-muted">{blurb}</p>
      </div>
      <Diagram data={diagram} minScale={CARD_DIAGRAM_MIN_SCALE} />
      <div className="flex flex-wrap items-center justify-between gap-4">
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0" aria-label="Stack">
          {tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
        <a className="replink text-[16px]" href={repo} aria-label={`${title}: repository`}>
          Repository
        </a>
      </div>
    </article>
  );
}
