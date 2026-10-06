interface ExtractedItem {
  type: 'decision' | 'task' | 'link' | 'budget'
  text: string
  sourceQuote: string
}

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim()

// A model may reuse old conversation facts or promote a question's premise
// into a decision. Only declarative evidence in the new message may be saved.
export function groundedContextItems(items: ExtractedItem[], latestMessage: string) {
  const sentences = latestMessage.split(/(?<=[?!])\s+|(?<=\.)\s+(?=[A-Z])|\n+/).map(normalize)
  return items.filter(item => {
    const quote = normalize(item.sourceQuote)
    if (!quote) return false
    return sentences.some(sentence => sentence.includes(quote) &&
      !sentence.includes('?') &&
      !/^(?:\[[^\]]+\]:\s*)?(?:can|could|would|should|did|do|does|is|are|what|when|why|how)\b/i.test(sentence))
  }).map(({ sourceQuote, ...item }) => {
    if (item.type !== 'task') return item
    const sentence = sentences.find(sentence => sentence.includes(normalize(sourceQuote)))!
    // Keep the actual task sentence, including deadline, instead of a lossy summary.
    return { ...item, text: sentence.replace(/^\[[^\]]+\]:\s*/, '') }
  })
}
