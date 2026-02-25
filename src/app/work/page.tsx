import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import { MediaPlaceholder } from "@/components/media-placeholder";
import portfolio from "@/data/portfolio.json";

export const metadata: Metadata = {
  title: "Our Work | Hot Beam Productions",
  description:
    "Event production portfolio — lasers, lighting, audio, video, and SFX. Red Rocks, corporate galas, outdoor festivals, and product launches across Colorado and the US.",
};

const serviceColors: Record<string, string> = {
  audio: "bg-blue-500/15 text-blue-400",
  lighting: "bg-yellow-500/15 text-yellow-400",
  video: "bg-purple-500/15 text-purple-400",
  lasers: "bg-laser-cyan/15 text-laser-cyan",
  sfx: "bg-green-500/15 text-green-400",
};

export default function WorkPage() {
  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Portfolio"
          title="Our Work"
          subtitle="Selected productions across Colorado and nationally. Every project started with a rider and ended with a run-of-show."
        />

        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {portfolio.map((project, index) => (
            <div key={project.id} className="break-inside-avoid group">
              <Link
                href={`/work/${project.slug}`}
                className="block relative rounded-lg overflow-hidden bg-surface border border-border hover:border-laser-cyan/30 transition-all duration-500"
                aria-label={`View ${project.title} project details`}
              >
                {/* Image */}
                <div
                  className="relative w-full bg-surface-light overflow-hidden"
                  style={{ height: `${250 + (index % 3) * 80}px` }}
                >
                  {project.mainImageUrl && !project.mainImageUrl.includes("pub-XXXX") ? (
                    <Image
                      src={project.mainImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <MediaPlaceholder
                      label="Stage photo / 3D render"
                      aspect="video"
                      className="!aspect-auto h-full"
                    />
                  )}
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <ArrowUpRight
                      className="absolute top-4 right-4 w-5 h-5 text-white"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="font-heading text-xl tracking-wider uppercase text-foreground group-hover:text-laser-cyan transition-colors">
                    {project.title}
                  </h3>
                  {project.client && (
                    <p className="text-sm text-muted mt-1">{project.client}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {project.services.map((service) => (
                      <span
                        key={service}
                        className={`text-xs px-2 py-1 rounded capitalize ${serviceColors[service] ?? "bg-white/10 text-white/60"}`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
