import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t border-border bg-[#030303]">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <Image
              src="/logo.png"
              alt="Hot Beam Productions"
              width={160}
              height={44}
              className="h-8 w-auto"
            />
            <p className="mt-4 text-muted text-xs max-w-sm leading-relaxed">
              High-power lasers, touring-grade audio, lighting, and video
              production. We load in, we build the show, we make it hit. Based
              in Colorado, deployed nationwide.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="mono-label !text-foreground mb-4">Navigate</h4>
            <ul className="space-y-2">
              {[
                { label: "Work", href: "/work" },
                { label: "Inventory", href: "/rentals" },
                { label: "About", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-xs text-muted hover:text-laser-red transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="mono-label !text-foreground mb-4">Departments</h4>
            <ul className="space-y-2 text-xs text-muted">
              <li>Lasers</li>
              <li>Lighting</li>
              <li>Audio</li>
              <li>Video / LED</li>
              <li>SFX</li>
              <li>Gear Rentals</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] text-muted tracking-wider uppercase">
            &copy; {new Date().getFullYear()} Hot Beam Productions. All rights
            reserved.
          </p>
          <p className="text-[10px] text-muted tracking-wider uppercase">
            Colorado, USA
          </p>
        </div>
      </div>
    </footer>
  );
}
