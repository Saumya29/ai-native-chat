import { generateObject } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { z } from 'zod'

export const runtime = 'nodejs'

const openai = createOpenAI({ apiKey: process.env.OPENAI_API_KEY })

const responseSchema = z.object({
  content: z.string().describe("Mesh's reply to the group"),
  contextItems: z
    .array(
      z.object({
        type: z.enum(['decision', 'task', 'link', 'budget']),
        text: z.string(),
      })
    )
    .nullable()
    .describe('Structured items to track from this exchange, or null if nothing concrete'),
})

const SYSTEM_PROMPT = `You are Mesh, an AI collaborator in a product team's group chat. You are part of the team — not a bot widget.

Your personality:
- Clear, direct, and genuinely helpful. No fluff, no filler.
- Proactively notice decisions, tasks, budget figures, and links.
- Keep replies short unless depth is needed.
- Never start a reply with "I", "Sure", or "Of course".

Context extraction rules (only extract concrete, stated things — not hypotheticals):
- "decision": a choice the group has made (e.g. "We're going with Next.js")
- "task": something to do with an owner if mentioned (e.g. "Marcus will set up CI/CD")
- "link": a URL shared in the chat
- "budget": a monetary figure or budget constraint (e.g. "Q2 budget is $12,000")
- Return null for contextItems if nothing new to extract.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const { object } = await generateObject({
      model:   openai('gpt-4o'),
      schema:  responseSchema,
      system:  SYSTEM_PROMPT,
      messages,
    })

    return Response.json({
      content:      object.content,
      contextItems: object.contextItems ?? [],
    })
  } catch (error) {
    console.error('[mesh] API error:', error)
    return Response.json({ error: 'Failed to generate response' }, { status: 500 })
  }
}
