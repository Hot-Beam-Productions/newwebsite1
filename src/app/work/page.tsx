"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { ArrowUpRight } from "lucide-react";

// Placeholder projects — will be replaced with Sanity data once connected
const placeholderProjects = [
  {
    _id: "1",
    title: "Red Rocks Amphitheatre",
    client: "Live Nation",
    services: ["lighting", "lasers", "sfx"],
    slug: { current: "red-rocks" },
    mainImage: null,
  },
  {
    _id: "2",
    title: "Denver Tech Summit",
    client: "TechStars",
    services: ["audio", "video", "lighting"],
    slug: { current: "denver-tech-summit" },
    mainImage: null,
  },
  {
    _id: "3",
    title: "Mountain Music Festival",
    client: "Colorado Events Co",
    services: ["audio", "lighting", "lasers", "sfx"],
    slug: { current: "mountain-music-fest" },
    mainImage: null,
  },
  {
    _id: "4",
    title: "Corporate Gala 2024",
    client: "Deloitte",
    services: ["lighting", "video", "audio"],
    slug: { current: "corporate-gala" },
    mainImage: null,
  },
  {
    _id: "5",
    title: "Neon Nights Festival",
    client: "AEG Presents",
    services: ["lasers", "sfx", "lighting"],
    slug: { current: "neon-nights" },
    mainImage: null,
  },
  {
    _id: "6",
    title: "Product Launch — EcoTech",
    client: "EcoTech Inc",
    services: ["video", "lighting", "audio"],
    slug: { current: "ecotech-launch" },
    mainImage: null,
  },
];

const serviceColors: Record<string, string> = {
  audio: "bg-blue-500/20 text-blue-400",
  lighting: "bg-yellow-500/20 text-yellow-400",
  video: "bg-purple-500/20 text-purple-400",
  lasers: "bg-red-500/20 text-red-400",
  sfx: "bg-green-500/20 text-green-400",
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

export default function WorkPage() {
  const projects = placeholderProjects;

  return (
    <div className="pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title="Our Work"
          subtitle="A selection of events and productions we've brought to life across Colorado and beyond."
        />

        {/* Masonry-style grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6"
        >
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              variants={itemVariants}
              className="break-inside-avoid group"
            >
              <Link
                href={`/work/${project.slug.current}`}
                className="block relative rounded-lg overflow-hidden bg-surface border border-border hover:border-laser-cyan/30 transition-all duration-500"
              >
                {/* Image placeholder */}
                <div
                  className="relative w-full bg-surface-light"
                  style={{
                    height: `${250 + (index % 3) * 80}px`,
                  }}
                >
                  {project.mainImage ? (
                    <Image
                      src="/placeholder.jpg"
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-16 h-16 mx-auto rounded-full bg-laser-cyan/10 flex items-center justify-center mb-3">
                          <span className="font-heading text-2xl text-laser-cyan">
                            {project.title[0]}
                          </span>
                        </div>
                        <p className="text-xs text-muted">
                          Upload via Sanity Studio
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-end p-6">
                    <ArrowUpRight className="absolute top-4 right-4 w-5 h-5 text-white" />
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
                    {project.services?.map((service) => (
                      <span
                        key={service}
                        className={`text-xs px-2 py-1 rounded ${serviceColors[service] || "bg-white/10 text-white/60"}`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
