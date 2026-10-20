import type { DiagramData } from './types';

/** SunDevs: Stripe checkout and webhooks tie app access to subscription payment status. Facts from the CV only. */
export const stripeAccess: DiagramData = {
  id: 'stripe-access',
  width: 760,
  height: 256,
  label: 'Gym app to Stripe checkout, Stripe webhooks to the backend, and access back to the app',
  description:
    'The gym app sends members to Stripe checkout for their subscription. Stripe webhooks report payment status to the Express.js backend, which runs on PostgreSQL on AWS, and app access follows that status.',
  nodes: [
    { x: 0, y: 48, w: 180, h: 72, lines: [{ text: 'Gym app', bold: true }, 'React, React Native'] },
    { x: 290, y: 48, w: 180, h: 72, lines: [{ text: 'Stripe checkout', bold: true }, 'subscription payment'] },
    { x: 580, y: 48, w: 180, h: 72, lines: [{ text: 'Express.js backend', bold: true }, 'subscription status'], tone: 'accent' },
    { x: 580, y: 188, w: 180, h: 64, lines: [{ text: 'PostgreSQL', bold: true }, 'on AWS'] },
  ],
  edges: [
    { points: [[180, 84], [285, 84]] },
    { points: [[470, 84], [575, 84]] },
    { points: [[670, 120], [670, 183]] },
    { points: [[600, 120], [600, 156], [90, 156], [90, 125]], tone: 'accent' },
  ],
  labels: [
    { x: 190, y: 60, w: 86, align: 'middle', lines: ['checkout'] },
    { x: 480, y: 60, w: 86, align: 'middle', lines: ['webhooks'] },
    { x: 190, y: 166, w: 380, align: 'middle', tone: 'accent', lines: ['access follows payment status'] },
  ],
};
