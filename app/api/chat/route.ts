import { generateObject, streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'
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
- ALWAYS extract contextItems regardless of whether you respond. Capture decisions, tasks, links, and budget items even when silent

Context extraction rules (only extract concrete, stated things, not hypotheticals):
- "decision": a choice the group has made (e.g. "We're going with Next.js")
- "task": something to do with an owner if mentioned (e.g. "Marcus will set up CI/CD")
- "link": a URL shared in the chat
- "budget": a monetary figure or budget constraint (e.g. "Q2 budget is $12,000")
- Return null for contextItems if nothing new to extract.`

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

Respond naturally to the conversation. You can use markdown for formatting (bold, lists, etc).`

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
    const settings: RoomSettings = { ...DEFAULT_ROOM_SETTINGS, ...rawSettings }

    // Step 1: Fast decision call (shouldRespond + context extraction)
    const { object: decision } = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: decisionSchema,
      system: buildSystemPrompt(settings),
      messages,
    })

    const contextItems = decision.contextItems ?? []

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

    // Build a custom SSE stream: first event is metadata, then text chunks
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata as first event
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ type: 'meta', shouldRespond: true, contextItems })}\n\n`
          )
        )

        // Stream text chunks
        for await (const chunk of result.textStream) {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: 'text', content: chunk })}\n\n`
            )
          )
        }

        // Done
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
        controller.close()
      },
    })

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
