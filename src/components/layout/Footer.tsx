import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const footerNav: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: 'Explore',
    links: [
      { label: 'Home', href: '/' },
      { label: 'Tools', href: '/tools' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Privacy', href: '/privacy' },
      { label: 'Terms', href: '/terms' },
    ],
  },
];

const Footer = () => {
  return (
    <footer className="w-full bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant/20 mt-auto pb-20 md:pb-0">
      <div className="max-w-container-max mx-auto px-gutter py-stack-lg font-body-base text-body-base">
        <div className="flex flex-col gap-stack-lg md:flex-row md:justify-between md:gap-stack-md">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="flex items-center gap-2 mb-3">
              <Image src="/logo-v2.png" alt="Logo" width={32} height={30} className="object-contain" />
              <div className="font-sans text-2xl font-black tracking-tighter leading-none text-white">
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ai</span>toolresearch
              </div>
            </div>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              A human-curated dictionary of open-source AI tools. Curated excellence over automated noise.
            </p>
          </div>

          {/* Link columns */}
          <nav
            aria-label="Footer"
            className="grid grid-cols-2 gap-x-8 gap-y-stack-md sm:gap-x-16"
          >
            {footerNav.map((section: any) => (
              <div key={section.heading}>
                <h2 className="text-on-surface text-xs font-semibold uppercase tracking-wider mb-3">
                  {section.heading}
                </h2>
                <ul className="flex flex-col gap-2">
                  {section.links.map((link: any) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-on-surface-variant text-sm hover:text-primary transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-stack-lg pt-stack-md border-t border-outline-variant/10">
          <p className="text-on-surface-variant text-sm text-center md:text-left">
            © 2026 AI Tool Research. Curated Excellence.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
