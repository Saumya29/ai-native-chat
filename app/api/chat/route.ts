import { generateObject } from 'ai'
import { openai } from '@ai-sdk/openai'
import { z } from 'zod'

export const runtime = 'nodejs'

const responseSchema = z.object({
  content: z.string().describe("Mesh's reply message to the group"),
  contextItems: z
    .array(
      z.object({
        type: z.enum(['decision', 'task', 'link', 'budget']),
        text: z.string(),
      })
    )
    .nullable()
    .describe('Decisions, tasks, links, or budget figures to track from this exchange'),
})

const SYSTEM_PROMPT = `You are Mesh, an AI collaborator in a group chat. Your job is to be genuinely helpful in conversations — contributing insights, asking clarifying questions, summarizing progress, and keeping the group aligned.

Personality:
- Clear, concise, and direct. No fluff.
- Collaborative — you are part of the team, not a bot widget.
- Proactively notice when the group makes a decision, assigns a task, mentions a budget figure, or shares a link.

When responding:
- Keep replies short unless the topic demands depth.
- If someone makes a decision, confirm it briefly.
- If a task is mentioned, note who it is assigned to if clear.
- Never start your reply with "I" or "Sure" or "Of course".

Context extraction rules:
- Extract a contextItem only when something concrete is stated, not hypothetically.
- "decision": a choice the group has made (e.g. "We'll use React")
- "task": something to do, ideally with an owner (e.g. "Bob will draft the proposal")
- "link": a URL shared in the chat
- "budget": a monetary figure or budget constraint mentioned
- If nothing new to extract, return contextItems as null.`

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const { object } = await generateObject({
      model: openai('gpt-4o'),
      schema: responseSchema,
      system: SYSTEM_PROMPT,
      messages,
    })

    return Response.json({
      content: object.content,
      contextItems: object.contextItems ?? [],
    })
  } catch (error) {
    console.error('[mesh] API error:', error)
    return Response.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
