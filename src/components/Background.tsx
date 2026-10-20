import { education, languages, summary } from '../data/cv';

export function Background() {
  return (
    <section className="section wrap" id="background" aria-labelledby="background-title">
      <div className="section-heading">
        <h2 id="background-title">A little background</h2>
      </div>
      <div className="background-content">
        <p className="profile">{summary}</p>
        <div className="education">
          <div>
            <h3>Education</h3>
            <p>
              <strong>{education.degree}</strong>
              <br />
              {education.school}
              <br />
              {education.date} · {education.location}
            </p>
          </div>
          <div>
            <h3>Languages</h3>
            <p>
              {languages.map((language, i) => (
                <span key={language}>
                  {i > 0 ? <br /> : null}
                  {language}
                </span>
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
