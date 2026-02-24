import { defineField, defineType } from "sanity";

export const rentalItem = defineType({
  name: "rentalItem",
  title: "Rental Item",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Name",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "category",
      title: "Category",
      type: "string",
      options: {
        list: [
          { title: "Lighting", value: "lighting" },
          { title: "Audio", value: "audio" },
          { title: "Video", value: "video" },
          { title: "SFX", value: "sfx" },
          { title: "Lasers", value: "lasers" },
          { title: "Rigging", value: "rigging" },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Image",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "dailyRate",
      title: "Daily Rate ($)",
      type: "number",
    }),
    defineField({
      name: "brand",
      title: "Brand",
      type: "string",
    }),
    defineField({
      name: "specs",
      title: "Key Specs",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "available",
      title: "Available",
      type: "boolean",
      initialValue: true,
    }),
  ],
  orderings: [
    {
      title: "Category",
      name: "categoryAsc",
      by: [{ field: "category", direction: "asc" }],
    },
    {
      title: "Name",
      name: "nameAsc",
      by: [{ field: "name", direction: "asc" }],
    },
  ],
  preview: {
    select: {
      title: "name",
      category: "category",
      rate: "dailyRate",
      media: "image",
    },
    prepare({ title, category, rate, media }) {
      return {
        title,
        subtitle: `${category || "Uncategorized"}${rate ? ` — $${rate}/day` : ""}`,
        media,
      };
    },
  },
});
