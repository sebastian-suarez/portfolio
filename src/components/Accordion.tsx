import { capabilities } from "../data/capabilities";

export function Accordion() {
  return (
    <section className="pb-40" aria-labelledby="capabilities-heading">
      <div className="wrap flex flex-col gap-10">
        <h2
          id="capabilities-heading"
          className="font-display m-0 text-[clamp(2.25rem,3.6vw,3.25rem)] leading-[1.02] font-semibold tracking-[-0.015em] text-ink"
        >
          What I bring to a team
        </h2>
        <div className="acc flex min-h-[440px] gap-2">
          {capabilities.map((pane) => {
            const detailId = `pane-${pane.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
            return (
              <div
                key={pane.title}
                className={`pane pane-${pane.tone} flex flex-col justify-between gap-6 rounded-2xl p-7`}
              >
                <button
                  className="pane-btn"
                  type="button"
                  aria-expanded="false"
                  aria-controls={detailId}
                >
                  <span className="pane-title font-display block text-[30px] leading-[1.05] font-semibold">
                    {pane.title}
                  </span>
                </button>
                <div id={detailId} className="flex flex-col gap-4">
                  <p className="pane-text m-0 text-[16px]">{pane.blurb}</p>
                  <ul className="more m-0 flex list-none flex-wrap gap-[6px] p-0">
                    {pane.chips.map((chip) => (
                      <li key={chip} className="chip chip-sm">
                        {chip}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
