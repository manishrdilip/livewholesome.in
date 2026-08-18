"use client";

import { useId } from "react";

// Silhouette traced from a licensed icon (svgrepo.com, "man-standing-up") —
// not hand-drawn, so the anatomy is right. Head and body are separate paths;
// the fill only ever rises within the body path, so the head stays neutral
// regardless of percentage.
const HEAD_PATH =
  "M46.031,21.672c5.975,0,10.836-4.861,10.836-10.836S52.006,0,46.031,0S35.195,4.861,35.195,10.836S40.056,21.672,46.031,21.672z";
const BODY_PATH =
  "M68.311,38.201l-8.574-11.945c-0.835-1.164-2.546-2.042-3.979-2.042h-1.313h-0.937h-15.01h-0.884h-1.366c-1.433,0-3.143,0.878-3.979,2.042l-8.574,11.945c-0.862,1.202-0.969,3.153-0.243,4.441l6.942,12.324c0.711,1.263,2.404,2.252,3.853,2.252h0.367v0.12v0.503v29.166c0,2.757,2.243,5,5,5h0.353c2.757,0,5-2.243,5-5V60.842h2.126v26.166c0,2.757,2.243,5,5,5h0.352c2.757,0,5-2.243,5-5V57.842v-0.503v-0.12h0.314c1.449,0,3.141-0.989,3.853-2.252l6.942-12.324C69.281,41.354,69.174,39.403,68.311,38.201z M34.615,47.981l-3.399-5.538c-0.369-0.601-0.337-1.673,0.065-2.251l3.334-4.785V47.981z M57.446,35.483l3.281,4.708c0.402,0.578,0.434,1.65,0.065,2.251l-3.346,5.451V35.483z";

const SIZE = 92.008;

export function HumanFillFigure({ percent, className }: { percent: number; className?: string }) {
  const reactId = useId();
  const clipId = `hff-${reactId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const clamped = Math.max(0, Math.min(100, percent));
  const y = SIZE - (SIZE * clamped) / 100;

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden="true">
      <defs>
        <clipPath id={clipId}>
          <path d={BODY_PATH} />
        </clipPath>
      </defs>
      <g fill="#f8f2e3">
        <path d={HEAD_PATH} />
        <path d={BODY_PATH} />
      </g>
      <g clipPath={`url(#${clipId})`}>
        <path
          d={`M0,${y} Q23,${y - 3} 46,${y} Q69,${y + 3} ${SIZE},${y} L${SIZE},${SIZE} L0,${SIZE} Z`}
          fill="currentColor"
        />
      </g>
      <g fill="none" stroke="#1c1a14" strokeWidth="1.6">
        <path d={HEAD_PATH} />
        <path d={BODY_PATH} />
      </g>
    </svg>
  );
}
