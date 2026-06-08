'use client'

import { useRouter } from 'next/navigation'
import { formatSeason, groupSeasonsByDecade } from '@/types/nhl'

interface Props {
  allSeasons: number[]
  currentSeason: number
  gameType: 'regular' | 'playoffs'
}

export default function DashboardFilters({ allSeasons, currentSeason, gameType }: Props) {
  const router = useRouter()

  function update(season: number, type: 'regular' | 'playoffs') {
    router.push(`/?season=${season}&gameType=${type}`)
  }

  const groups = groupSeasonsByDecade(allSeasons)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1">
        <button
          onClick={() => update(currentSeason, 'regular')}
          className={[
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            gameType === 'regular'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          Regular Season
        </button>
        <button
          onClick={() => update(currentSeason, 'playoffs')}
          className={[
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            gameType === 'playoffs'
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          Playoffs
        </button>
      </div>
      <div className="ml-auto">
        <select
          value={currentSeason}
          onChange={(e) => update(parseInt(e.target.value), gameType)}
          className="rounded-md border border-border bg-secondary px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
        >
          {groups.map(({ decade, seasons }) => (
            <optgroup key={decade} label={decade}>
              {seasons.map((s) => (
                <option key={s} value={s}>
                  {formatSeason(s)}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    </div>
  )
}
