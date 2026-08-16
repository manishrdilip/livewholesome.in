const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** The WHOLESOME grain emblem — same mark used on the invoice PDF. */
export function LogoMark({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" width={size} height={size} className={className} aria-hidden>
      <defs>
        <radialGradient id="wholesomeGoldGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E8C96D" />
          <stop offset="100%" stopColor="#A67C00" />
        </radialGradient>
      </defs>
      <circle cx={100} cy={100} r={94} fill="none" stroke="url(#wholesomeGoldGrad)" strokeWidth={1.5} opacity={0.6} />
      <circle cx={100} cy={100} r={80} fill="none" stroke="url(#wholesomeGoldGrad)" strokeWidth={0.8} opacity={0.35} />
      {ANGLES.map((angle) => (
        <g key={angle} transform={`rotate(${angle}, 100, 100)`}>
          <line x1={100} y1={100} x2={100} y2={40} stroke="url(#wholesomeGoldGrad)" strokeWidth={1.5} opacity={0.7} />
          <ellipse cx={100} cy={34} rx={5} ry={9} fill="url(#wholesomeGoldGrad)" opacity={0.9} />
          <ellipse
            cx={93}
            cy={56}
            rx={4}
            ry={7}
            fill="url(#wholesomeGoldGrad)"
            opacity={0.6}
            transform="rotate(-25, 93, 56)"
          />
          <ellipse
            cx={107}
            cy={56}
            rx={4}
            ry={7}
            fill="url(#wholesomeGoldGrad)"
            opacity={0.6}
            transform="rotate(25, 107, 56)"
          />
        </g>
      ))}
      <circle cx={100} cy={100} r={6} fill="url(#wholesomeGoldGrad)" />
      <circle cx={100} cy={100} r={3} fill="#F8F2E3" />
    </svg>
  );
}
