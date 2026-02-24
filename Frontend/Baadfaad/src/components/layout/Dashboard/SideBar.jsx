import { useState } from "react";
import {
  FaCog,
  FaHistory,
  FaThLarge,
  FaUserFriends,
  FaUsers,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";
import logo from "../../../assets/Logo-01.png";

const menuItems = [
  { label: "Home", icon: FaThLarge, to: "/dashboard" },
  { label: "Create Split", icon: FaHistory, to: "/split/create" },
  { label: "Group", icon: FaUserFriends, to: "/group" },
  { label: "About", icon: FaUsers, to: "/about" },
  { label: "Contact", icon: FaCog, to: "/contact" },
];

export default function SideBar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Hamburger Button */}
      <button
        onClick={toggleMobileMenu}
        className="fixed right-4 top-4 z-50 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400 text-white shadow-lg md:hidden"
        aria-label="Toggle menu"
      >
        {isMobileMenuOpen ? <FaTimes className="text-xl" /> : <FaBars className="text-xl" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 z-40 flex h-screen w-56 flex-col border-zinc-200 bg-white px-4 py-5 shadow-xl transition-transform duration-300 md:left-0 md:border-r md:translate-x-0 ${
          isMobileMenuOpen ? "right-0 translate-x-0 border-l" : "right-0 translate-x-full md:translate-x-0"
        }`}
      >
      <div className="mb-8 flex items-center justify-center px-2">
        <img
          src={logo}
          alt="BaadFaad logo"
          className="h-12 w-12 object-cover"
        />
      </div>

      <nav className="space-y-3">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={closeMobileMenu}
            className={({ isActive }) =>
              `flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-base font-medium transition ${
                isActive
                ? "bg-emerald-800 text-white"
                : "text-slate-500 hover:bg-zinc-50 hover:text-slate-700"
              }`
            }
          >
            <Icon className="text-base" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-5">
        <p className="text-xs font-bold tracking-wide text-slate-500">
          PREMIUM ACCOUNT
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Upgrade for unlimited split groups.
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-full bg-slate-900 py-2.5 text-sm font-bold text-white hover:bg-slate-800 transition"
        >
          UPGRADE
        </button>
      </div>
    </aside>
    </>
  );
}
