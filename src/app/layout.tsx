import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Hot Beam Productions | High-Power Lasers & Touring Production",
  description:
    "High-power lasers and touring-grade production. Audio, lighting, video, SFX. Based in Colorado, deployed nationwide.",
  keywords: [
    "laser production",
    "event production",
    "touring production",
    "Colorado",
    "audio",
    "lighting",
    "video",
    "lasers",
    "SFX",
    "gear rental",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground font-mono">
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
