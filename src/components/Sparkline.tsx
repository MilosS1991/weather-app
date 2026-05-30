interface SparkCtx {
  pastClip: string;
  futureClip: string;
}

interface Props {
  /** 0–100, position of "now" in SVG coordinate space */
  nowX: number;
  /** CSS px, for the HTML dot */
  nowY: number;
  /** SVG viewBox height and div height in px */
  height: number;
  /** Extra px reserved below SVG (e.g. for tick labels) */
  extraBottom?: number;
  /** Unique prefix for clipPath element IDs */
  id: string;
  className?: string;
  svgContent?: (ctx: SparkCtx) => React.ReactNode;
  /** HTML overlay children (labels, tick text, etc.) */
  children?: React.ReactNode;
}

export function Sparkline({
  nowX,
  nowY,
  height,
  extraBottom = 0,
  id,
  className = '',
  svgContent,
  children,
}: Props) {
  const pastClip  = `url(#${id}-past)`;
  const futureClip = `url(#${id}-future)`;

  return (
    <div className={`relative ${className}`} style={{ height: height + extraBottom }}>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="absolute top-0 left-0 w-full overflow-visible"
        style={{ height }}
      >
        <defs>
          <clipPath id={`${id}-past`}>
            <rect x={0} y={0} width={nowX} height={height} />
          </clipPath>
          <clipPath id={`${id}-future`}>
            <rect x={nowX} y={0} width={100 - nowX} height={height} />
          </clipPath>
        </defs>

        {svgContent?.({ pastClip, futureClip })}

        <line
          x1={nowX} y1={0} x2={nowX} y2={height}
          stroke="#475569"
          strokeWidth="1"
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <span
        className="absolute w-2 h-2 rounded-full bg-slate-300 ring-2 ring-slate-800 pointer-events-none"
        style={{ left: `${nowX}%`, top: nowY, transform: 'translate(-50%, -50%)' }}
      />

      {children}
    </div>
  );
}
