import {
  FaCog,
  FaHistory,
  FaThLarge,
  FaUserFriends,
  FaUsers,
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

const menuItems = [
  { label: "Home", icon: FaThLarge, to: "/dashboard" },
  { label: "Create Split", icon: FaHistory, to: "/split/create" },
  { label: "Group", icon: FaUserFriends, to: "/group" },
  { label: "About", icon: FaUsers, to: "/about" },
  { label: "Contact", icon: FaCog, to: "/contact" },
];

export default function SideBar({ isOpen, onClose }) {
  return (
    <>
      {/* Backdrop/Overlay (Mobile) */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 top-16 z-30 bg-slate-900/50 md:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-16 z-40 flex h-[calc(100vh-4rem)] w-56 flex-col border-zinc-200 bg-white px-4 py-5 shadow-xl transition-transform duration-300 md:left-0 md:border-r md:translate-x-0 ${
          isOpen ? "right-0 translate-x-0 border-l" : "right-0 translate-x-full md:translate-x-0"
        }`}
      >
      <nav className="space-y-3">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
            onClick={onClose}
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
