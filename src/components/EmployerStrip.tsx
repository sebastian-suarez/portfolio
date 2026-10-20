import { employers } from '../data/employers';

export function EmployerStrip() {
  return (
    <section aria-label="Employers" className="employer-strip wrap">
      <span className="employer-lead">Shipped for</span>
      <ul className="employer-list">
        {employers.map((name) => (
          <li key={name} className="plate">
            {name}
          </li>
        ))}
      </ul>
    </section>
  );
}
