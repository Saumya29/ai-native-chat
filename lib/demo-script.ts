export interface DemoStep {
  type: 'user' | 'ai' | 'silent' | 'reveal'
  userId?: string
  content: string
  delay: number // ms before this message appears
  contextItems?: { type: 'decision' | 'task' | 'link' | 'budget'; text: string }[]
}

export const DEMO_SCRIPT: DemoStep[] = [
  // ── Act 1: The Problem ──
  {
    type: 'user',
    userId: 'jordan',
    content:
      "Ok team, we need to lock pricing before the launch on April 14. We've got 3 enterprise pilots converting and 40+ SMBs on the waitlist. Current thinking is $49/seat/month. Thoughts?",
    delay: 0,
    contextItems: [
      { type: 'decision', text: 'Launch date: April 14.' },
      { type: 'budget', text: 'Proposed pricing: $49/seat/month.' },
    ],
  },
  {
    type: 'user',
    userId: 'priya',
    content:
      "From user research, SMBs keep saying $49 feels steep for teams under 10. Most compared us to Notion ($8/seat) and Linear ($10/seat), even though we're a different category. Perception matters.",
    delay: 2800,
  },
  {
    type: 'user',
    userId: 'jordan',
    content:
      "But our enterprise pilots are paying $120/seat and haven't blinked. The value prop is completely different at that scale. I don't want to leave money on the table.",
    delay: 2400,
  },
  {
    type: 'silent', // Casual back-and-forth, no clear question yet
    content: '',
    delay: 1500,
  },

  // ── Act 2: Marcus runs the numbers (this is the AI doing real work) ──
  {
    type: 'user',
    userId: 'marcus',
    content:
      "Let me run the math on both segments.\n\nEnterprise (3 pilots): avg 85 seats, $120/seat = $10,200/mo each = $30,600 MRR\nSMB waitlist (40 companies): avg 6 seats at $49/seat = $294/mo each = $11,760 MRR\n\nSo enterprise is already 72% of projected MRR from 7% of accounts. That's a massive concentration risk if even one churns.",
    delay: 3500,
    contextItems: [
      { type: 'budget', text: 'Enterprise: $30,600 MRR from 3 accounts (72% of total).' },
      { type: 'budget', text: 'SMB: $11,760 MRR from 40 accounts (28% of total).' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "That concentration risk point is real. Hadn't framed it that way.",
    delay: 2000,
  },
  {
    type: 'silent', // Agreement, nothing to add
    content: '',
    delay: 1200,
  },

  // ── Act 3: Marcus catches a fatal flaw ──
  {
    type: 'user',
    userId: 'priya',
    content:
      "What if we just do a flat $29/seat for everyone? Lower the barrier, get volume, figure out enterprise pricing later.",
    delay: 2500,
  },
  {
    type: 'user',
    userId: 'marcus',
    content:
      "That breaks the enterprise deals. Our 3 pilots signed LOIs at $120/seat. If we launch at $29 publicly, they'll renegotiate or feel burned. We'd lose ~$23,000/mo in MRR, and probably the trust.\n\nAlso, at $29/seat with 6-seat avg, SMB LTV is roughly $1,044 assuming 6-month retention. Our CAC from the beta was ~$800. That's a 1.3x LTV:CAC ratio. Not viable for fundraising, needs to be 3x+.",
    delay: 4000,
    contextItems: [
      { type: 'decision', text: 'Flat $29/seat rejected: breaks enterprise LOIs and LTV:CAC is only 1.3x.' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "Yikes, 1.3x. That would kill the Series A story. Ok flat pricing is out.",
    delay: 2200,
  },

  // ── Act 4: Side conversation (AI stays out) ──
  {
    type: 'user',
    userId: 'priya',
    content: "This is why pricing is the worst part of product work. Everything is a tradeoff.",
    delay: 2000,
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "Haha seriously. Remember when we spent 3 weeks on the color of the CTA button?",
    delay: 1800,
  },
  {
    type: 'silent', // Banter, nothing to add
    content: '',
    delay: 1500,
  },

  // ── Act 5: Marcus proposes the non-obvious solution ──
  {
    type: 'user',
    userId: 'marcus',
    content:
      "Here's an approach that solves both problems.\n\nTwo tiers, usage-gated:\n- **Starter**: $19/seat/month, up to 10 seats, core features\n- **Team**: $79/seat/month, unlimited seats, advanced features + priority support\n\nEnterprise stays custom ($100-150/seat) with annual contracts, not shown on the pricing page.\n\nThe math works out:\n- 40 SMBs at $19 x 6 seats = $4,560/mo (lower but high-volume, 3.6x LTV:CAC at 6mo retention)\n- Enterprise stays at $120/seat = $30,600/mo (untouched)\n- Total: $35,160 MRR, healthier mix, and a clear upgrade path from Starter to Team",
    delay: 5000,
    contextItems: [
      { type: 'decision', text: 'Two-tier pricing: Starter ($19/seat, up to 10) + Team ($79/seat, unlimited).' },
      { type: 'decision', text: 'Enterprise stays custom ($100-150/seat), annual contracts, off pricing page.' },
      { type: 'budget', text: 'Projected MRR with new tiers: $35,160 (vs $42,360 at old pricing).' },
    ],
  },
  {
    type: 'user',
    userId: 'priya',
    content:
      "The 10-seat cap on Starter is smart. Forces growing teams to upgrade naturally instead of hitting them with a price shock. And $19 kills the Notion/Linear comparison.",
    delay: 2800,
  },
  {
    type: 'user',
    userId: 'jordan',
    content:
      "The $7K MRR drop from the original plan hurts, but the LTV:CAC fix and the de-risking from enterprise concentration is worth it. I'm in.",
    delay: 2600,
  },

  // ── Act 6: Action items ──
  {
    type: 'user',
    userId: 'marcus',
    content:
      "Two things to be careful about:\n1. The enterprise LOIs reference \"per-seat pricing.\" We should amend them to say \"custom enterprise pricing\" before we publish the public page, so there's no confusion.\n2. We need a feature gate between Starter and Team that feels valuable, not arbitrary. I'd suggest: Starter gets core chat + context panel, Team adds API access, SSO, and audit logs.",
    delay: 3500,
    contextItems: [
      { type: 'task', text: 'Jordan: amend enterprise LOIs to reference custom pricing before public launch.' },
      { type: 'task', text: 'Priya: design the pricing page with Starter/Team tiers and feature comparison.' },
      { type: 'decision', text: 'Feature gate: Team tier adds API access, SSO, and audit logs.' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "Great catches. I'll get legal on the LOI amendments today. Priya, can you have pricing page mocks by Wednesday?",
    delay: 2200,
  },
  {
    type: 'user',
    userId: 'priya',
    content: "On it. I'll share Figma link by end of day Wednesday.",
    delay: 1600,
    contextItems: [
      { type: 'task', text: 'Priya: share pricing page Figma mocks by Wednesday EOD.' },
    ],
  },
  {
    type: 'user',
    userId: 'marcus',
    content: "One more: we should A/B test showing annual pricing (15% discount) as default vs monthly. Most B2B SaaS sees 20-30% higher conversion when annual is the default anchor.",
    delay: 2800,
    contextItems: [
      { type: 'task', text: 'Marcus: set up A/B test for annual vs monthly pricing default.' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "Love it. Alright, I think we're aligned. Best pricing discussion we've had.",
    delay: 2000,
  },
  {
    type: 'silent', // Wrap-up, nothing to add
    content: '',
    delay: 1500,
  },

  // ── The Reveal ──
  {
    type: 'reveal',
    content: '',
    delay: 3000,
  },
]
