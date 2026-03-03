"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { href: "/",         label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/orders",   label: "Orders" },
  { href: "/seller",   label: "Seller" },
];

export default function MobileMenu() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        type="button"
        onClick={() => setMenuOpen((o) => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-xl hover:bg-amber-100 text-stone-700 transition-colors duration-150"
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <Image src="/hamburger.svg" alt="Hamburger" width={25} height={25} />
        )}
      </button>

      {/* Dropdown — always rendered, animated via classes */}
      <div
        className={`absolute top-16 left-0 right-0 border-t border-amber-100 bg-amber-50 px-4 pb-4 pt-2 space-y-1 shadow-md
          transition-all duration-300 ease-in-out origin-top
          ${menuOpen
            ? "opacity-100 scale-y-100 translate-y-0 pointer-events-auto"
            : "opacity-0 scale-y-95 -translate-y-2 pointer-events-none"
          }`}
      >
        {navLinks.map(({ href, label }, i) => (
          <Link
            key={href}
            href={href}
            onClick={() => setMenuOpen(false)}
            className={`block text-right px-4 py-2.5 rounded-xl text-sm font-medium text-stone-700
              hover:bg-amber-100 hover:text-stone-900 transition-all duration-200
              ${menuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}
            `}
            style={{ transitionDelay: menuOpen ? `${i * 50}ms` : "0ms" }}
          >
            {label}
          </Link>
        ))}

       
      </div>
    </div>
  );
}