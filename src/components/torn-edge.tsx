import { cn } from "@/lib/utils";

// Normalized "how far the panel bleeds" (0 = flush seam, 1 = furthest reach)
// at each step down (vertical) or across (horizontal) the edge. Hand-tuned,
// not random, so the jag is stable across renders.
const WIGGLE = [
  0.3, 0.45, 0.25, 0.6, 0.4, 0.78, 0.5, 0.2, 0.65, 0.35, 0.55, 0.25, 0.72,
  0.4, 0.3, 0.58, 0.2, 0.35,
];

const FLECKS = [
  [0.4, 0.05, 3.2],
  [0.58, 0.11, 2],
  [0.32, 0.17, 2.6],
  [0.68, 0.22, 1.6],
  [0.45, 0.29, 3],
  [0.62, 0.35, 2.2],
  [0.78, 0.31, 1.8],
  [0.38, 0.42, 2.4],
  [0.58, 0.49, 3.4],
  [0.7, 0.55, 1.6],
  [0.42, 0.62, 2],
  [0.6, 0.7, 2.8],
  [0.75, 0.74, 1.6],
  [0.35, 0.79, 2.4],
  [0.5, 0.86, 3],
  [0.65, 0.92, 1.8],
];

interface TornEdgeProps {
  orientation?: "vertical" | "horizontal";
  className?: string;
  fill?: string;
}

export function TornEdge({ orientation = "vertical", className, fill = "var(--background)" }: TornEdgeProps) {
  const steps = WIGGLE.length - 1;
  const points = WIGGLE.map((w, i) => {
    const pos = (i / steps) * 100;
    const reach = w * 60;
    return orientation === "vertical" ? [reach, pos] : [pos, reach];
  });

  const pathD =
    orientation === "vertical"
      ? `M 0,0 L ${points.map(([x, y]) => `${x},${y}`).join(" L ")} L 0,100 Z`
      : `M 0,0 L ${points.map(([x, y]) => `${x},${y}`).join(" L ")} L 100,0 Z`;

  const outlineD = `M ${points.map(([x, y]) => `${x},${y}`).join(" L ")}`;

  return (
    <svg
      className={cn("pointer-events-none absolute", className)}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <path d={pathD} fill={fill} />
      <path d={outlineD} fill="none" stroke="var(--foreground)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      {FLECKS.map(([a, b, r], i) => {
        const [cx, cy] = orientation === "vertical" ? [a * 60 + 10, b * 100] : [b * 100, a * 60 + 10];
        return <circle key={i} cx={cx} cy={cy} r={r} fill={fill} opacity={0.85} />;
      })}
    </svg>
  );
}
