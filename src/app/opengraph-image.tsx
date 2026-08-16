import { ImageResponse } from "next/og";

export const alt = "Wholesome Purna — Sprouted Multigrain Health Mix";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const GOLD = "#A67C00";
const GOLD_LIGHT = "#E8C96D";
const FOREST_DEEP = "#1A3A1A";
const CREAM = "#F8F2E3";

const ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: FOREST_DEEP,
        }}
      >
        <svg width="200" height="200" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="94" fill="none" stroke={GOLD} strokeWidth={1.5} opacity={0.6} />
          <circle cx="100" cy="100" r="80" fill="none" stroke={GOLD} strokeWidth={0.8} opacity={0.35} />
          {ANGLES.map((angle) => (
            <g key={angle} transform={`rotate(${angle} 100 100)`}>
              <line x1="100" y1="100" x2="100" y2="40" stroke={GOLD} strokeWidth={1.5} opacity={0.7} />
              <ellipse cx="100" cy="34" rx="5" ry="9" fill={GOLD_LIGHT} opacity={0.9} />
              <ellipse
                cx="93"
                cy="56"
                rx="4"
                ry="7"
                fill={GOLD_LIGHT}
                opacity={0.6}
                transform="rotate(-25 93 56)"
              />
              <ellipse
                cx="107"
                cy="56"
                rx="4"
                ry="7"
                fill={GOLD_LIGHT}
                opacity={0.6}
                transform="rotate(25 107 56)"
              />
            </g>
          ))}
          <circle cx="100" cy="100" r="6" fill={GOLD} />
          <circle cx="100" cy="100" r="3" fill={CREAM} />
        </svg>
        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 104,
            fontFamily: "serif",
            fontWeight: 700,
            letterSpacing: -2,
          }}
        >
          <span style={{ color: GOLD, fontStyle: "italic" }}>W</span>
          <span style={{ color: CREAM }}>holesome</span>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            fontSize: 24,
            letterSpacing: 8,
            color: GOLD,
            fontFamily: "sans-serif",
          }}
        >
          WHOLE • COMPLETE • FULL
        </div>
      </div>
    ),
    { ...size }
  );
}
