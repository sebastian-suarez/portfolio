import { ProjectCard } from './ProjectCard';
import { projects } from '../data/projects';

export function WorkSection() {
  return (
    <section id="work" className="py-40" aria-labelledby="work-heading">
      <div className="wrap work-grid">
        <div className="pin flex flex-col gap-5">
          <h2
            id="work-heading"
            className="font-display m-0 text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.015em] text-ink"
          >
            Selected work
          </h2>
          <p className="m-0 max-w-[36ch] text-muted">
            Three projects where the architecture is the point. Client work stays under NDA; these are mine.
          </p>
        </div>
        <div className="flex min-w-0 flex-col gap-10">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
