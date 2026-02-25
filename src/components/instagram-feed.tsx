import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import { SectionHeading } from "@/components/section-heading";

interface InstagramPost {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
}

async function getInstagramPosts(): Promise<InstagramPost[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];

  try {
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=9&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    return data.data ?? [];
  } catch {
    return [];
  }
}

export async function InstagramFeed() {
  const posts = await getInstagramPosts();

  if (posts.length === 0) return null;

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Instagram"
          title="@hotbeamproductions"
          subtitle="Behind the scenes, on the road, and in the rig. Follow along."
        />

        <div className="grid grid-cols-3 gap-1 md:gap-2">
          {posts.map((post) => {
            const imageUrl =
              post.media_type === "VIDEO"
                ? post.thumbnail_url
                : post.media_url;
            if (!imageUrl) return null;

            return (
              <Link
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative aspect-square overflow-hidden bg-surface"
                aria-label={
                  post.caption
                    ? post.caption.slice(0, 80)
                    : "View on Instagram"
                }
              >
                <Image
                  src={imageUrl}
                  alt={
                    post.caption
                      ? post.caption.slice(0, 100)
                      : "Instagram post"
                  }
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 33vw, (max-width: 1280px) 25vw, 400px"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-all duration-300 flex items-center justify-center p-4">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                    <Instagram className="w-6 h-6 text-laser-cyan mx-auto mb-2" />
                    {post.caption && (
                      <p className="text-white text-xs leading-relaxed line-clamp-4">
                        {post.caption}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="https://www.instagram.com/hotbeamproductions/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-laser-cyan hover:text-laser-cyan/70 transition-colors text-sm tracking-wider uppercase font-mono"
          >
            <Instagram className="w-4 h-4" />
            Follow on Instagram
          </Link>
        </div>
      </div>
    </section>
  );
}
