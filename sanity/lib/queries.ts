import { client } from "./client";

// Projects
export async function getProjects() {
  return client.fetch(
    `*[_type == "project"] | order(date desc) {
      _id,
      title,
      slug,
      mainImage,
      client,
      description,
      services,
      date,
      featured
    }`
  );
}

export async function getFeaturedProjects() {
  return client.fetch(
    `*[_type == "project" && featured == true] | order(date desc) [0...6] {
      _id,
      title,
      slug,
      mainImage,
      client,
      services
    }`
  );
}

export async function getProjectBySlug(slug: string) {
  return client.fetch(
    `*[_type == "project" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      mainImage,
      gallery,
      client,
      description,
      services,
      date
    }`,
    { slug }
  );
}

// Rentals
export async function getRentals() {
  return client.fetch(
    `*[_type == "rentalItem" && available == true] | order(category asc, name asc) {
      _id,
      name,
      slug,
      category,
      image,
      description,
      dailyRate,
      brand,
      specs
    }`
  );
}

export async function getRentalsByCategory(category: string) {
  return client.fetch(
    `*[_type == "rentalItem" && category == $category && available == true] | order(name asc) {
      _id,
      name,
      slug,
      category,
      image,
      description,
      dailyRate,
      brand,
      specs
    }`,
    { category }
  );
}

// Home Page
export async function getHomePage() {
  return client.fetch(
    `*[_type == "homePage"][0] {
      heroHeadline,
      heroSubheadline,
      "heroVideoUrl": heroVideo.asset->url,
      heroImage,
      servicesHeading,
      aboutSnippet
    }`
  );
}
