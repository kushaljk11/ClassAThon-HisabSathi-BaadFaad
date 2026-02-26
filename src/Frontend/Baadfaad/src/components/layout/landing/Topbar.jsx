/**
 * @fileoverview Landing Page Top Navigation Bar
 * @description Floating pill-shaped navigation bar for landing/marketing pages.
 *              Renders the BaadFaad logo, nav links (Features, How It Works, About,
 *              Contact) that resolve to hash anchors or page routes depending
 *              on the current pathname, and a "Start Splitting" CTA button.
 *              Features and How It Works links use hash-based scroll on the
 *              homepage and full navigation from other pages.
 *
 * @returns {JSX.Element} Responsive header with rounded pill container
 *
 * @module components/layout/landing/Topbar
 */
import logo from "../../../assets/Logo-01.png";
import { Link, useLocation } from "react-router-dom";

export default function Topbar() {
  const location = useLocation();
  const isHome = location.pathname === "/";

  const featuresHref = isHome ? "#features" : "/#features";
  const howItWorksHref = isHome ? "#how-it-works" : "/#how-it-works";

  return (
    <header className="w-full bg-white px-4 py-4 sm:px-6 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between rounded-full border border-emerald-100 bg-zinc-100 px-4 py-3 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={logo}
            alt="BaadFaad logo"
            className="h-8 w-8  object-cover"
          />
        </Link>

        <nav className="hidden items-center gap-10 md:flex">
          <a
            href={featuresHref}
            className="text-sm font-semibold text-black hover:text-slate-900"
          >
            Features
          </a>
          <a
            href={howItWorksHref}
            className="text-sm font-semibold text-black hover:text-slate-900"
          >
            How It Works
          </a>
          <Link
            to="/about"
            className="text-sm font-semibold text-black hover:text-slate-900"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-semibold text-black hover:text-slate-900"
          >
            Contact
          </Link>
        </nav>

        <Link
          to="/"
          className="rounded-full bg-emerald-400 px-6 py-2 text-sm font-bold text-white transition hover:bg-emerald-500 cursor-pointer"
        >
          Start Splitting
        </Link>
      </div>
    </header>
  );
}
