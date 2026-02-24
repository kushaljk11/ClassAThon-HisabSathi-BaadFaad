import {
  FaCog,
  FaHistory,
  FaThLarge,
  FaUserFriends,
  FaUsers,
  FaWallet,
} from "react-icons/fa";

const menuItems = [
  { label: "Home", icon: FaThLarge, active: true },
  { label: "History", icon: FaHistory, active: false },
  { label: "Friends", icon: FaUserFriends, active: false },
  { label: "Groups", icon: FaUsers, active: false },
  { label: "Settings", icon: FaCog, active: false },
];

export default function SideBar() {
  return (
    <aside className="flex h-screen w-[16rem] flex-col border-r border-zinc-300 bg-zinc-100 px-4 py-5">
      <div className="flex items-center gap-3 px-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-900">
          <FaWallet className="text-base" />
        </span>
        <div>
          <p className="text-2xl font-bold text-slate-900">BaadFaad</p>
          <p className="text-[11px] font-semibold text-slate-500">
            Dashboard v1.0
          </p>
        </div>
      </div>

      <nav className="mt-8 space-y-3">
        {menuItems.map(({ label, icon: Icon, active }) => (
          <button
            key={label}
            type="button"
            className={`flex w-full items-center gap-3 rounded-full px-4 py-3 text-left text-base font-semibold transition ${
              active
                ? "bg-emerald-400 text-slate-950"
                : "text-slate-500 hover:bg-zinc-200 hover:text-slate-700"
            }`}
          >
            <Icon className="text-base" />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="mt-auto rounded-[1.7rem] border border-emerald-200 bg-emerald-50 px-4 py-5">
        <p className="text-xs font-bold tracking-wide text-slate-500">
          PREMIUM ACCOUNT
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          Upgrade for unlimited split groups.
        </p>
        <button
          type="button"
          className="mt-4 w-full rounded-full bg-slate-900 py-2 text-sm font-bold tracking-[0.2em] text-white"
        >
          UPGRADE
        </button>
      </div>
    </aside>
  );
}
