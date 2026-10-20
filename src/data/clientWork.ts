import type { DiagramData } from '../components/diagram/types';
import { cmsPipeline } from '../components/diagram/cmsPipeline';
import { stripeAccess } from '../components/diagram/stripeAccess';

/** Before/after bars. Values in milliseconds; the axis is linear so the gap reads true. */
export interface TimingData {
  id: string;
  label: string;
  description: string;
  axisMax: number;
  ticks: Array<{ value: number; text: string }>;
  rows: Array<{ name: string; value: number; text: string; tone?: 'muted' | 'accent' }>;
}

export type ClientVisual = { kind: 'diagram'; data: DiagramData; caption: string } | { kind: 'timing'; data: TimingData; caption: string };

export interface ClientProject {
  id: string;
  company: string;
  /** Display title, one entry per line. */
  title: string[];
  role: string;
  period: string;
  category: string;
  summary: string;
  contribution: string[];
  result: string;
  stack: string[];
  visual: ClientVisual;
}

// Content from the new design's content.json, checked against the CV. The first entry opens by default.
export const clientWork: ClientProject[] = [
  {
    id: 'limber-health-pdf',
    company: 'Limber Health',
    title: ['Training PDFs.', 'A shorter wait.'],
    role: 'Full Stack Software Engineer',
    period: 'Aug 2022 – Jun 2023',
    category: 'Web & mobile',
    summary: 'Worked on provider web and patient mobile apps for remote therapeutic monitoring and home exercises.',
    contribution: [
      'Worked across the web and mobile apps with React, React Native, Node.js, PostgreSQL, and AWS.',
      'Reworked PDF generation for training specifications.',
    ],
    result: 'Cut PDF generation time from about 6 seconds to 10–\u206020 milliseconds.',
    stack: ['React', 'React Native', 'Node.js', 'PostgreSQL', 'AWS'],
    visual: {
      kind: 'timing',
      caption: 'PDF generation for one training specification, on a linear scale.',
      data: {
        id: 'pdf-timing',
        label: 'PDF generation time, before and after the rework',
        description: 'Before the rework, generating a training specification PDF took about 6 seconds. After it, 10 to 20 milliseconds.',
        axisMax: 6000,
        ticks: [
          { value: 0, text: '0 s' },
          { value: 2000, text: '2 s' },
          { value: 4000, text: '4 s' },
          { value: 6000, text: '6 s' },
        ],
        rows: [
          { name: 'Before', value: 6000, text: 'about 6 s' },
          { name: 'After', value: 20, text: '10–\u206020 ms', tone: 'accent' },
        ],
      },
    },
  },
  {
    id: 'intive-cms-mobile',
    company: 'Intive',
    title: ['CMS content,', 'ready for mobile.'],
    role: 'Senior Software Engineer',
    period: 'Started Jul 2025',
    category: 'Backend services',
    summary: 'Owned two microservices: one retrieved CMS data, and the other transformed it for mobile apps.',
    contribution: [
      "Fit comments, reading time, and other metadata to the mobile team's existing schema.",
      "Traced and documented the data flow through the client's CMS modules and internal packages.",
      'Changed the processing pipeline to reduce response payload size.',
    ],
    result: 'Reduced response payload size by 10%.',
    stack: ['Node.js', 'PostgreSQL', 'AWS', 'Docker', 'GitHub Actions'],
    visual: { kind: 'diagram', data: cmsPipeline, caption: 'The two services between the client CMS and the mobile apps.' },
  },
  {
    id: 'sundevs-fitness',
    company: 'SunDevs',
    title: ['A fitness app.', 'Built together.'],
    role: 'Lead Software Engineer',
    period: 'May 2021 – Nov 2022',
    category: 'Team leadership',
    summary: 'Led two frontend developers and one backend developer to launch a fitness app for 1,000 existing gym clients.',
    contribution: [
      'Worked with a PM and product owner while leading the development team.',
      'Worked across the backend, web and mobile apps, and database on AWS, covering workout videos, accounts, roles, and subscriptions.',
      'Integrated Stripe checkout and webhooks so app access followed subscription payment status.',
    ],
    result: 'Launched a fitness app for 1,000 existing gym clients with access tied to subscription payment status.',
    stack: ['Node.js', 'Express.js', 'React', 'React Native', 'PostgreSQL', 'AWS', 'Stripe'],
    visual: { kind: 'diagram', data: stripeAccess, caption: 'How app access followed subscription payment status.' },
  },
];
