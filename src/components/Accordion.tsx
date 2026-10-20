import { capabilities } from '../data/capabilities';

export function Accordion() {
  return (
    <section className="section wrap" aria-labelledby="capabilities-heading">
      <div className="section-heading">
        <h2 id="capabilities-heading">What I bring to a team</h2>
        <p>Open a pane for the stack.</p>
      </div>
      <div className="acc">
        {capabilities.map((pane) => {
          const detailId = `pane-${pane.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
          return (
            <div key={pane.title} className={`pane pane-${pane.tone}`}>
              <button className="pane-btn" type="button" aria-expanded="false" aria-controls={detailId}>
                <span className="pane-title">{pane.title}</span>
              </button>
              <div id={detailId} className="pane-body">
                <p className="pane-text">{pane.blurb}</p>
                <div className="more">
                  <ul className="chips">
                    {pane.chips.map((chip) => (
                      <li key={chip} className="chip chip-sm">
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
