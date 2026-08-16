type DayRevenue = { date: string; label: string; revenue: number };

export function RevenueChart({ data }: { data: DayRevenue[] }) {
  const max = Math.max(1, ...data.map((d) => d.revenue));
  const width = 720;
  const height = 180;
  const barGap = 4;
  const barWidth = data.length ? width / data.length - barGap : 0;

  return (
    <div className="overflow-x-auto rounded-xl border border-ink/10 bg-white p-5">
      <h2 className="font-semibold">Revenue — last {data.length} days</h2>
      <svg
        viewBox={`0 0 ${width} ${height + 24}`}
        className="mt-4 min-w-[600px]"
        role="img"
        aria-label="Daily revenue bar chart"
      >
        {data.map((d, i) => {
          const barHeight = (d.revenue / max) * height;
          const x = i * (barWidth + barGap);
          const y = height - barHeight;
          return (
            <g key={d.date}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={3}
                className="fill-emerald"
              >
                <title>
                  {d.label}: ₹{d.revenue.toFixed(0)}
                </title>
              </rect>
              {(i % Math.ceil(data.length / 10 || 1) === 0 || i === data.length - 1) && (
                <text
                  x={x + barWidth / 2}
                  y={height + 16}
                  textAnchor="middle"
                  className="fill-ink/40 text-[9px]"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
