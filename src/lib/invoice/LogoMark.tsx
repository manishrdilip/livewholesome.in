import { Svg, G, Circle, Ellipse, Line, Defs, RadialGradient, Stop } from "@react-pdf/renderer";

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

/** The WHOLESOME grain emblem — values match D:\Wholesome Health Mix\Wholesome
 * Logo.svg (the source file) exactly; this is a value-for-value port to
 * @react-pdf/renderer's primitives, not an approximation. */
export function LogoMark({ size = 60 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 200 200" style={{ width: size, height: size }}>
      <Defs>
        <RadialGradient id="goldGrad" cx="50%" cy="50%" r="50%">
          <Stop offset="0%" stopColor="#E8C96D" />
          <Stop offset="100%" stopColor="#A67C00" />
        </RadialGradient>
      </Defs>
      <Circle cx={100} cy={100} r={94} fill="none" stroke="url(#goldGrad)" strokeWidth={1.5} opacity={0.5} />
      <Circle cx={100} cy={100} r={80} fill="none" stroke="url(#goldGrad)" strokeWidth={0.8} opacity={0.25} />
      {ANGLES.map((angle) => (
        <G key={angle} transform={`rotate(${angle}, 100, 100)`}>
          <Line x1={100} y1={100} x2={100} y2={42} stroke="url(#goldGrad)" strokeWidth={1.5} />
          <Ellipse cx={100} cy={36} rx={5} ry={8} fill="url(#goldGrad)" />
          <Ellipse
            cx={94}
            cy={57}
            rx={3.5}
            ry={6}
            fill="url(#goldGrad)"
            opacity={0.6}
            transform="rotate(-25, 94, 57)"
          />
          <Ellipse
            cx={106}
            cy={57}
            rx={3.5}
            ry={6}
            fill="url(#goldGrad)"
            opacity={0.6}
            transform="rotate(25, 106, 57)"
          />
        </G>
      ))}
      <Circle cx={100} cy={100} r={6} fill="url(#goldGrad)" />
      <Circle cx={100} cy={100} r={2.5} fill="#F8F2E3" />
    </Svg>
  );
}
