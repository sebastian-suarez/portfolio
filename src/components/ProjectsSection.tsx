import { LightField } from './LightField';
import { ProjectCard } from './ProjectCard';
import { projects } from '../data/projects';

export function ProjectsSection() {
  return (
    <section id="projects" className="projects section" aria-labelledby="projects-title">
      <LightField variant="middle" />
      <div className="wrap projects-grid">
        <div className="pin">
          <h2 id="projects-title">Own projects</h2>
          <p>Three of my own projects, where the architecture is the point.</p>
        </div>
        <div className="projects-stack">
          {projects.map((project) => (
            <ProjectCard key={project.slug} {...project} />
          ))}
        </div>
      </div>
    </section>
  );
}
