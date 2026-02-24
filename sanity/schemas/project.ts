import { defineField, defineType } from "sanity";

export const project = defineType({
  name: "project",
  title: "Project",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "mainImage",
      title: "Main Image",
      type: "image",
      options: { hotspot: true },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "gallery",
      title: "Gallery",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "client",
      title: "Client Name",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 4,
    }),
    defineField({
      name: "services",
      title: "Service Tags",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "Audio", value: "audio" },
          { title: "Lighting", value: "lighting" },
          { title: "Video", value: "video" },
          { title: "Lasers", value: "lasers" },
          { title: "SFX", value: "sfx" },
        ],
      },
    }),
    defineField({
      name: "date",
      title: "Event Date",
      type: "date",
    }),
    defineField({
      name: "featured",
      title: "Featured Project",
      type: "boolean",
      initialValue: false,
    }),
  ],
  orderings: [
    {
      title: "Event Date, Newest",
      name: "dateDesc",
      by: [{ field: "date", direction: "desc" }],
    },
  ],
  preview: {
    select: {
      title: "title",
      client: "client",
      media: "mainImage",
    },
    prepare({ title, client, media }) {
      return {
        title,
        subtitle: client ? `Client: ${client}` : "",
        media,
      };
    },
  },
});
