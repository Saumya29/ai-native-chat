interface StreamPart {
  type: string
  textDelta?: string
  error?: unknown
}

// Consume fullStream rather than textStream: the latter filters out SDK error
// events, which would otherwise turn a failed reply into a successful empty one.
export function createChatStream(parts: AsyncIterable<StreamPart>, contextItems: unknown[]) {
  const encoder = new TextEncoder()
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit = (payload: unknown) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`))
      try {
        emit({ type: 'meta', shouldRespond: true, contextItems })
        for await (const part of parts) {
          if (part.type === 'error') throw part.error ?? new Error('Reply interrupted')
          if (part.type === 'text-delta') emit({ type: 'text', content: part.textDelta })
        }
        emit({ type: 'done' })
      } catch (error) {
        console.error('[mesh] Stream error:', error)
        emit({ type: 'error', message: 'The reply was interrupted. Please try again.' })
      } finally {
        controller.close()
      }
    },
  })
}
