import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, CircleAlert } from "lucide-react";
import { CmsImage } from "@/components/cms-image";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { getPublicSiteData } from "@/lib/public-site-data";
import { isPublishedMediaUrl, stripMediaUrlDecorators } from "@/lib/media-url";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const { rentals } = await getPublicSiteData();
  const item = rentals.items.find((entry) => entry.id === id);

  if (!item) return { title: "Not Found" };

  return {
    title: `${item.name} Rental`,
    description: item.description,
    openGraph: {
      title: `${item.name} | ${item.brand}`,
      description: item.description,
      images:
        isPublishedMediaUrl(item.imageUrl)
          ? [{ url: stripMediaUrlDecorators(item.imageUrl) }]
          : [],
    },
  };
}

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;
  const { rentals } = await getPublicSiteData();
  const item = rentals.items.find((entry) => entry.id === id);
  if (!item) notFound();

  const relatedItems = rentals.items.filter((entry) => item.frequentlyRentedTogether?.includes(entry.id));

  return (
    <div className="px-6 pb-24 pt-28 md:pt-32">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/rentals"
          className="mono-label mb-10 inline-flex items-center gap-2 !text-muted transition-colors hover:!text-laser-cyan"
        >
          <ArrowLeft className="h-3 w-3" />
          Back to inventory
        </Link>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div className="overflow-hidden border border-border bg-surface">
            {isPublishedMediaUrl(item.imageUrl) ? (
              <div className="relative aspect-square w-full">
                <CmsImage
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <MediaPlaceholder label="Inventory image" aspect="square" />
            )}
          </div>

          <article>
            <p className="mono-label !text-laser-cyan">{item.brand}</p>
            <h1 className="mt-2 font-heading text-5xl leading-[0.95] tracking-tight text-foreground md:text-6xl">
              {item.name}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-muted">{item.description}</p>

            <div className="mt-6 flex items-center gap-2 text-sm">
              {item.available ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" aria-hidden="true" />
                  <span className="mono-label !text-emerald-300">Available for current dates</span>
                </>
              ) : (
                <>
                  <CircleAlert className="h-4 w-4 text-amber-200" aria-hidden="true" />
                  <span className="mono-label !text-amber-200">Check availability</span>
                </>
              )}
            </div>

            {item.specs.length > 0 && (
              <section className="mt-7 border border-border bg-surface p-5">
                <p className="mono-label mb-3 !text-foreground">Key Specs</p>
                <ul className="space-y-2">
                  {item.specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2 text-sm text-muted-light">
                      <span className="mt-2 inline-block h-1.5 w-1.5 rounded-full bg-laser-cyan" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {relatedItems.length > 0 && (
              <section className="mt-7 border border-border bg-surface p-5">
                <p className="mono-label mb-3 !text-foreground">Frequently Rented Together</p>
                <ul className="space-y-2">
                  {relatedItems.map((related) => (
                    <li key={related.id}>
                      <Link className="text-sm text-laser-cyan hover:underline" href={`/rentals/${related.id}`}>
                        {related.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <div className="mt-7 border-t border-border pt-6">
              <GlowButton href="/contact" variant="primary">
                Inquire About This Unit
              </GlowButton>
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}
