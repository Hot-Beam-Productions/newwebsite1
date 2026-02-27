import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";
import type { BrandData } from "@/lib/types";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
}

async function getInstagramPosts(): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const response = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink&limit=3&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );

    if (!response.ok) return [];

    const data = (await response.json()) as { data?: InstagramPost[] };
    return data.data ?? [];
  } catch {
    return [];
  }
}

interface InstagramFeedProps {
  brand: BrandData;
}

export async function InstagramFeed({ brand }: InstagramFeedProps) {
  const posts = await getInstagramPosts();

  return (
    <section className="px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <SectionHeading
          label="Live Feed"
          title={brand.instagramHandle}
          subtitle="On-site moments, rig builds, and show-night snapshots from current deployments."
        />

        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {posts.map((post) => {
              const imageUrl = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
              if (!imageUrl) return null;

              return (
                <Link
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative aspect-[4/5] overflow-hidden border border-border bg-surface transition-colors hover:border-laser-cyan/40"
                  aria-label={post.caption ? post.caption.slice(0, 80) : "Open Instagram post"}
                >
                  <Image
                    src={imageUrl}
                    alt={post.caption ? post.caption.slice(0, 100) : "Instagram post"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/50">
                    <Instagram className="h-7 w-7 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="border border-border bg-surface p-8 text-center md:p-10">
            <Instagram className="mx-auto h-8 w-8 text-laser-cyan" aria-hidden="true" />
            <p className="mt-4 text-sm text-muted">Instagram posts are loading from our profile.</p>
            <p className="mt-2 text-sm text-muted-light">
              Tap below to view the latest content directly on Instagram.
            </p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            href={brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-label inline-flex items-center gap-2 !text-laser-cyan transition-colors hover:!text-laser-cyan-dim"
          >
            <Instagram className="h-4 w-4" />
            Follow updates
          </Link>
        </div>
      </div>
    </section>
  );
}
