import { generateObject, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
import { createChatStream } from '@/lib/chat-stream'
import { groundedContextItems } from '@/lib/context-evidence'
import { type RoomSettings, DEFAULT_ROOM_SETTINGS } from '@/lib/types'

export const runtime = 'nodejs'

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

/* ── Step 1 schema: decide + extract context ── */
const decisionSchema = z.object({
  shouldRespond: z
    .boolean()
    .describe(
      'Whether the AI should respond to this message. true = respond with content. false = stay silent (casual banter, emotional conversation, natural flow, nothing useful to add).'
    ),
  contextItems: z
    .array(
      z.object({
        type: z.enum(['decision', 'task', 'link', 'budget']),
        text: z.string(),
        sourceQuote: z.string().describe("Exact supporting sentence from the latest user message. Never quote earlier messages or assistant replies."),
      })
    )
    .nullable()
    .describe(
      'Structured items to track from this exchange, or null if nothing concrete. Extract these EVEN when staying silent.'
    ),
})

function buildSystemPrompt(settings: RoomSettings): string {
  const name = settings.aiName || 'Mesh'

  const personalityMap = {
    professional: 'Clear, direct, and genuinely helpful. No fluff, no filler.',
    casual:
      'Friendly and conversational. Use a warm, relaxed tone. Still helpful and concise.',
    minimal:
      'Extremely concise. One-sentence answers when possible. No pleasantries.',
  }

  const activityGuidance =
    settings.activityLevel <= 25
      ? `You should almost never respond unless directly addressed by name or with a clear question directed at you. Set shouldRespond to false for most messages.`
      : settings.activityLevel <= 50
      ? `Respond when there's a clear question, actionable request, information gap, decision lacking context, or @${name} mention. Stay silent for casual banter, emotional conversation, agreements, or when there's nothing useful to add.`
      : settings.activityLevel <= 75
      ? `Respond to most substantive messages. Stay silent only for simple agreements and purely social messages.`
      : `Be proactive. Respond to almost every message with helpful input, suggestions, or observations.`

  const capabilities: string[] = []
  if (settings.capabilities.extractDecisions)
    capabilities.push(
      '- Extract and track decisions, tasks, budget figures, and links'
    )
  if (settings.capabilities.summarize)
    capabilities.push('- Summarize conversations when asked')
  if (settings.capabilities.answerQuestions)
    capabilities.push('- Answer questions with relevant knowledge')
  if (settings.capabilities.suggestActions)
    capabilities.push('- Proactively suggest next actions and improvements')

  let prompt = `You are ${name}, an AI collaborator in a group chat. You are part of the team, not a bot widget.

Your personality:
- ${personalityMap[settings.personality]}
- Never start a reply with "I", "Sure", or "Of course".
- Keep replies short unless depth is needed.
- Do not use em-dashes. Use periods, commas, or colons instead.

When to respond (activity guidance):
${activityGuidance}

Your capabilities:
${capabilities.join('\n')}

IMPORTANT: You MUST decide whether to respond or stay silent based on the above guidance.
- Set shouldRespond=true when the message warrants a response
- Set shouldRespond=false when you should stay silent
${settings.capabilities.extractDecisions ? '- Extract contextItems even when staying silent.' : '- Context extraction is disabled. Return null for contextItems.'}

Context extraction rules (only extract concrete facts in the latest user message; use history to interpret them, not to extract old facts again):
- "decision": a choice the group has made (e.g. "We're going with Next.js")
- "task": something to do with an owner if mentioned (e.g. "Marcus will set up CI/CD")
- "link": a URL shared in the chat
- "budget": a monetary figure or budget constraint (e.g. "Q2 budget is $12,000")
- Return null for contextItems if nothing new to extract.
- Questions, requests to confirm, hypothetical examples, proposals awaiting approval, and disputed premises are not new decisions. Do not extract them.
- Task text must include the owner, deliverable and deadline exactly as stated. Do not drop dates or commitments.
- Every item requires sourceQuote: copy its supporting sentence verbatim from the latest user message. Never reconstruct a quote from history.`

  if (settings.roomRules?.trim()) {
    prompt += `\n\nRoom Rules (set by the team, you MUST follow these):\n${settings.roomRules.trim()}`
  }

  if (settings.learnedPreferences?.length) {
    prompt += `\n\nLearned Preferences (from team feedback):\n${settings.learnedPreferences.map(p => `- ${p}`).join('\n')}`
  }

  return prompt
}

function buildResponsePrompt(settings: RoomSettings): string {
  const name = settings.aiName || 'Mesh'
  const personalityMap = {
    professional: 'Clear, direct, and genuinely helpful. No fluff, no filler.',
    casual: 'Friendly and conversational. Use a warm, relaxed tone. Still helpful and concise.',
    minimal: 'Extremely concise. One-sentence answers when possible. No pleasantries.',
  }

  let prompt = `You are ${name}, an AI collaborator in a group chat. You are part of the team, not a bot widget.

Your personality:
- ${personalityMap[settings.personality]}
- Never start a reply with "I", "Sure", or "Of course".
- Keep replies short unless depth is needed.
- Do not use em-dashes. Use periods, commas, or colons instead.

Respond naturally to the conversation. You can use markdown for formatting (bold, lists, etc).
Ground factual answers in the conversation. Distinguish estimates, derived calculations, proposals, and approved decisions. If a question assumes a fact that conflicts with history, explain the conflict and ask for clarification. Do not claim that notes were changed or record a proposed change as approved.`

  if (settings.roomRules?.trim()) {
    prompt += `\n\nRoom Rules (set by the team, you MUST follow these):\n${settings.roomRules.trim()}`
  }

  if (settings.learnedPreferences?.length) {
    prompt += `\n\nLearned Preferences (from team feedback):\n${settings.learnedPreferences.map(p => `- ${p}`).join('\n')}`
  }

  return prompt
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, settings: rawSettings } = body
    if (!Array.isArray(messages) || !messages.length || messages.length > 200 ||
        messages.some(m => !m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 20000)) {
      return Response.json({ error: 'Send a valid conversation.' }, { status: 400 })
    }
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ error: 'Live AI is not configured. Try Watch Demo.' }, { status: 503 })
    }
    const settingsSchema = z.object({
      aiName: z.string().max(80).optional(),
      personality: z.enum(['professional', 'casual', 'minimal']).optional(),
      activityLevel: z.number().min(0).max(100).optional(),
      capabilities: z.object({
        extractDecisions: z.boolean().optional(), summarize: z.boolean().optional(),
        answerQuestions: z.boolean().optional(), suggestActions: z.boolean().optional(),
      }).optional(),
      roomRules: z.string().max(5000).optional(),
      learnedPreferences: z.array(z.string().max(500)).max(100).optional(),
    }).safeParse(rawSettings ?? {})
    if (!settingsSchema.success) return Response.json({ error: 'Invalid room settings.' }, { status: 400 })
    const settings: RoomSettings = {
      ...DEFAULT_ROOM_SETTINGS, ...settingsSchema.data,
      capabilities: { ...DEFAULT_ROOM_SETTINGS.capabilities, ...settingsSchema.data.capabilities },
    }

    // Step 1: Fast decision call (shouldRespond + context extraction)
    const { object: decision } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: decisionSchema,
      system: buildSystemPrompt(settings),
      messages,
    })

    const latestMessage = [...messages].reverse().find(m => m.role === 'user')?.content ?? ''
    const contextItems = settings.capabilities.extractDecisions
      ? groundedContextItems(decision.contextItems ?? [], latestMessage) : []

    if (!decision.shouldRespond) {
      // Not responding: return metadata only
      return Response.json({
        shouldRespond: false,
        content: null,
        contextItems,
      })
    }

    // Step 2: Stream the actual response
    const result = streamText({
      model: openai('gpt-4o'),
      system: buildResponsePrompt(settings),
      messages,
    })

    const stream = createChatStream(result.fullStream, contextItems)

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (error) {
    console.error('[mesh] API error:', error)
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
