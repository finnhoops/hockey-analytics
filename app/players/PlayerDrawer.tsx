'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { formatSeason, type PlayerDetail } from '@/types/nhl'

interface Props {
  playerId: number
  onClose: () => void
}

function feetInches(inches: number) {
  const ft = Math.floor(inches / 12)
  const inn = inches % 12
  return `${ft}'${inn}"`
}

export default function PlayerDrawer({ playerId, onClose }: Props) {
  const [player, setPlayer] = useState<PlayerDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/player/${playerId}`)
      .then((r) => r.json())
      .then((data) => {
        setPlayer(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [playerId])

  const nhlTotals = player?.seasonTotals
    .filter((s) => s.leagueAbbrev === 'NHL' && s.gameTypeId === 2)
    .sort((a, b) => b.season - a.season) ?? []

  return (
    <Sheet open onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-card border-border">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            Loading...
          </div>
        ) : !player ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground">
            Failed to load player.
          </div>
        ) : (
          <>
            <SheetHeader className="mb-6">
              <div className="flex items-start gap-4">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted">
                  <Image
                    src={player.headshot}
                    alt={`${player.firstName.default} ${player.lastName.default}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <SheetTitle className="text-xl">
                    {player.firstName.default} {player.lastName.default}
                  </SheetTitle>
                  <p className="text-sm text-muted-foreground">
                    {player.sweaterNumber ? `#${player.sweaterNumber} · ` : ''}{player.fullTeamName?.default ?? ''}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge variant="secondary">{player.position}</Badge>
                    <Badge variant="outline">
                      {feetInches(player.heightInInches)} · {player.weightInPounds} lbs
                    </Badge>
                    <Badge variant="outline">
                      Born {player.birthDate} · {player.birthCountry}
                    </Badge>
                  </div>
                </div>
              </div>
            </SheetHeader>

            {/* NHL Season Stats */}
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              NHL Regular Season Stats
            </h3>
            {nhlTotals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No NHL regular season data.</p>
            ) : (
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="border-b border-border bg-secondary/50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground">Season</th>
                      <th className="px-3 py-2 text-left text-xs text-muted-foreground">Team</th>
                      <th className="px-3 py-2 text-xs text-muted-foreground">GP</th>
                      <th className="px-3 py-2 text-xs text-muted-foreground">G</th>
                      <th className="px-3 py-2 text-xs text-muted-foreground">A</th>
                      <th className="px-3 py-2 text-xs font-semibold text-primary">PTS</th>
                      <th className="px-3 py-2 text-xs text-muted-foreground">+/-</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {nhlTotals.slice(0, 8).map((s, i) => (
                      <tr key={`${s.season}-${i}`} className="hover:bg-secondary/30">
                        <td className="px-3 py-2">{formatSeason(s.season)}</td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {s.teamCommonName?.default ?? '—'}
                        </td>
                        <td className="px-3 py-2 text-center">{s.gamesPlayed}</td>
                        <td className="px-3 py-2 text-center">{s.goals}</td>
                        <td className="px-3 py-2 text-center">{s.assists}</td>
                        <td className="px-3 py-2 text-center font-bold text-primary">{s.points}</td>
                        <td className="px-3 py-2 text-center">
                          <span className={(s.plusMinus ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                            {(s.plusMinus ?? 0) > 0 ? '+' : ''}{s.plusMinus ?? '—'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
