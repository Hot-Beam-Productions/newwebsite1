import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { getPublicSiteData } from "@/lib/public-site-data";

export default async function PublicLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const { brand, footer, navigation } = await getPublicSiteData();

  return (
    <>
      <Navbar brand={brand} navigation={navigation} />
      <main id="main-content" className="min-h-screen">
        {children}
      </main>
      <Footer brand={brand} footer={footer} navigation={navigation} />
    </>
  );
}
