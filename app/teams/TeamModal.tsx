import Image from 'next/image'
import Link from 'next/link'
import { getClubStats } from '@/lib/nhl-api'
import { formatTOI } from '@/types/nhl'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface Props {
  teamAbbrev: string
  season: number
  gameType: number
  teamName: string
}

export default async function TeamModal({ teamAbbrev, season, gameType, teamName }: Props) {
  const stats = await getClubStats(teamAbbrev, season, gameType).catch(() => null)
  const skaters = stats
    ? stats.skaters.sort((a, b) => b.points - a.points).slice(0, 20)
    : []

  const label = gameType === 3 ? 'Playoff' : 'Regular Season'

  return (
    <Dialog open>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle>
            {teamName} — {label} Skater Stats
          </DialogTitle>
        </DialogHeader>

        {skaters.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No {label.toLowerCase()} stats available for this team.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase">
                  <th className="px-3 py-2 text-left">Player</th>
                  <th className="px-2 py-2">Pos</th>
                  <th className="px-2 py-2">GP</th>
                  <th className="px-2 py-2">G</th>
                  <th className="px-2 py-2">A</th>
                  <th className="px-2 py-2 text-primary font-semibold">PTS</th>
                  <th className="px-2 py-2">+/-</th>
                  <th className="px-2 py-2">TOI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {skaters.map((s) => (
                  <tr key={s.playerId} className="hover:bg-secondary/30">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-muted">
                          <Image
                            src={s.headshot}
                            alt={`${s.firstName.default} ${s.lastName.default}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                        <span className="font-medium">
                          {s.firstName.default} {s.lastName.default}
                        </span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-center text-muted-foreground">{s.positionCode}</td>
                    <td className="px-2 py-2 text-center">{s.gamesPlayed}</td>
                    <td className="px-2 py-2 text-center">{s.goals}</td>
                    <td className="px-2 py-2 text-center">{s.assists}</td>
                    <td className="px-2 py-2 text-center font-bold text-primary">{s.points}</td>
                    <td className="px-2 py-2 text-center">
                      <span className={s.plusMinus >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {s.plusMinus > 0 ? '+' : ''}{s.plusMinus}
                      </span>
                    </td>
                    <td className="px-2 py-2 text-center text-muted-foreground text-xs">
                      {formatTOI(s.avgTimeOnIcePerGame)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="pt-2 text-center">
          <Link
            href="/teams"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to teams
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  )
}
