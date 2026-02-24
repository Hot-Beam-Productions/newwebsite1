import { defineField, defineType } from "sanity";

export const homePage = defineType({
  name: "homePage",
  title: "Home Page",
  type: "document",
  fields: [
    defineField({
      name: "heroHeadline",
      title: "Hero Headline",
      type: "string",
      initialValue: "Experience the Art of Illumination",
    }),
    defineField({
      name: "heroSubheadline",
      title: "Hero Subheadline",
      type: "string",
      initialValue:
        "Denver's premier event production company. Audio. Lighting. Video. Lasers. SFX.",
    }),
    defineField({
      name: "heroVideo",
      title: "Hero Background Video",
      type: "file",
      options: { accept: "video/*" },
    }),
    defineField({
      name: "heroImage",
      title: "Hero Fallback Image",
      type: "image",
      description: "Shown while video loads or on mobile",
      options: { hotspot: true },
    }),
    defineField({
      name: "servicesHeading",
      title: "Services Section Heading",
      type: "string",
      initialValue: "What We Do",
    }),
    defineField({
      name: "aboutSnippet",
      title: "About Snippet (Home Page)",
      type: "text",
      rows: 3,
    }),
  ],
  preview: {
    prepare() {
      return { title: "Home Page" };
    },
  },
});
