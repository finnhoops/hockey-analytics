import AskChat from './AskChat'

export default function AskPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Ask Anything</h1>
        <p className="mt-2 text-muted-foreground">
          Ask any hockey question — advanced stats, historical comparisons, team construction,
          playoff trends. Inspired by the research-driven analysis you hear on 32 Thoughts.
        </p>
      </div>
      <AskChat />
    </div>
  )
}
