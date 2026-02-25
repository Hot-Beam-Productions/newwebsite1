interface MediaPlaceholderProps {
  label?: string;
  aspect?: "video" | "square" | "portrait" | "wide";
  className?: string;
}

const aspectMap = {
  video: "aspect-video",
  square: "aspect-square",
  portrait: "aspect-[3/4]",
  wide: "aspect-[16/6]",
};

export function MediaPlaceholder({
  label = "Image",
  aspect = "video",
  className = "",
}: MediaPlaceholderProps) {
  return (
    <div
      className={`relative w-full ${aspectMap[aspect]} bg-surface flex items-center justify-center ${className}`}
      aria-label={`${label} placeholder`}
    >
      {/* Grid lines */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,245,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      {/* Dashed border */}
      <div className="absolute inset-3 border border-dashed border-laser-cyan/30 rounded" />
      {/* Center label */}
      <div className="relative z-10 text-center">
        <div className="w-10 h-10 mx-auto rounded border border-laser-cyan/30 flex items-center justify-center mb-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            className="text-laser-cyan/50"
          >
            <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1" />
            <circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1" />
            <path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mono-label !text-laser-cyan/40">{label}</p>
      </div>
    </div>
  );
}
