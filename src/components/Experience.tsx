import { career, overlapNote } from '../data/cv';

export function Experience() {
  return (
    <section className="section wrap" id="experience" aria-labelledby="experience-title">
      <div className="section-heading">
        <h2 id="experience-title">Experience</h2>
        <p>{overlapNote}</p>
      </div>
      <div className="career-surface glass-panel">
        {career.map((role, i) => (
          <details key={`${role.employer}-${role.dates}`} className="career-row" open={i === 0}>
            <summary>
              <span className="career-employer">{role.employer}</span>
              <span className="career-position">{role.title}</span>
              <span className="career-date">{role.dates}</span>
              <span className="toggle" aria-hidden="true" />
            </summary>
            <div className="career-description">
              {role.paragraphs.map((text) => (
                <p key={text}>{text}</p>
              ))}
              <span>{role.location}</span>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
