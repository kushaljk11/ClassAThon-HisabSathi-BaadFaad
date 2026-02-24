import { FaBars, FaTimes } from "react-icons/fa";
import logo from "../../../assets/Logo-01.png";

export default function TopBar({ onMenuToggle, isOpen }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-zinc-200 bg-white shadow-sm">
      <div className="flex h-16 items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img
            src={logo}
            alt="BaadFaad logo"
            className="h-10 w-10 object-cover"
          />
          <span className="text-xl font-bold text-slate-900">BaadFaad</span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={onMenuToggle}
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-400 text-white md:hidden"
          aria-label="Toggle menu"
        >
          {isOpen ? <FaTimes className="text-lg" /> : <FaBars className="text-lg" />}
        </button>
      </div>
    </header>
  );
}
