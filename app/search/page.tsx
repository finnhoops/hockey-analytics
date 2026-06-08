import SearchClient from './SearchClient'

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Search</h1>
        <p className="mt-1 text-muted-foreground">
          Every player and team in NHL history
        </p>
      </div>
      <SearchClient />
    </div>
  )
}
