import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a hockey analytics expert and researcher. You have deep knowledge of:
- NHL statistics (both traditional and advanced: Corsi, Fenwick, xG, GSAA, PDO, Zone Starts, etc.)
- Historical NHL records and trends
- Team construction, salary cap strategy, and roster building
- Goaltending metrics and evaluation
- Playoff performance patterns
- International hockey and how players translate to the NHL
- Draft analytics and prospect evaluation

When answering questions:
- Be specific and cite stats or historical comparisons where relevant
- Acknowledge uncertainty when it exists — don't make up numbers
- Explain advanced stats in plain language when you use them
- Keep answers focused and conversational, like you're on a podcast like 32 Thoughts
- If a question would benefit from a table or structured comparison, use one

Current season: 2025-26. Your knowledge is current through mid-2025.`

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    return Response.json(
      {
        error:
          'The Ask Anything feature requires an Anthropic API key. ' +
          'Add ANTHROPIC_API_KEY to your .env.local file to enable it.',
      },
      { status: 503 }
    )
  }

  const body = await req.json()
  const messages: { role: 'user' | 'assistant'; content: string }[] = body.messages ?? []

  if (!messages.length) {
    return Response.json({ error: 'No messages provided.' }, { status: 400 })
  }

  const client = new Anthropic({ apiKey })

  const stream = client.messages.stream({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages,
  })

  const encoder = new TextEncoder()

  const readable = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })

  return new Response(readable, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
