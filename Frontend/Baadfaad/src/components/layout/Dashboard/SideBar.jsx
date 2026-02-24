import {
  FaCog,
  FaHistory,
  FaThLarge,
  FaUserFriends,
  FaUsers,
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
  return (
    <aside className="fixed left-0 top-0 flex h-screen w-64 flex-col border-r border-zinc-200 bg-white px-4 py-5">
      <div className="mb-8 flex items-center gap-3 px-2">
        <img
          src={logo}
          alt="BaadFaad logo"
          className="h-10 w-10 object-cover"
        />
        <div>
          <p className="text-2xl font-bold text-slate-900">BaadFaad</p>

        </div>
      </div>

      <nav className="space-y-3">
        {menuItems.map(({ label, icon: Icon, to }) => (
          <NavLink
            key={label}
            to={to}
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
  );
}
