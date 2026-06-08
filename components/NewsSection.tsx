import Link from 'next/link'

interface NewsItem {
  title: string
  link: string
  pubDate: string
  source: string
}

async function fetchNHLNews(): Promise<NewsItem[]> {
  try {
    const res = await fetch(
      'https://news.google.com/rss/search?q=NHL+hockey+news&hl=en-US&gl=US&ceid=US:en',
      {
        headers: { 'User-Agent': 'IceIQ/1.0' },
        next: { revalidate: 3600 },
      }
    )
    if (!res.ok) return []
    const xml = await res.text()

    const items: NewsItem[] = []
    const itemBlocks = xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []

    for (const block of itemBlocks.slice(0, 8)) {
      const title = block.match(/<title>([\s\S]*?)<\/title>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? ''
      const link = block.match(/<link>([\s\S]*?)<\/link>/)?.[1]?.trim()
        ?? block.match(/<guid[^>]*>([\s\S]*?)<\/guid>/)?.[1]?.trim()
        ?? '#'
      const pubDate = block.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]?.trim() ?? ''
      const source = block.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]?.replace(/<!\[CDATA\[|\]\]>/g, '').trim() ?? 'Google News'

      if (title && title !== 'Google News') {
        items.push({ title, link, pubDate, source })
      }
    }
    return items
  } catch {
    return []
  }
}

function formatPubDate(dateStr: string): string {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return ''
  }
}

interface Props {
  season: number
}

export default async function NewsSection({ season }: Props) {
  const startYear = Math.floor(season / 10000)
  const endYear = season % 10000
  const endYr2 = String(endYear).slice(-2)

  // Current/recent: show live Google News feed
  if (season >= 20232024) {
    const articles = await fetchNHLNews()

    if (articles.length === 0) {
      return (
        <p className="text-sm text-muted-foreground">
          News unavailable — check{' '}
          <a href="https://www.nhl.com/news" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            NHL.com
          </a>{' '}
          for the latest.
        </p>
      )
    }

    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {articles.map((item, i) => (
          <a
            key={i}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-border bg-card p-3.5 hover:border-primary/40 hover:bg-secondary/30 transition-all flex flex-col gap-1.5"
          >
            <p className="text-sm font-medium leading-snug line-clamp-3">{item.title}</p>
            <div className="mt-auto flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span className="truncate">{item.source}</span>
              {item.pubDate && <span className="shrink-0 ml-2">{formatPubDate(item.pubDate)}</span>}
            </div>
          </a>
        ))}
      </div>
    )
  }

  // Historical: static reference links
  const wikiUrl = `https://en.wikipedia.org/wiki/${startYear}%E2%80%93${endYr2}_NHL_season`
  const hockeyRefUrl = `https://www.hockey-reference.com/leagues/NHL_${endYear}.html`

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <a
        href={hockeyRefUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-secondary/30 transition-all"
      >
        <p className="font-semibold text-sm mb-1">Hockey Reference</p>
        <p className="text-xs text-muted-foreground">
          Complete {startYear}–{endYr2} season stats, standings, and records — the definitive historical hockey database.
        </p>
        <p className="mt-2 text-xs text-primary">View season →</p>
      </a>
      <a
        href={wikiUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="rounded-xl border border-border bg-card p-4 hover:border-primary/40 hover:bg-secondary/30 transition-all"
      >
        <p className="font-semibold text-sm mb-1">Wikipedia — {startYear}–{endYr2} NHL Season</p>
        <p className="text-xs text-muted-foreground">
          Season overview: key trades, notable events, award winners, and the road to the Stanley Cup.
        </p>
        <p className="mt-2 text-xs text-primary">Read article →</p>
      </a>
    </div>
  )
}
