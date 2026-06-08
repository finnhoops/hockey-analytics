'use client'

import { useRouter, usePathname } from 'next/navigation'
import { formatSeason, groupSeasonsByDecade } from '@/types/nhl'

interface Props {
  currentSeason: number
  allSeasons: number[]
  isPlayoffs: boolean
}

export default function TeamsSeasonSelect({ currentSeason, allSeasons, isPlayoffs }: Props) {
  const router = useRouter()
  const pathname = usePathname()

  function update(season: number, playoffs: boolean) {
    const gt = playoffs ? 'playoffs' : 'regular'
    router.push(`${pathname}?season=${season}&gameType=${gt}`)
  }

  const groups = groupSeasonsByDecade(allSeasons)

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Regular / Playoffs toggle */}
      <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1">
        <button
          onClick={() => update(currentSeason, false)}
          className={[
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            !isPlayoffs
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          Regular
        </button>
        <button
          onClick={() => update(currentSeason, true)}
          className={[
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            isPlayoffs
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground',
          ].join(' ')}
        >
          Playoffs
        </button>
      </div>

      {/* Season selector */}
      <select
        value={currentSeason}
        onChange={(e) => update(parseInt(e.target.value), isPlayoffs)}
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
  )
}
