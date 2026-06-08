'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ALL_NHL_TEAMS } from '@/lib/team-history'
import type { PlayerSearchResult } from '../api/search-players/route'

function HockeyPlayerIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <circle cx="20" cy="20" r="20" className="fill-secondary" />
      <circle cx="20" cy="14" r="5" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground" />
      <path d="M10 34c0-6 4-10 10-10s10 4 10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-muted-foreground" />
    </svg>
  )
}

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [players, setPlayers] = useState<PlayerSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const q = query.trim().toLowerCase()

  // Debounced player search via API route
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (q.length < 2) {
      setPlayers([])
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search-players?q=${encodeURIComponent(q)}`)
        const data: PlayerSearchResult[] = await res.json()
        setPlayers(data)
      } catch {
        setPlayers([])
      } finally {
        setLoading(false)
      }
    }, 350)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [q])

  // Team search — instant from static list
  const matchedTeams = useMemo(() => {
    if (!q) return []
    return ALL_NHL_TEAMS.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.abbrev.toLowerCase().includes(q)
    ).slice(0, 12)
  }, [q])

  const isEmpty = q.length < 2
  const noResults = q.length >= 2 && !loading && players.length === 0 && matchedTeams.length === 0

  return (
    <div>
      {/* Search box */}
      <div className="relative mb-8">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          placeholder="Search any NHL player or team, past or present…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full rounded-xl border border-border bg-card pl-12 pr-10 py-3.5 text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </div>

      {/* Empty state */}
      {isEmpty && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-4xl mb-3">🏒</p>
          <p className="text-lg font-medium">Search any NHL player or team</p>
          <p className="text-sm mt-1">Every player and team in NHL history — try "Gretzky", "Lemieux", "Whalers", or "QUE"</p>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="text-center py-8 text-muted-foreground text-sm">Searching…</div>
      )}

      {/* No results */}
      {noResults && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-2xl mb-2">🔍</p>
          <p>No results for "{query}"</p>
          <p className="text-sm mt-1">Try a different spelling or team abbreviation</p>
        </div>
      )}

      {/* Team results */}
      {matchedTeams.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Teams
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {matchedTeams.map((team) => (
              <Link
                key={team.abbrev}
                href={`/team/${team.abbrev}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:bg-secondary/50 transition-all"
              >
                {team.isDefunct ? (
                  <div className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg bg-secondary text-xs font-bold text-muted-foreground">
                    {team.abbrev}
                  </div>
                ) : (
                  <div className="relative h-10 w-10 shrink-0">
                    <Image
                      src={`https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_light.svg`}
                      alt={team.abbrev}
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{team.name}</p>
                  {team.isDefunct ? (
                    <p className="text-xs text-muted-foreground">{team.yearsActive} · Defunct</p>
                  ) : (
                    <p className="text-xs text-muted-foreground">{team.abbrev}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Player results */}
      {players.length > 0 && !loading && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Players
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {players.map((player) => (
              <Link
                key={player.playerId}
                href={`/player/${player.playerId}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/40 hover:bg-secondary/50 transition-all"
              >
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full">
                  <HockeyPlayerIcon className="h-12 w-12" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{player.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {player.position === 'G' ? 'Goalie' :
                     player.position === 'D' ? 'Defenseman' :
                     player.position === 'C' ? 'Center' :
                     player.position === 'L' ? 'Left Wing' :
                     player.position === 'R' ? 'Right Wing' :
                     player.position}
                  </p>
                </div>
                <svg className="h-4 w-4 shrink-0 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
          <p className="mt-3 text-xs text-muted-foreground text-center">
            Showing top {players.length} result{players.length !== 1 ? 's' : ''} — search all NHL history
          </p>
        </section>
      )}
    </div>
  )
}
