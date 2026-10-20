import type { DiagramData } from './types';

/** /how-it-works/: the Cloudflare zone and where each kind of record points. Live state, 20 Oct 2026. */
export const cloudflareZone: DiagramData = {
  id: 'cloudflare-zone',
  width: 760,
  height: 280,
  label: 'Cloudflare zone: proxied web records to CloudFront, DNS-only records for the certificate and for mail',
  description:
    'The domain is registered with Cloudflare Registrar and served from a Cloudflare zone signed with DNSSEC. The apex and www records are proxied to CloudFront over Full (strict) TLS. The certificate validation records stay DNS-only so ACM can issue and renew the certificate, and the mail records stay DNS-only for iCloud+ mail, with SPF, DKIM and DMARC.',
  nodes: [
    {
      x: 0,
      y: 40,
      w: 180,
      h: 220,
      lines: [{ text: 'Cloudflare zone', bold: true }, 'Registrar', 'DNSSEC', 'Free plan'],
    },
    { x: 290, y: 40, w: 180, h: 64, lines: [{ text: 'Apex and www', bold: true }, 'proxied'], tone: 'accent' },
    { x: 290, y: 118, w: 180, h: 64, lines: [{ text: 'Validation', bold: true }, 'DNS-only'] },
    { x: 290, y: 196, w: 180, h: 64, lines: [{ text: 'Mail records', bold: true }, 'DNS-only'] },
    { x: 580, y: 40, w: 180, h: 64, lines: [{ text: 'CloudFront', bold: true }, 'Full (strict) TLS'] },
    { x: 580, y: 118, w: 180, h: 64, lines: [{ text: 'ACM', bold: true }, 'issues, renews'] },
    { x: 580, y: 196, w: 180, h: 64, lines: [{ text: 'iCloud+ mail', bold: true }, 'SPF, DKIM, DMARC'] },
  ],
  edges: [
    { points: [[180, 72], [285, 72]], tone: 'accent' },
    { points: [[180, 150], [285, 150]] },
    { points: [[180, 228], [285, 228]] },
    { points: [[470, 72], [575, 72]], tone: 'accent' },
    { points: [[470, 150], [575, 150]] },
    { points: [[470, 228], [575, 228]] },
  ],
  labels: [
    { x: 180, y: 46, w: 110, align: 'middle', tone: 'accent', lines: ['web'] },
    { x: 180, y: 124, w: 110, align: 'middle', lines: ['certificate'] },
    { x: 180, y: 202, w: 110, align: 'middle', lines: ['mail'] },
    { x: 470, y: 46, w: 110, align: 'middle', tone: 'accent', lines: ['origin'] },
    { x: 470, y: 124, w: 110, align: 'middle', lines: ['CNAME check'] },
    { x: 470, y: 202, w: 110, align: 'middle', lines: ['MX'] },
  ],
};
