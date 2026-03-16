export interface DemoStep {
  type: 'user' | 'ai' | 'agent' | 'silent' | 'reveal'
  userId?: string
  agentFor?: string // userId of the human this agent represents
  content: string
  delay: number // ms before this message appears
  contextItems?: { type: 'decision' | 'task' | 'link' | 'budget'; text: string }[]
}

export const DEMO_SCRIPT: DemoStep[] = [
  // ── Act 1: The Core Design Question ──
  {
    type: 'user',
    userId: 'herman',
    content:
      "Big design question for the team: when should the AI participant actually speak in a conversation? We need to nail this before the beta. Right now it just responds whenever someone @-mentions it, but that feels too passive. And I'll tell you from experience at Improbable: we built AI systems nobody used, not because they were bad, but because they interrupted at the wrong moments. The timing problem is harder than the intelligence problem.",
    delay: 0,
    contextItems: [
      { type: 'decision', text: 'Core design question: when should the AI speak vs stay silent?' },
    ],
  },
  {
    type: 'user',
    userId: 'priya',
    content:
      "That matches what I'm hearing in user interviews. The #1 fear is \"Clippy in my group chat.\" People want the AI to be useful but they're terrified of it jumping in when they're just vibing with their team.",
    delay: 2800,
    contextItems: [
      { type: 'decision', text: 'User research: #1 fear is unsolicited AI interruptions ("Clippy in my group chat").' },
    ],
  },
  {
    type: 'silent', // Discussion is setting context, no clear question yet
    content: '',
    delay: 1500,
  },

  // ── Act 2: Luca pulls the data ──
  {
    type: 'user',
    userId: 'luca',
    content:
      "I pulled data from our beta. Across **500 conversations**, the AI spoke unprompted 1,200 times.\n\n- Users rated 28% of unprompted messages as helpful\n- 72% were rated \"unnecessary\" or \"annoying\"\n- Net effect: AI is **3x more annoying than helpful** when it speaks without being asked\n\nThe problem isn't the quality of what it says. It's that it can't tell when speaking adds value vs when it's noise.",
    delay: 3500,
    contextItems: [
      { type: 'budget', text: 'Beta data: 500 conversations, 1,200 unprompted AI messages.' },
      { type: 'decision', text: 'AI is 3x more annoying than helpful when unprompted (28% helpful vs 72% unnecessary).' },
    ],
  },
  {
    type: 'user',
    userId: 'saumya',
    content:
      "That 28/72 split is interesting though. It's not zero — there ARE moments where proactive AI is valuable. We just need to classify which moments those are. This is a classification problem, not a binary on/off.",
    delay: 2600,
    contextItems: [
      { type: 'decision', text: 'Frame as classification problem: identify when proactive AI adds value.' },
    ],
  },
  {
    type: 'user',
    userId: 'herman',
    content: "Great framing. So how do we solve the classification problem?",
    delay: 2000,
  },
  {
    type: 'silent', // Agreement, nothing to add
    content: '',
    delay: 1200,
  },

  // ── Act 3: Priya proposes, Luca catches the flaw ──
  {
    type: 'user',
    userId: 'priya',
    content:
      "What about frequency-capping? Limit the AI to speaking at most once every 10 messages. That way it can't dominate the conversation even if it wants to.",
    delay: 2500,
  },
  {
    type: 'user',
    userId: 'luca',
    content:
      "Frequency-capping has a fatal flaw: it suppresses good and bad messages equally.\n\nIf the AI has one good insight and nine bad ones, a 1-in-10 cap doesn't fix the ratio — you still get the same 28% hit rate. You've just made the AI quieter, not smarter.\n\nWorse: if there's a moment where the AI genuinely has something critical to say but it already \"spent\" its message on something trivial 5 messages ago, the cap actively blocks value.",
    delay: 4000,
    contextItems: [
      { type: 'decision', text: 'Frequency-capping rejected: suppresses good and bad equally, same terrible ratio.' },
    ],
  },
  {
    type: 'user',
    userId: 'herman',
    content: "That's a really good catch. Rate limiting the symptom instead of fixing the root cause. Ok so what's the real fix?",
    delay: 2200,
  },

  // ── Act 4: Quick banter (AI stays silent) ──
  {
    type: 'user',
    userId: 'saumya',
    content: "If we solve this, can we put it on our LinkedIn? \"Fixed the most annoying problem in AI.\" 😂",
    delay: 2000,
  },
  {
    type: 'user',
    userId: 'herman',
    content: "Ha! Right up there with \"made meetings not suck.\"",
    delay: 1800,
  },
  {
    type: 'silent', // Banter, nothing to add
    content: '',
    delay: 1500,
  },

  // ── Act 5: Luca proposes three-mode architecture ──
  {
    type: 'user',
    userId: 'luca',
    content:
      "Here's the architecture I'd propose. Three modes:\n\n**Mode 1 — Silent Extraction.** AI reads every message but never speaks. It extracts decisions, tasks, and context into the side panel. This is the default.\n\n**Mode 2 — Prompted Response.** Someone @-mentions the AI or asks it a direct question. It responds in the chat. This is what we have today.\n\n**Mode 3 — Proactive Insight.** The AI identifies a moment where it has high-confidence, high-value input. But it only speaks if it passes a **confidence gate**: the model must score above 0.85 that the insight is genuinely useful AND that the conversational context is appropriate (not banter, not emotional, not a private exchange).\n\nThe key insight: Mode 3 is what separates us. Anyone can build Mode 1 and 2. The confidence gating is the hard part and the moat.",
    delay: 5500,
    contextItems: [
      { type: 'decision', text: 'Three-mode architecture: Silent Extraction (default) → Prompted Response → Proactive Insight (confidence-gated).' },
      { type: 'decision', text: 'Mode 3 confidence gate: >0.85 confidence that insight is useful AND context is appropriate.' },
    ],
  },
  {
    type: 'user',
    userId: 'herman',
    content:
      "This is right. AI that knows when to shut up is more valuable than AI that knows everything. The confidence gate is exactly what we were missing at Improbable.",
    delay: 2800,
  },
  {
    type: 'user',
    userId: 'saumya',
    content:
      "The confidence model is doable. I'd need about 2 weeks to build a classifier trained on our beta data — we've got 1,200 labeled examples of good vs bad interventions. That's actually a solid training set.",
    delay: 2600,
    contextItems: [
      { type: 'task', text: 'Saumya: build confidence classifier for Mode 3 (~2 weeks, 1,200 labeled examples).' },
    ],
  },
  {
    type: 'user',
    userId: 'priya',
    content:
      "Love this. From a UX perspective, I want to add a visible mode indicator so users always know what state the AI is in. Something subtle in the header — maybe a small icon that shows whether it's in silent, listening, or proactive mode.",
    delay: 2600,
    contextItems: [
      { type: 'task', text: 'Priya: design mode indicator UX for the three AI states.' },
    ],
  },

  // ── Act 6: Action items ──
  {
    type: 'user',
    userId: 'herman',
    content:
      "This is coming together. Next steps:\n- Luca: write the technical spec for the three-mode system, especially the confidence gating logic\n- Saumya: start on the classifier, use the beta data as training set\n- Priya: design the mode indicator and the UX for proactive messages — make it feel non-intrusive\n- I'll review the spec against what went wrong at Improbable and draft the product positioning around \"AI that earns its presence\"",
    delay: 3500,
    contextItems: [
      { type: 'task', text: 'Luca: write technical spec for three-mode architecture and confidence gating.' },
      { type: 'task', text: 'Herman: review spec against Improbable lessons + draft product positioning.' },
    ],
  },
  {
    type: 'user',
    userId: 'luca',
    content:
      "One more thought: we should dogfood this. This conversation we just had is exactly the kind of moment where Mode 3 should have triggered. I had data that was directly relevant, the team was stuck on a design question, and the context was right. If we build this well, the AI would have jumped in right where I did.",
    delay: 3200,
    contextItems: [
      { type: 'decision', text: 'Dogfood the three-mode system in Mesh itself — use real conversations as test cases.' },
    ],
  },
  {
    type: 'user',
    userId: 'herman',
    content:
      "Great call. And make sure the confidence gate calibrates per-room. A product strategy room should have a higher bar than a data analysis room. That per-room calibration is another defensible layer. Alright, best design discussion we've had. Let's get the architecture review on the calendar for Thursday.",
    delay: 2800,
    contextItems: [
      { type: 'decision', text: 'Per-room calibration for confidence gate — different rooms get different thresholds.' },
    ],
  },

  // ── Act 7: Agent-to-Agent Scheduling ──
  {
    type: 'agent',
    agentFor: 'herman',
    content: "Checking Herman's calendar... Thursday 2-4pm is open.",
    delay: 2000,
  },
  {
    type: 'agent',
    agentFor: 'priya',
    content: "Priya has a design review at 2pm. 3:30-4:30pm works.",
    delay: 2200,
  },
  {
    type: 'agent',
    agentFor: 'saumya',
    content: "Saumya is free Thursday afternoon. 3:30pm works.",
    delay: 1800,
  },
  {
    type: 'agent',
    agentFor: 'herman',
    content: "Locked in. Architecture review Thursday 3:30pm. Calendar invites sent to everyone.",
    delay: 2000,
    contextItems: [
      { type: 'task', text: 'Architecture review: Thursday 3:30-4:30pm.' },
    ],
  },

  // ── The Reveal ──
  {
    type: 'reveal',
    content: '',
    delay: 3000,
  },
]
