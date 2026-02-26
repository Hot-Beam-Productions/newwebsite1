import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { GlowButton } from "@/components/glow-button";
import { SectionHeading } from "@/components/section-heading";
import { HeroBeams } from "@/components/hero-animations";
import { InstagramFeed } from "@/components/instagram-feed";
import { MediaPlaceholder } from "@/components/media-placeholder";
import { ServicesAccordion } from "@/components/services-accordion";
import { home, work } from "@/lib/site-data";

const featuredProjects = work.projects.filter((project) => project.featured).slice(0, 3);

export default function Home() {
  return (
    <>
      <section className="relative flex min-h-screen items-center justify-center overflow-clip px-6 pb-20 pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(46,99,255,0.22),transparent_44%),radial-gradient(circle_at_80%_80%,rgba(208,164,88,0.16),transparent_36%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/85 to-background" />
        <HeroBeams />

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <p className="mono-label mb-8 !text-laser-cyan">{home.hero.eyebrow}</p>

          <div className="relative mx-auto mt-8 aspect-video w-full max-w-4xl overflow-hidden border border-border/80 bg-surface">
            <video className="h-full w-full object-cover opacity-35" autoPlay loop muted playsInline>
              <source src="/sae%20proppa%20odd%20mob%202.mov" type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <Image
                src="/logo.png"
                alt=""
                width={320}
                height={320}
                className="h-auto w-[clamp(9rem,20vw,20rem)] opacity-70"
                priority
              />
            </div>
          </div>

          <h1 className="mx-auto mt-6 max-w-4xl font-heading text-4xl leading-tight tracking-tight text-foreground md:text-6xl">
            {home.hero.headline}
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-base leading-relaxed text-muted-light md:text-lg">
            {home.hero.subheadline}
          </p>

          <p className="mt-6 font-heading text-xl tracking-[0.2em] text-foreground/82 uppercase md:text-2xl">
            {home.hero.departmentLine}
          </p>

          <p className="mx-auto mt-7 max-w-3xl text-base leading-relaxed text-muted md:text-lg">
            {home.hero.description}
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <GlowButton href={home.hero.primaryCta.href} variant="primary">
              {home.hero.primaryCta.label}
              <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
            </GlowButton>
            <GlowButton href={home.hero.secondaryCta.href} variant="outline">
              {home.hero.secondaryCta.label}
            </GlowButton>
          </div>

          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-3">
            {home.results.map((item) => (
              <div key={item.label} className="border border-border bg-surface px-5 py-4 text-left">
                <p className="font-heading text-3xl leading-none text-foreground">{item.value}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.14em] text-muted-light">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-16" aria-label="Trust signals">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-3 border border-border bg-surface p-4 md:grid-cols-2 lg:grid-cols-4">
          {home.trustSignals.map((signal) => (
            <p key={signal} className="mono-label !text-muted-light">
              {signal}
            </p>
          ))}
        </div>
      </section>

      <section className="px-6 py-24" aria-labelledby="services-heading">
        <div className="mx-auto max-w-7xl">
          <SectionHeading
            label={home.services.label}
            title={home.services.title}
            subtitle={home.services.subtitle}
          />

          <ServicesAccordion
            items={home.services.items}
            defaultOpenId={home.services.featuredServiceId}
          />
        </div>
      </section>

      <section className="px-6 pb-24" aria-labelledby="featured-work-heading">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="mono-label mb-3 !text-laser-cyan">Featured Work</p>
              <h2 id="featured-work-heading" className="font-heading text-4xl tracking-tight md:text-5xl">
                Recent Deployments
              </h2>
            </div>
            <Link
              href="/work"
              className="mono-label hidden !text-muted-light transition-colors hover:!text-laser-cyan sm:inline-flex"
            >
              View full portfolio
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {featuredProjects.map((project) => (
              <Link
                key={project.id}
                href={`/work/${project.slug}`}
                className="group overflow-hidden border border-border bg-surface transition-all duration-300 hover:border-laser-cyan/45"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-light">
                  {project.mainImageUrl && !project.mainImageUrl.includes("pub-XXXX") ? (
                    <Image
                      src={project.mainImageUrl}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <MediaPlaceholder label="Project media" aspect="video" className="!aspect-auto h-full" />
                  )}
                </div>
                <div className="space-y-2 p-5">
                  <p className="mono-label !text-muted-light">{project.client}</p>
                  <h3 className="font-heading text-2xl tracking-tight text-foreground transition-colors group-hover:text-laser-cyan">
                    {project.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted">{project.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <InstagramFeed />

      <section className="px-6 pb-28 pt-10">
        <div className="mx-auto max-w-4xl border border-border bg-surface px-8 py-12 text-center md:px-12 md:py-16">
          <h2 className="font-heading text-4xl tracking-tight text-foreground md:text-5xl">
            {home.closingCta.title}
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-muted">
            {home.closingCta.description}
          </p>
          <div className="mt-9">
            <GlowButton href={home.closingCta.button.href} variant="primary">
              {home.closingCta.button.label}
              <ArrowRight className="ml-2 inline h-4 w-4" aria-hidden="true" />
            </GlowButton>
          </div>
        </div>
      </section>
    </>
  );
}
