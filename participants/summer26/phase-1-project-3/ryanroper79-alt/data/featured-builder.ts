/** Featured builder — Ryan R. Roper (client-safe, no Node imports). */

export const featuredBuilder = {
  handle: 'ryanroper79-alt',
  displayName: 'Ryan R. Roper',
  title: 'Founder · CEAL Green Energy Limited',
  location: 'Caribbean',
  photoPath: '/builders/ryan-roper.jpg',
  linkedin: 'https://www.linkedin.com/in/ryanroper1/',
  cealGreenUrl: 'https://www.cealgreen.com',
  headline:
    'Twenty years leading major Caribbean energy and infrastructure projects — now building AI-native delivery platforms in public.',
  bio: `Ryan R. Roper brings more than twenty years of major project development experience across the Caribbean and wider Global South — from energy generation and grid integration to complex capital delivery. He is a Harvard Business School graduate with a focus on data analytics and artificial intelligence, combining engineering discipline with digital transformation strategy.

Ryan founded CEAL Green Energy Limited to close the gap between Caribbean energy transition ambitions and executable delivery — pairing resilient infrastructure know-how with cohort-scale software built in one-week public cycles. Partners engage Ryan and his builder network for digital/AI solutions that make infrastructure decisions evidence-backed, not assertion-driven.`,
  credentials: [
    'Harvard Business School — data analytics & AI',
    '20+ years major project development (Caribbean)',
    'Engineering · digital transformation · energy transition',
  ],
  skills: [
    'Major project development',
    'Data analytics',
    'AI-native platforms',
    'Energy transition',
    'Digital transformation',
    'Infrastructure engineering',
    'Caribbean grid integration',
  ],
  whyPartner: [
    {
      title: 'Engineering + AI, not slides',
      body: 'Ryan ships deployable software in public — inspect /work and live verification before you engage on a pilot.',
    },
    {
      title: 'Caribbean context, global methods',
      body: 'Two decades on regional energy and infrastructure projects; HBS-trained analytics for decision-grade insight.',
    },
    {
      title: 'Cohort-scale delivery',
      body: 'Operates this showcase and the Summer Pilot 2026 stack — one-week sprints with MIT-licensed deploy output.',
    },
    {
      title: 'Commercial depth off-platform',
      body: 'Resilient infrastructure project delivery and advisory work continues at cealgreen.com — one professional handoff.',
    },
  ],
} as const;

export const defaultPartnerBuilder = featuredBuilder.handle;
