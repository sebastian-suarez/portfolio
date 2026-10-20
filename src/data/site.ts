// Open slots from the handoff live here. Replace the placeholders before publishing.
export const site = {
  name: 'Sebastián Suárez',
  fullName: 'Sebastián Suárez Valencia',
  title: 'Sebastián Suárez, backend lead',
  description:
    'Backend lead and architect for product teams. Node.js, TypeScript and AWS backends, with Rust daemons and sim-racing hardware as proof.',
  location: 'Medellín, Colombia',
  email: '[YOUR-EMAIL]',
  linkedin: 'https://www.linkedin.com/',
  github: 'https://github.com/',
} as const;

export const mailto = `mailto:${site.email}`;
