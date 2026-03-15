export interface DemoStep {
  type: 'user' | 'ai' | 'silent' | 'reveal'
  userId?: string
  content: string
  delay: number // ms before this message appears
  contextItems?: { type: 'decision' | 'task' | 'link' | 'budget'; text: string }[]
}

export const DEMO_SCRIPT: DemoStep[] = [
  // ── Act 1: Trip Planning Kicks Off ──
  {
    type: 'user',
    userId: 'jordan',
    content: "Hey everyone, I'm thinking we should plan that Bali trip for April. Who's in?",
    delay: 0,
  },
  {
    type: 'user',
    userId: 'marcus',
    content: 'Definitely in. Been wanting to go for ages. What dates work?',
    delay: 2200,
  },
  {
    type: 'user',
    userId: 'priya',
    content: "I'm in too! April would be perfect. Let's figure out logistics.",
    delay: 1800,
  },
  {
    type: 'silent', // AI stays silent: casual enthusiasm, nothing to add yet
    content: '',
    delay: 1500,
  },

  // ── Act 2: Marcus drops useful info (this is the AI being helpful) ──
  {
    type: 'user',
    userId: 'marcus',
    content:
      "Quick heads up: April is the tail end of rainy season in Bali. It's workable but expect some afternoon showers. Early April is wetter, late April is drier. Worth targeting the last two weeks.",
    delay: 2500,
    contextItems: [
      { type: 'decision', text: 'Bali trip planned for April, targeting late April for better weather.' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "Good call. Budget-wise I'd say let's keep it around $2,000 each, flights included.",
    delay: 2800,
    contextItems: [
      { type: 'budget', text: '$2,000 per person budget for Bali trip (flights included).' },
    ],
  },
  {
    type: 'user',
    userId: 'marcus',
    content:
      "$2K each is solid for 10 days. Flights from most US cities run $600-900 round trip, leaving $1,100+ for accommodation, food, and activities. Ubud or Seminyak area?",
    delay: 2200,
  },

  // ── Act 3: Decisions start forming ──
  {
    type: 'user',
    userId: 'priya',
    content: 'Definitely Ubud! I want the rice terraces and the monkey forest. We can do a couple days in Seminyak at the end for the beach.',
    delay: 2400,
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "Yeah Ubud sounds amazing. I'm sold.",
    delay: 1500,
  },
  {
    type: 'silent', // AI stays silent: casual agreement, nothing to add
    content: '',
    delay: 1800,
  },

  // ── Act 4: Research and logistics ──
  {
    type: 'user',
    userId: 'marcus',
    content: 'Found this Airbnb: 3BR villa with a pool in Ubud, $85/night. Looks great.\nhttps://airbnb.com/rooms/bali-ubud-villa',
    delay: 3200,
    contextItems: [
      { type: 'link', text: 'https://airbnb.com/rooms/bali-ubud-villa' },
    ],
  },
  {
    type: 'user',
    userId: 'marcus',
    content:
      "$85/night split 3 ways is about $28 each. Well within budget.\n\nHere's what we've locked in:\n- Location: Ubud (with Seminyak at the end)\n- Budget: $2K each\n- Accommodation: 3BR villa, $85/night",
    delay: 2500,
    contextItems: [
      { type: 'decision', text: 'Staying in Ubud with a few days in Seminyak at the end.' },
      { type: 'decision', text: '3BR villa in Ubud at $85/night (split 3 ways).' },
    ],
  },

  // ── Act 5: Task assignment ──
  {
    type: 'user',
    userId: 'priya',
    content: "Love it. I'll book the villa if everyone's good with those dates.",
    delay: 2000,
    contextItems: [
      { type: 'task', text: 'Priya: book the Ubud villa once dates are confirmed.' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: 'Do it! Marcus, can you look into flights?',
    delay: 1600,
    contextItems: [
      { type: 'task', text: 'Marcus: research flights to Bali.' },
    ],
  },
  {
    type: 'user',
    userId: 'marcus',
    content: "Already on it. I'll compare a few options and share the best fares by tomorrow.",
    delay: 1800,
  },
  {
    type: 'silent', // everyone's aligned, tasks assigned
    content: '',
    delay: 1500,
  },

  // ── Act 6: Side conversation (AI stays out) ──
  {
    type: 'user',
    userId: 'priya',
    content: 'Btw has anyone been to Bali before? I went to Thailand last year and it was incredible.',
    delay: 2500,
  },
  {
    type: 'user',
    userId: 'jordan',
    content: "Never been! That's why I'm so excited. I've only done Europe trips so far.",
    delay: 2000,
  },
  {
    type: 'silent', // personal chitchat, AI stays out
    content: '',
    delay: 1500,
  },

  // ── Act 7: Marcus adds more value ──
  {
    type: 'user',
    userId: 'marcus',
    content: "One thing to sort out: do we need visas? US passport holders get a visa on arrival for 30 days, costs about $35. Just need to make sure everyone's passport is valid for 6+ months past travel dates.",
    delay: 3000,
    contextItems: [
      { type: 'task', text: 'Everyone: confirm passport is valid 6+ months past April travel dates.' },
      { type: 'budget', text: '$35 per person for visa on arrival.' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: 'Good thinking. Mine expires 2028 so I should be fine.',
    delay: 1800,
  },
  {
    type: 'user',
    userId: 'priya',
    content: 'Same, mine is good through 2027.',
    delay: 1400,
  },
  {
    type: 'silent', // nothing to add
    content: '',
    delay: 1200,
  },

  // ── Act 8: Activities planning ──
  {
    type: 'user',
    userId: 'priya',
    content: 'What about activities? I really want to do a sunrise hike on Mount Batur.',
    delay: 2500,
  },
  {
    type: 'user',
    userId: 'marcus',
    content: "Mount Batur sunrise trek is a must. Typically $40-60 per person with a guide. You start at 2am and reach the summit for sunrise around 6am. It's a moderate hike, about 2 hours up.\n\nAlso worth considering:\n- Tegallalang Rice Terraces (free / small donation)\n- Tirta Empul water temple ($3 entry)\n- Ubud Monkey Forest ($5 entry)\n- Cooking class ($25-35 per person)",
    delay: 3500,
    contextItems: [
      { type: 'task', text: 'Group: book Mount Batur sunrise trek ($40-60/person).' },
      { type: 'budget', text: '$100-150 per person estimated for activities.' },
    ],
  },
  {
    type: 'user',
    userId: 'jordan',
    content: 'The cooking class sounds awesome. And the sunrise hike is non-negotiable. Add both to the list!',
    delay: 2200,
    contextItems: [
      { type: 'decision', text: 'Doing the Mount Batur sunrise trek and a Balinese cooking class.' },
    ],
  },

  // ── The Reveal ──
  {
    type: 'reveal',
    content: '',
    delay: 3000,
  },
]
