import { useState, useEffect } from "react";
import {
  FaBolt,
  FaCalendarAlt,
  FaEllipsisV,
  FaFileExport,
  FaPlusCircle,
  FaShoppingCart,
  FaUtensils,
  FaUsers,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import SideBar from "../../components/layout/Dashboard/SideBar";
import TopBar from "../../components/layout/Dashboard/TopBar";
import api from "../../config/config";

const ICONS = [FaUtensils, FaCalendarAlt, FaBolt, FaShoppingCart];
const ICON_BGS = ["bg-emerald-100", "bg-blue-100", "bg-emerald-100", "bg-amber-100"];

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [recentSplits, setRecentSplits] = useState([]);

  useEffect(() => {
    const fetchSplits = async () => {
      try {
        const res = await api.get("/splits");
        const splits = res.data.splits || [];
        const mapped = splits.slice(0, 5).map((s, i) => ({
          title: s.notes || s.receipt?.restaurant || `Split #${i + 1}`,
          date: new Date(s.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short" }),
          members: `${s.breakdown?.length || 0} participants`,
          amount: `Rs. ${(s.totalAmount || 0).toLocaleString()}`,
          status: s.status === "finalized" ? "SETTLED" : "PENDING",
          statusStyle:
            s.status === "finalized"
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700",
          icon: ICONS[i % ICONS.length],
          iconBg: ICON_BGS[i % ICON_BGS.length],
        }));
        setRecentSplits(mapped);
      } catch (err) {
        // If API fails, show empty state
        console.error("Failed to fetch splits:", err);
      }
    };
    fetchSplits();
  }, []);

  return (
    <div className="flex min-h-screen bg-zinc-100">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 flex-1 p-6 pt-24 md:ml-56 md:p-8 md:pt-8 sm:mt-14">
        <div className="rounded-4xl bg-linear-to-r from-emerald-900 via-teal-900 to-slate-900 px-8 py-10 text-white shadow-xl">
          <h1 className="text-4xl font-bold">Start New Split</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-200">
            Split bills with friends in seconds. No more awkward "who owes who"
            conversations.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/split/create"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-lg font-bold text-white hover:bg-emerald-500 transition"
            >
              <FaPlusCircle />
              Create Split
            </Link>
            <Link
              to="/join-session"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-lg font-semibold text-white backdrop-blur hover:bg-white/20 transition"
            >
              <FaUsers />
              Join Split
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <section className="rounded-4xl border border-zinc-200 bg-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                    <FaShoppingCart />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Last Time You Paid
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      $45.00 for Groceries
                    </p>
                    <p className="text-sm text-slate-400">on October 24th, 2023</p>
                  </div>
                </div>
                <button type="button" className="text-slate-400">
                  <FaEllipsisV />
                </button>
              </div>
            </section>

            <section className="rounded-4xl border border-zinc-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold text-slate-400">
                    Monthly Spending
                  </p>
                  <div className="mt-1 flex items-end gap-3">
                    <p className="text-3xl font-bold text-slate-900">$1,240.50</p>
                    <span className="text-sm font-bold text-emerald-500">
                      +12%
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  className="rounded-full bg-zinc-100 px-4 py-2 text-sm font-semibold text-slate-600"
                >
                  October 2023
                </button>
              </div>

              <div className="mt-24">
                <div className="grid grid-cols-7 text-center text-xs font-semibold text-slate-400">
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                  <span>Sun</span>
                </div>
              </div>
            </section>
          </div>

          <aside className="rounded-4xl border border-zinc-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-900">Recent Splits</h2>
              <button type="button" className="text-sm font-bold text-emerald-500">
                View All
              </button>
            </div>

            <div className="mt-5 space-y-5">
              {recentSplits.map((split) => {
                const Icon = split.icon;

                return (
                  <article
                    key={split.title}
                    className="flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`mt-1 flex h-10 w-10 items-center justify-center rounded-full text-slate-700 ${split.iconBg}`}
                      >
                        <Icon className="text-sm" />
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{split.title}</p>
                        <p className="text-xs text-slate-400">{split.date}</p>
                        <p className="text-xs text-slate-400">{split.members}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{split.amount}</p>
                      <span
                        className={`mt-1 inline-block rounded-full px-2 py-1 text-[10px] font-bold ${split.statusStyle}`}
                      >
                        {split.status}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-6 border-t border-zinc-100 pt-5">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-100 px-5 py-3 font-bold text-slate-700"
              >
                <FaFileExport />
                Export History
              </button>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
