import { ArrowIcon } from './Icons';
import { Diagram } from './diagram/Diagram';
import type { Project } from '../data/projects';

/** Card diagrams are 760 wide; the floor keeps their text legible on phones. */
const CARD_DIAGRAM_MIN_SCALE = 0.6;

export function ProjectCard({ title, blurb, tags, repo, diagram }: Project) {
  return (
    <article className="card glass-panel rise">
      <div className="card-head">
        <h3>{title}</h3>
        <p>{blurb}</p>
      </div>
      <Diagram data={diagram} minScale={CARD_DIAGRAM_MIN_SCALE} />
      <div className="card-foot">
        <ul className="chips" aria-label="Stack">
          {tags.map((tag) => (
            <li key={tag} className="chip">
              {tag}
            </li>
          ))}
        </ul>
        {repo ? (
          <a className="replink" href={repo} aria-label={`${title}: repository on GitHub`}>
            Repository <ArrowIcon />
          </a>
        ) : null}
      </div>
    </article>
  );
}
