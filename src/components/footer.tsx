import Link from "next/link";
import Image from "next/image";
import { brand, footer, navigation } from "@/lib/site-data";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image
              src="/logo-icon.png"
              alt={brand.name}
              width={48}
              height={41}
              className="h-10 w-auto"
            />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
              {footer.description}
            </p>
            <div className="mt-5 space-y-1 text-xs text-muted-light">
              <p>{brand.location}</p>
              <a href={`mailto:${brand.email}`} className="hover:text-foreground transition-colors">
                {brand.email}
              </a>
              <a href={`tel:${brand.phoneHref}`} className="block hover:text-foreground transition-colors">
                {brand.phoneDisplay}
              </a>
            </div>
          </div>

          <div>
            <h4 className="mono-label mb-4 !text-foreground">Navigation</h4>
            <ul className="space-y-2">
              {navigation
                .filter((item) => item.href !== "/")
                .map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-sm text-muted hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <h4 className="mono-label mb-4 !text-foreground">Departments</h4>
            <ul className="space-y-2 text-sm text-muted">
              {footer.departments.map((department) => (
                <li key={department}>{department}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 md:flex-row md:items-center">
          <p className="mono-label text-[10px] !text-muted">
            &copy; {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <a
            href={brand.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-label text-[10px] !text-muted transition-colors hover:!text-laser-cyan"
          >
            {brand.instagramHandle}
          </a>
        </div>
      </div>
    </footer>
  );
}
