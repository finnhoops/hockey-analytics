import Link from 'next/link'
import Image from 'next/image'
import type { FranchiseInfo } from '@/lib/team-history'

interface Props {
  chain: FranchiseInfo[]
  currentAbbrev: string
}

export default function FranchiseChain({ chain, currentAbbrev }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {chain.map((team, i) => {
        const isCurrent = team.abbrev === currentAbbrev
        const isActive = !team.isDefunct

        return (
          <div key={team.abbrev} className="flex items-center gap-1">
            <Link
              href={`/team/${team.abbrev}`}
              className={[
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all',
                isCurrent
                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                  : 'border-border bg-card hover:border-primary/40 hover:bg-secondary/50 text-muted-foreground hover:text-foreground',
              ].join(' ')}
            >
              {isActive ? (
                <div className="relative h-6 w-6 shrink-0">
                  <Image
                    src={`https://assets.nhle.com/logos/nhl/svg/${team.abbrev}_light.svg`}
                    alt={team.abbrev}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>
              ) : (
                <span className="text-xs font-bold w-6 text-center">{team.abbrev}</span>
              )}
              <div>
                <div className="leading-tight">{team.name}</div>
                <div className="text-xs opacity-70">
                  {team.yearsActive ?? `${team.foundedYear}–present`}
                </div>
              </div>
            </Link>
            {i < chain.length - 1 && (
              <span className="text-muted-foreground text-lg mx-0.5">→</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
