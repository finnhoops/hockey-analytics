'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const EXAMPLE_QUESTIONS = [
  'Which team has the best even-strength shooting percentage over the last 3 seasons?',
  "Is Connor McDavid's point-per-game rate historically sustainable long-term?",
  "How do the Oilers' goaltending numbers compare to Stanley Cup winners historically?",
  'Which defencemen have the best offensive impact while maintaining strong defensive metrics?',
]

export default function AskChat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [streamingText, setStreamingText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, streamingText])

  async function sendMessage(text: string) {
    if (!text.trim() || loading) return
    const userMsg: Message = { role: 'user', content: text.trim() }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    setStreamingText('')

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      })

      if (!res.ok) {
        const err = await res.json()
        setMessages([...next, { role: 'assistant', content: err.error ?? 'Something went wrong.' }])
        return
      }

      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let full = ''

      if (reader) {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          full += chunk
          setStreamingText(full)
        }
      }

      setMessages([...next, { role: 'assistant', content: full }])
      setStreamingText('')
    } catch {
      setMessages([...next, { role: 'assistant', content: 'Network error. Please try again.' }])
    } finally {
      setLoading(false)
    }
  }

  const hasMessages = messages.length > 0 || streamingText

  return (
    <div className="flex flex-col gap-6">
      {/* Empty state — example questions */}
      {!hasMessages && (
        <div className="rounded-xl border border-border bg-card p-6">
          <p className="mb-4 text-sm font-medium text-muted-foreground">Try asking:</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {EXAMPLE_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className="rounded-lg border border-border bg-secondary p-3 text-left text-sm hover:border-primary/40 hover:bg-secondary/80 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      {hasMessages && (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={msg.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
            >
              <div
                className={[
                  'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-sm'
                    : 'bg-card border border-border rounded-bl-sm',
                ].join(' ')}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {streamingText && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3 text-sm leading-relaxed">
                {streamingText}
                <span className="ml-1 inline-block h-4 w-0.5 animate-pulse bg-primary" />
              </div>
            </div>
          )}
          {loading && !streamingText && (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-sm border border-border bg-card px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage(input)
            }
          }}
          placeholder="Ask a hockey question..."
          disabled={loading}
          className="flex-1"
        />
        <Button
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
          className="shrink-0"
        >
          {loading ? 'Thinking...' : 'Ask'}
        </Button>
      </div>
    </div>
  )
}
