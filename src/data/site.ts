export const site = {
  name: 'Sebastian Suarez',
  fullName: 'Sebastian Suarez Valencia',
  /** Headline role on the portfolio. The résumé page uses the CV title instead (cv.ts). */
  role: 'Backend lead and architect',
  title: 'Sebastian Suarez, backend lead',
  description:
    'Backend lead and architect for product teams. Node.js, TypeScript and AWS backends, with Rust daemons and sim-racing hardware as proof.',
  location: 'Medellín, Colombia',
  email: 'contact@sebastiansuarez.dev',
  linkedin: 'https://www.linkedin.com/in/sebastiansuarezvalencia/',
  github: 'https://github.com/sebastian-suarez',
} as const;

export const mailto = `mailto:${site.email}`;
