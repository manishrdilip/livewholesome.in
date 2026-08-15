import { Svg, G, Circle, Ellipse, Line, Defs, RadialGradient, Stop } from "@react-pdf/renderer";

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** The WHOLESOME grain emblem, ported from Wholesome Logo.svg for PDF rendering. */
export function LogoMark({ size = 60 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 200 200" style={{ width: size, height: size }}>
      <Defs>
        <RadialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E8C96D" />
          <Stop offset="100%" stopColor="#A67C00" />
        </RadialGradient>
      </Defs>
      <Circle cx={100} cy={100} r={94} fill="none" stroke="url(#goldGrad)" strokeWidth={1.5} opacity={0.6} />
      <Circle cx={100} cy={100} r={80} fill="none" stroke="url(#goldGrad)" strokeWidth={0.8} opacity={0.35} />
      {ANGLES.map((angle) => (
        <G key={angle} transform={`rotate(${angle}, 100, 100)`}>
          <Line x1={100} y1={100} x2={100} y2={40} stroke="url(#goldGrad)" strokeWidth={1.5} opacity={0.7} />
          <Ellipse cx={100} cy={34} rx={5} ry={9} fill="url(#goldGrad)" opacity={0.9} />
          <Ellipse
            cx={93}
            cy={56}
            rx={4}
            ry={7}
            fill="url(#goldGrad)"
            opacity={0.6}
            transform="rotate(-25, 93, 56)"
          />
          <Ellipse
            cx={107}
            cy={56}
            rx={4}
            ry={7}
            fill="url(#goldGrad)"
            opacity={0.6}
            transform="rotate(25, 107, 56)"
          />
        </G>
      ))}
      <Circle cx={100} cy={100} r={6} fill="url(#goldGrad)" />
      <Circle cx={100} cy={100} r={3} fill="#F8F2E3" />
    </Svg>
  );
}
