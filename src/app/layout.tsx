import type { Metadata } from "next";
import { JetBrains_Mono, Manrope, Sora } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { brand, home, seo } from "@/lib/site-data";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700", "800"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: seo.defaultTitle,
    template: seo.titleTemplate,
  },
  description: seo.description,
  keywords: seo.keywords,
  openGraph: {
    siteName: brand.name,
    locale: "en_US",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: brand.name,
  url: brand.url,
  telephone: brand.phoneHref,
  email: brand.email,
  description: seo.description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Denver",
    addressRegion: "CO",
    addressCountry: "US",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: "39.7392",
    longitude: "-104.9903",
  },
  areaServed: [
    { "@type": "State", name: "Colorado" },
    { "@type": "Country", name: "United States" },
  ],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Event Production Services",
    itemListElement: home.services.items.map((item) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: item.title },
    })),
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </head>
      <body
        className={`${sora.variable} ${manrope.variable} ${jetbrainsMono.variable} antialiased bg-background text-foreground`}
      >
        <Navbar />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
