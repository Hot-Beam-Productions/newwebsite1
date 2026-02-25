import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { MediaPlaceholder } from "@/components/media-placeholder";
import rentals from "@/data/rentals.json";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return rentals.map((r) => ({ id: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const item = rentals.find((r) => r.id === id);
  if (!item) return { title: "Not Found" };
  return {
    title: `${item.name} Rental | Hot Beam Productions`,
    description: item.description,
    openGraph: {
      title: `${item.name} — ${item.brand}`,
      description: item.description,
      images:
        item.imageUrl && !item.imageUrl.includes("pub-XXXX")
          ? [{ url: item.imageUrl }]
          : [],
    },
  };
}

export default async function RentalDetailPage({ params }: Props) {
  const { id } = await params;
  const item = rentals.find((r) => r.id === id);
  if (!item) notFound();

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <Link
          href="/rentals"
          className="inline-flex items-center gap-2 mono-label !text-muted hover:!text-laser-cyan transition-colors mb-10"
        >
          <ArrowLeft className="w-3 h-3" />
          All Inventory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="rounded-lg overflow-hidden">
            {item.imageUrl && !item.imageUrl.includes("pub-XXXX") ? (
              <div className="relative aspect-square w-full">
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <MediaPlaceholder label="Product photo / 3D render" aspect="square" />
            )}
          </div>

          {/* Info */}
          <div>
            <p className="mono-label text-laser-cyan mb-2">{item.brand}</p>
            <h1 className="font-heading text-5xl tracking-wide text-foreground leading-tight mb-4">
              {item.name}
            </h1>
            <p className="text-muted text-sm leading-relaxed mb-6">{item.description}</p>

            {/* Availability */}
            <div className="flex items-center gap-2 mb-6">
              {item.available ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                  <span className="mono-label !text-green-400">Available for Rent</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-muted" />
                  <span className="mono-label !text-muted">Check Availability</span>
                </>
              )}
            </div>

            {/* Specs */}
            {item.specs && item.specs.length > 0 && (
              <div className="mb-6">
                <p className="mono-label !text-foreground mb-3">Key Specs</p>
                <div className="space-y-2">
                  {item.specs.map((spec) => (
                    <div key={spec} className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-laser-cyan" />
                      <span className="text-xs text-muted">{spec}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rate + CTA */}
            <div className="border-t border-border pt-6 mt-6">
              {item.dailyRate ? (
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="font-heading text-5xl gradient-text">
                    ${item.dailyRate}
                  </span>
                  <span className="text-muted text-sm">/ day</span>
                </div>
              ) : (
                <p className="text-sm text-muted mb-4">Contact us for pricing</p>
              )}
              <GlowButton href="/contact" variant="primary">
                Inquire About This Piece
              </GlowButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
