import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Mesh PRD - MVP Spec',
}

export default function PRDPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-2xl mx-auto px-5 py-12">

        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center shadow-sm">
              <svg width="12" height="12" viewBox="0 0 20 20" fill="none">
                <circle cx="6" cy="6" r="3.5" fill="white" />
                <circle cx="14" cy="6" r="3.5" fill="white" fillOpacity="0.55" />
                <circle cx="6" cy="14" r="3.5" fill="white" fillOpacity="0.55" />
                <circle cx="14" cy="14" r="3.5" fill="white" fillOpacity="0.25" />
              </svg>
            </div>
            <span className="text-[14px] font-semibold tracking-tight">mesh</span>
          </Link>
          <span className="text-border">/</span>
          <span className="text-[13px] text-muted-foreground">PRD</span>
        </div>

        {/* Document */}
        <article className="space-y-8">

          <div>
            <p className="text-[11px] font-medium text-primary uppercase tracking-widest mb-2">Product Requirements Document</p>
            <h1 className="text-[28px] font-bold tracking-tight leading-tight mb-3">
              Mesh: AI-Native Group Chat
            </h1>
            <p className="text-[14px] text-muted-foreground leading-relaxed">
              A collaborative messaging platform where AI participates as a full teammate,
              not a bolted-on assistant. The AI listens, contributes when useful, stays silent
              when it has nothing to add, and quietly extracts structure from natural conversation.
            </p>
          </div>

          <hr className="border-border" />

          <Section title="Problem">
            <p>
              Current AI integrations in team chat are either too passive (slash commands, search)
              or too aggressive (auto-replying to everything). Neither feels like collaboration.
              Teams want AI that behaves like a sharp teammate who happens to have perfect memory
              and infinite patience.
            </p>
          </Section>

          <Section title="Core Thesis">
            <p>
              The most important design decision for an AI teammate is not what it says. It is
              when it chooses to say nothing. An AI that talks too much is worse than no AI at all.
            </p>
          </Section>

          <Section title="Target User">
            <p>
              Small product/engineering teams (3-10 people) making fast decisions across
              multiple workstreams. Heavy Slack/Discord users frustrated by context loss and
              decision amnesia.
            </p>
          </Section>

          <hr className="border-border" />

          <Section title="MVP Scope">
            <Subsection title="1. Multi-user group chat">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Real-time messaging with user identity switching (demo mode)</li>
                <li>Message grouping, timestamps, typing indicators</li>
                <li>Markdown rendering in AI messages</li>
              </ul>
            </Subsection>

            <Subsection title='2. "When to speak" logic'>
              <ul className="list-disc pl-5 space-y-1.5">
                <li>AI classifies every message: respond or stay silent</li>
                <li>Criteria: direct question, information gap, actionable request = respond</li>
                <li>Criteria: casual banter, agreement, emotional conversation = stay silent</li>
                <li>Configurable activity level (slider from "only when asked" to "proactive")</li>
                <li>Visual indicator ("Mesh heard that") when AI chooses silence</li>
              </ul>
            </Subsection>

            <Subsection title="3. Live context extraction">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Decisions, tasks, budget items, and links extracted automatically</li>
                <li>Context panel with timestamps and item counts per category</li>
                <li>Task checkboxes (mark as done/open)</li>
                <li>Budget summary with running totals</li>
                <li>Click any item to jump to the source message</li>
                <li>Items can be dismissed individually or cleared entirely</li>
                <li>Context is extracted even when AI stays silent</li>
              </ul>
            </Subsection>

            <Subsection title="4. Guided demo with reveal">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Auto-play a scripted multi-user conversation with natural timing</li>
                <li>Demo shows AI choosing when to speak and when to stay silent</li>
                <li>One "human" participant is secretly the AI the whole time</li>
                <li>Reveal card at the end: "Marcus was the AI the whole time"</li>
                <li>Play/pause/skip controls with progress indicator</li>
              </ul>
            </Subsection>

            <Subsection title="5. Room settings">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>AI personality: Professional / Casual / Minimal</li>
                <li>Activity level: slider controlling response threshold</li>
                <li>Capability toggles: extract decisions, summarize, answer questions, suggest actions</li>
                <li>Custom AI name</li>
              </ul>
            </Subsection>
          </Section>

          <hr className="border-border" />

          <Section title="Technical Architecture">
            <Subsection title="Stack">
              <ul className="list-disc pl-5 space-y-1.5">
                <li>Next.js 16, TypeScript, Tailwind CSS 4, shadcn/ui</li>
                <li>OpenAI GPT-4o (responses) + GPT-4o-mini (classification)</li>
                <li>Vercel AI SDK for structured generation and streaming</li>
                <li>SSE for token-by-token response streaming</li>
                <li>Geist Mono font throughout</li>
              </ul>
            </Subsection>

            <Subsection title="API design">
              <p>Single endpoint, two-phase approach:</p>
              <ol className="list-decimal pl-5 space-y-1.5 mt-2">
                <li>
                  <strong>Decision phase</strong> (GPT-4o-mini, ~200ms): returns shouldRespond boolean
                  and extracted context items. Fast and cheap.
                </li>
                <li>
                  <strong>Response phase</strong> (GPT-4o, streamed): only runs if shouldRespond is true.
                  Streams via SSE with metadata event first, then text chunks.
                </li>
              </ol>
            </Subsection>

            <Subsection title="System prompt adapts to settings">
              <p>
                Personality, activity level, and capability toggles are injected into the system
                prompt at request time. Activity level maps to specific behavioral guidance
                (e.g., level 25 = "almost never respond unless directly addressed").
              </p>
            </Subsection>
          </Section>

          <hr className="border-border" />

          <Section title="What is NOT in MVP">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Authentication / user accounts</li>
              <li>Persistence beyond the session</li>
              <li>Real-time multi-user (WebSocket)</li>
              <li>File uploads or image generation</li>
              <li>Thread / reply support</li>
              <li>Multiple rooms</li>
              <li>Mobile native app</li>
            </ul>
          </Section>

          <Section title="Success Metrics">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Demo viewer cannot tell which participant is the AI (reveal lands)</li>
              <li>AI stays silent on at least 30% of messages during natural conversation</li>
              <li>Context panel captures all key decisions and tasks without user prompting</li>
              <li>Response latency under 2 seconds for first token</li>
            </ul>
          </Section>

          <Section title="Open Questions">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Should the AI be able to @mention specific users?</li>
              <li>How do we handle disagreements where the AI has a strong opinion?</li>
              <li>What is the right default activity level for new rooms?</li>
              <li>Should context items be editable by users, not just dismissable?</li>
            </ul>
          </Section>

        </article>

        {/* Footer */}
        <div className="mt-12 pt-6 border-t border-border flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">Mesh PRD v1.0</p>
          <Link
            href="/"
            className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
          >
            Back to demo
          </Link>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-tight mb-3">{title}</h2>
      <div className="text-[13px] text-foreground/85 leading-relaxed space-y-3">
        {children}
      </div>
    </section>
  )
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <h3 className="text-[14px] font-semibold mb-2">{title}</h3>
      <div className="text-[13px] text-foreground/85 leading-relaxed">
        {children}
      </div>
    </div>
  )
}
