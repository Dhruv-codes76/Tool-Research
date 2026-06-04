import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="w-full bg-surface-container-lowest dark:bg-surface-container-lowest border-t border-outline-variant/20 mt-auto pb-20 md:pb-0">
      <div className="max-w-container-max mx-auto px-gutter py-stack-lg flex flex-col md:flex-row justify-between items-start gap-stack-md font-body-base text-body-base">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Image src="/logo-v2.png" alt="Logo" width={32} height={30} className="object-contain" />
            <div className="font-sans text-2xl font-black tracking-tighter leading-none text-white">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">ai</span>toolresearch
            </div>
          </div>
          <p className="text-on-surface-variant text-sm">© 2026 AI Tool Research. Curated Excellence.</p>
        </div>
        <div className="flex gap-6">
          <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/about">Mission</Link>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">GitHub</a>
          <a className="text-on-surface-variant hover:text-on-surface transition-colors" href="#">Twitter</a>
          <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/privacy">Privacy</Link>
          <Link className="text-on-surface-variant hover:text-on-surface transition-colors" href="/terms">Terms</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
