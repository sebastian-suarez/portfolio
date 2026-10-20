import { employers } from '../data/employers';

export function EmployerStrip() {
  return (
    <section aria-label="Employers" className="border-y border-line py-9">
      <div className="wrap flex flex-wrap items-center gap-7">
        <span className="text-[15px] whitespace-nowrap text-muted">Shipped for</span>
        <ul className="m-0 flex list-none flex-wrap gap-[10px] p-0">
          {employers.map((name) => (
            <li
              key={name}
              className="plate font-display inline-flex h-10 items-center rounded-lg border border-line-3 px-4 text-[17px] font-semibold tracking-[0.04em] uppercase text-muted"
            >
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
