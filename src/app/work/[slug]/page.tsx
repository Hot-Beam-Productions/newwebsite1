import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import portfolio from "@/data/portfolio.json";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return portfolio.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = portfolio.find((p) => p.slug === slug);
  if (!project) return { title: "Not Found" };
  return {
    title: `${project.title} | Hot Beam Productions`,
    description: project.description,
    openGraph: {
      title: project.title,
      description: project.description,
      images: project.mainImageUrl ? [{ url: project.mainImageUrl }] : [],
    },
  };
}

const serviceColors: Record<string, string> = {
  audio: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  lighting: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  video: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  lasers: "bg-laser-cyan/15 text-laser-cyan border-laser-cyan/20",
  sfx: "bg-green-500/15 text-green-400 border-green-500/20",
};

export default async function WorkProjectPage({ params }: Props) {
  const { slug } = await params;
  const project = portfolio.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/work"
          className="inline-flex items-center gap-2 mono-label !text-muted hover:!text-laser-cyan transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" />
          All Work
        </Link>

        {/* Header */}
        <div className="mb-8">
          <p className="mono-label text-laser-cyan mb-3">{project.client}</p>
          <h1 className="font-heading text-6xl md:text-8xl tracking-wide text-foreground leading-none">
            {project.title}
          </h1>
          <div className="flex flex-wrap gap-2 mt-6">
            {project.services.map((s) => (
              <span
                key={s}
                className={`text-xs px-3 py-1 rounded border ${serviceColors[s] ?? "bg-white/10 text-white/60 border-white/10"}`}
              >
                {s}
              </span>
            ))}
            {project.eventDate && (
              <span className="text-xs px-3 py-1 rounded border border-border text-muted">
                {new Date(project.eventDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                })}
              </span>
            )}
          </div>
        </div>

        {/* Hero image */}
        <div className="rounded-lg overflow-hidden mb-12">
          {project.mainImageUrl && !project.mainImageUrl.includes("pub-XXXX") ? (
            <div className="relative aspect-video w-full">
              <Image
                src={project.mainImageUrl}
                alt={project.title}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <MediaPlaceholder label="Hero photo / Stage render" aspect="video" />
          )}
        </div>

        {/* Body copy */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
          <div className="lg:col-span-2 space-y-4 text-muted leading-relaxed text-sm">
            <p>{project.longDescription}</p>
          </div>
          <div className="space-y-6">
            <div className="p-5 rounded-lg bg-surface border border-border">
              <p className="mono-label !text-foreground mb-3">Event Details</p>
              <dl className="space-y-2 text-xs text-muted">
                <div className="flex justify-between">
                  <dt>Client</dt>
                  <dd className="text-foreground">{project.client}</dd>
                </div>
                {project.eventDate && (
                  <div className="flex justify-between">
                    <dt>Date</dt>
                    <dd className="text-foreground">
                      {new Date(project.eventDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt>Departments</dt>
                  <dd className="text-foreground capitalize">
                    {project.services.join(", ")}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Gallery */}
        {project.gallery && project.gallery.length > 0 && (
          <div className="mb-16">
            <p className="mono-label !text-foreground mb-6">Gallery</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {project.gallery.map((url, i) => (
                <div key={i} className="rounded-lg overflow-hidden">
                  {!url.includes("pub-XXXX") ? (
                    <div className="relative aspect-video w-full">
                      <Image src={url} alt={`${project.title} ${i + 1}`} fill className="object-cover" />
                    </div>
                  ) : (
                    <MediaPlaceholder label="Gallery photo / BTS rigging" aspect="video" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="border-t border-border pt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-heading text-3xl tracking-wider text-foreground">
              Book This Package
            </h3>
            <p className="text-muted text-sm mt-1">
              Tell us your event specs. We&apos;ll tell you what&apos;s possible.
            </p>
          </div>
          <GlowButton href="/contact" variant="primary">
            Request a Quote
          </GlowButton>
        </div>
      </div>
    </div>
  );
}
