import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Hot Beam Productions | Denver Event Production",
  description:
    "Denver's premier event production company. Audio, lighting, video, lasers, and SFX for unforgettable experiences.",
  keywords: [
    "event production",
    "Denver",
    "audio",
    "lighting",
    "video",
    "lasers",
    "SFX",
    "stage production",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
