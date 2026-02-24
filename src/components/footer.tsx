import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/logo.png"
              alt="Hot Beam Productions"
              width={200}
              height={55}
              className="h-12 w-auto"
            />
            <p className="mt-4 text-muted text-sm max-w-sm leading-relaxed">
              Denver&apos;s premier event production company. We bring your
              vision to life with cutting-edge audio, lighting, video, lasers,
              and SFX.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-4">
              Navigate
            </h4>
            <ul className="space-y-2">
              {["Work", "Rentals", "About", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-muted hover:text-foreground transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-heading text-lg tracking-wider uppercase text-foreground mb-4">
              Services
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>Audio Production</li>
              <li>Lighting Design</li>
              <li>Video &amp; LED</li>
              <li>Lasers &amp; SFX</li>
              <li>Gear Rentals</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted">
            &copy; {new Date().getFullYear()} Hot Beam Productions. All rights
            reserved.
          </p>
          <p className="text-xs text-muted">Denver, Colorado</p>
        </div>
      </div>
    </footer>
  );
}
