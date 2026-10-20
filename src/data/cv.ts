// Source: Sebastian_Suarez_Resume.pdf (Oct 2026). Wording is the CV's own; keep the two in step.
// The phone number is left out on purpose.

export const cvTitle = 'Senior Software Engineer | Backend & Full Stack';

export const summary =
  "I work on backend services and web and mobile apps. Node.js and React are my main tools. Some projects have been about shipping a new product, others about changing a system that was already in use. I've led small teams and still spend my time writing code.";

export const overlapNote = 'Some dates overlap because I also held a side job.';

export interface SkillGroup {
  title: string;
  items: string[];
}

export const skillGroups: SkillGroup[] = [
  {
    title: 'Backend',
    items: ['JavaScript', 'Node.js', 'Express.js', 'NestJS', 'Java', 'Spring', 'REST APIs', 'microservices'],
  },
  {
    title: 'Frontend',
    items: ['React', 'React Native', 'Material UI', 'feature flags', 'permission-based access'],
  },
  { title: 'Data & cloud', items: ['PostgreSQL', 'Amazon Web Services (AWS)', 'Docker'] },
  {
    title: 'Delivery',
    items: ['Git', 'GitHub Actions', 'CI/CD', 'automated testing', 'OpenAPI', 'Postman', 'Linux', 'AI-assisted development'],
  },
];

export interface Role {
  employer: string;
  title: string;
  dates: string;
  location: string;
  paragraphs: string[];
}

export const career: Role[] = [
  {
    employer: 'EPAM',
    title: 'Frontend Software Engineer',
    dates: 'Mar 2026 – Present',
    location: 'Remote',
    paragraphs: [
      "I'm part of the frontend team on a Johnson & Johnson project. The tools let surgeons and physicians study cases they led or were involved in. We're bringing the service to a subplatform called Monarch, which has a different mix of features. Feature flags and permissions control what's available. I use AI to help with the coding.",
    ],
  },
  {
    employer: 'Intive',
    title: 'Senior Software Engineer',
    dates: 'Started Jul 2025',
    location: 'Remote',
    paragraphs: [
      'There were two microservices to look after: one pulled data from the CMS, and one transformed it for the mobile apps. The mobile team already had its schema, so comments, reading time, and other metadata had to fit that shape. I owned both services.',
      'The client had its own CMS modules and internal packages. I went through that code to understand the data flow and document it. Changes to the processing pipeline cut response payload size by 10%. I worked with Node.js, PostgreSQL, AWS, Docker, and GitHub Actions.',
    ],
  },
  {
    employer: 'EPAM',
    title: 'Lead Software Engineer',
    dates: 'Dec 2024 – Apr 2025',
    location: 'Remote',
    paragraphs: ["During this earlier period, I wasn't assigned to a client project."],
  },
  {
    employer: 'Globant',
    title: 'Senior Software Engineer',
    dates: 'Jun 2023 – Dec 2024',
    location: 'Medellín, Colombia',
    paragraphs: [
      "At Globant I worked on Nike's CMS, mainly localization and translation. The publishing changes cut the time from content creation to live publication by 5%. The UI work was in React, using Material UI and Nike's own component library.",
    ],
  },
  {
    employer: 'Limber Health',
    title: 'Full Stack Software Engineer',
    dates: 'Aug 2022 – Jun 2023',
    location: 'Remote',
    paragraphs: [
      'I worked on the web app for providers and the mobile app for patients. The stack was React, React Native, Node.js, PostgreSQL, and AWS, on a product for remote therapeutic monitoring and home exercises.',
      'I reworked PDF generation for training specifications. Before: about 6 seconds. After: 10–\u206020 milliseconds.',
    ],
  },
  {
    employer: 'SunDevs',
    title: 'Lead Software Engineer',
    dates: 'May 2021 – Nov 2022',
    location: 'Remote',
    paragraphs: [
      'I led two frontend developers and one backend developer, working with a PM and product owner. We launched a fitness app for 1,000 existing gym clients.',
      'My work covered the Node.js and Express.js backend, React and React Native apps, and PostgreSQL on AWS. The app had workout videos, accounts, roles, and subscriptions. I integrated Stripe checkout and webhooks so app access followed subscription payment status.',
    ],
  },
  {
    employer: 'PayPal',
    title: 'Full Stack Software Engineer',
    dates: 'Dec 2021 – Jul 2022',
    location: 'Remote',
    paragraphs: [
      "This was a B2B payments product, and I worked on the onboarding flow: tenants, users, admins, billing, and readiness for payments. I built React screens with PayPal's components and worked with backend and product teams on errors and retries. Releases went through PayPal's internal CI/CD tool.",
    ],
  },
  {
    employer: 'Gorilla Logic',
    title: 'Full Stack Software Engineer',
    dates: 'Dec 2020 – Dec 2021',
    location: 'Medellín, Colombia',
    paragraphs: [
      "Flowhub was replacing its old interface. I worked on the new React UI and the Node.js changes behind the screens. The main work was around registers, cash drawers, and staff permissions, from setup through day-to-day use.",
    ],
  },
  {
    employer: 'Pefpi',
    title: 'Full Stack Software Engineer',
    dates: 'Apr 2020 – Aug 2020',
    location: 'Medellín, Colombia',
    paragraphs: ['I worked across the stack on performance improvements and helped with coding standards and documentation.'],
  },
  {
    employer: 'ActiveONE',
    title: 'Software Engineer',
    dates: 'Oct 2017 – Apr 2019',
    location: 'Medellín, Colombia',
    paragraphs: ['Built web apps with Java and Spring and wrote automated tests. Also mentored junior developers and led Agile project delivery.'],
  },
];

export const education = {
  degree: 'Bachelor of Science in Systems Engineering',
  school: 'Institución Universitaria Salazar y Herrera',
  location: 'Medellín, Colombia',
  date: 'Jan 2020',
};

export const languages = ['Spanish: Native', 'English: Full professional proficiency'];
