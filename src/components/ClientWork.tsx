import { Fragment } from 'react';
import { Diagram } from './diagram/Diagram';
import { TimingChart } from './diagram/TimingChart';
import { clientWork, type ClientProject } from '../data/clientWork';

/** Same floor as the project cards so the diagram text stays legible on phones. */
const PANEL_DIAGRAM_MIN_SCALE = 0.6;

function Visual({ project }: { project: ClientProject }) {
  const { visual } = project;
  return (
    <figure className="project-figure">
      {visual.kind === 'timing' ? (
        <TimingChart data={visual.data} minScale={PANEL_DIAGRAM_MIN_SCALE} />
      ) : (
        <Diagram data={visual.data} minScale={PANEL_DIAGRAM_MIN_SCALE} />
      )}
      <figcaption>{visual.caption}</figcaption>
    </figure>
  );
}

/**
 * The new design's side-index folio. Without JS every panel shows, stacked;
 * project-tabs.ts turns the list into tabs and hides all but one panel.
 */
export function ClientWork() {
  return (
    <section className="client-work wrap" id="work" aria-labelledby="work-title">
      <div className="work-heading">
        <div>
          <h2 id="work-title">Client work</h2>
          <p>Backend, web, and mobile.</p>
        </div>
        <span className="place">Medellín, Colombia</span>
      </div>
      <div className="folio-layout">
        <div className="project-selector" role="group" aria-label="Choose a project">
          {clientWork.map((project, i) => (
            <button
              key={project.id}
              type="button"
              className="project-tab"
              aria-pressed={i === 0}
              aria-controls={`project-${project.id}`}
            >
              <span className={`tab-orb orb-${i}`} aria-hidden="true" />
              <span>{project.company}</span>
              <span className="tab-mark" aria-hidden="true">
                ↗
              </span>
            </button>
          ))}
        </div>
        <div className="project-stage glass-panel">
          {clientWork.map((project, i) => (
            <article
              key={project.id}
              className="project-panel"
              id={`project-${project.id}`}
              data-index={i}
              aria-labelledby={`heading-${project.id}`}
            >
              <div className="project-identity">
                <div className="project-company">
                  <span className={`company-orb orb-${i}`} aria-hidden="true" />
                  {project.company}
                </div>
                <h3 id={`heading-${project.id}`}>
                  {project.title.map((line, j) => (
                    <Fragment key={j}>
                      {j > 0 ? (
                        <>
                          {' '}
                          <br />
                        </>
                      ) : null}
                      {line}
                    </Fragment>
                  ))}
                </h3>
                <p className="project-role">{project.role}</p>
                <p className="project-period">{project.period}</p>
                <span className="project-category">{project.category}</span>
              </div>
              <div className="project-story">
                <p className="project-summary">{project.summary}</p>
                <h4>My contribution</h4>
                <ul>
                  {project.contribution.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <div className="project-outcome">
                  <span>Outcome</span>
                  <p>{project.result}</p>
                </div>
                <p className="project-stack">{project.stack.join(' / ')}</p>
              </div>
              <Visual project={project} />
            </article>
          ))}
        </div>
      </div>
      <div className="work-footer">
        <span>Pick a contribution to see the work behind it.</span>
        <a href="#projects">
          Continue to my own projects <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
