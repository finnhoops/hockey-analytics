'use client'

import { useRouter, usePathname } from 'next/navigation'
import { formatSeason, groupSeasonsByDecade } from '@/types/nhl'

interface Props {
  currentView: string
  currentSeason: number
  allSeasons: number[]
}

const ALL_VIEWS = [
  { value: 'division', label: 'Division' },
  { value: 'conference', label: 'Conference' },
  { value: 'wildcard', label: 'Wild Card' },
]

export default function StandingsToggle({ currentView, currentSeason, allSeasons }: Props) {
  const VIEWS = currentSeason < 20132014
    ? ALL_VIEWS.filter((v) => v.value !== 'wildcard')
    : ALL_VIEWS
  const router = useRouter()
  const pathname = usePathname()

  function update(view: string, season: number) {
    router.push(`${pathname}?view=${view}&season=${season}`)
  }

  const groups = groupSeasonsByDecade(allSeasons)

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <div className="flex rounded-lg border border-border bg-secondary p-1 gap-1">
        {VIEWS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => update(value, currentSeason)}
            className={[
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              value === currentView
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="ml-auto">
        <select
          value={currentSeason}
          onChange={(e) => update(currentView, parseInt(e.target.value))}
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
