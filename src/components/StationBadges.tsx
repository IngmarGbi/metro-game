import { lineColor } from "@/data/lineColors";

export default function StationBadges({ lines }: { lines: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5 justify-center">
      {lines.map((line) => (
        <span
          key={line}
          className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-black/80 shadow"
          style={{ backgroundColor: lineColor(line) }}
        >
          {line}
        </span>
      ))}
    </div>
  );
}
