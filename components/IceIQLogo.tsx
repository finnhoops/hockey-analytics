interface Props {
  className?: string
}

export default function IceIQLogo({ className = 'h-8 w-8' }: Props) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Brain outline — two hemispheres */}
      <path
        d="M20 6
           C20 6 13 5 10 10
           C7 13 6 17 7 20
           C6 23 7 27 10 29
           C12 31 15 32 17 31
           L17 34
           L23 34
           L23 31
           C25 32 28 31 30 29
           C33 27 34 23 33 20
           C34 17 33 13 30 10
           C27 5 20 6 20 6Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
        fill="currentColor"
        fillOpacity="0.08"
      />
      {/* Center split line */}
      <line
        x1="20" y1="7"
        x2="20" y2="31"
        stroke="currentColor"
        strokeWidth="0.8"
        strokeDasharray="2 1.5"
        strokeOpacity="0.5"
      />
      {/* Left hemisphere detail curl */}
      <path
        d="M14 13 C11 15 10 19 12 22"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
        fill="none"
      />
      <path
        d="M13 19 C12 22 14 25 16 26"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
        fill="none"
      />
      {/* Right hemisphere detail curl */}
      <path
        d="M26 13 C29 15 30 19 28 22"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
        fill="none"
      />
      <path
        d="M27 19 C28 22 26 25 24 26"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeOpacity="0.6"
        fill="none"
      />
      {/* Hockey stick 1 — shaft running diagonally top-right to bottom-left */}
      <line
        x1="28" y1="5"
        x2="13" y2="30"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Hockey stick 1 blade — short horizontal piece at bottom-left */}
      <line
        x1="10" y1="30"
        x2="17" y2="30"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Hockey stick 2 — shaft running diagonally top-left to bottom-right */}
      <line
        x1="12" y1="5"
        x2="27" y2="30"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      {/* Hockey stick 2 blade — short horizontal piece at bottom-right */}
      <line
        x1="23" y1="30"
        x2="30" y2="30"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
  )
}
