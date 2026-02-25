import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: {
    default:
      "Hot Beam Productions | Denver Event Production — Audio, Lasers, Lighting, Video",
    template: "%s | Hot Beam Productions",
  },
  description:
    "Denver-based live event production company. Touring-grade audio, intelligent lighting, LED walls, FDA-registered laser systems, and SFX. Front Range and nationwide.",
  keywords: [
    "event production Denver",
    "laser show Colorado",
    "live event production",
    "audio visual Denver",
    "stage lighting rental",
    "CO2 cryo jet rental",
    "LED wall rental Denver",
    "concert production Colorado",
  ],
  openGraph: {
    siteName: "Hot Beam Productions",
    locale: "en_US",
    type: "website",
  },
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Hot Beam Productions",
  url: "https://hotbeamproductions.com",
  telephone: "+13035551234",
  email: "info@hotbeamproductions.com",
  description:
    "Full-service live event production company based in Denver, Colorado. Audio, lighting, video, laser systems, and special effects for concerts, festivals, corporate events, and private shows.",
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
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Audio Production" },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Lighting Design & Programming",
        },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "LED Video Walls" },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Laser Show Production" },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Special Effects — CO2, Haze, Confetti",
        },
      },
      {
        "@type": "Offer",
        itemOffered: { "@type": "Service", name: "Gear Rental" },
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessSchema),
          }}
        />
      </head>
      <body className="antialiased bg-background text-foreground font-mono">
        <Navbar />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
