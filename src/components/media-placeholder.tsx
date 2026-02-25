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
      className={`relative flex w-full items-center justify-center bg-surface ${aspectMap[aspect]} ${className}`}
      aria-label={`${label} placeholder`}
    >
      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(46,99,255,0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(46,99,255,0.28) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <div className="absolute inset-4 border border-dashed border-laser-cyan/35" />
      <div className="relative z-10 text-center">
        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center border border-laser-cyan/35 bg-laser-cyan/10">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-laser-cyan/70">
            <rect x="1" y="3" width="14" height="10" rx="1" stroke="currentColor" strokeWidth="1" />
            <circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1" />
            <path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="mono-label !text-laser-cyan/55">{label}</p>
      </div>
    </div>
  );
}
