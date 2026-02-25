import { useState } from "react";
import {
  FaCheckCircle,
  FaFileExport,
  FaPaperPlane,
  FaRegClock,
} from "react-icons/fa";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";

const participants = [
  {
    name: "Alex Rivera",
    email: "alex.v@example.com",
    share: 612.5,
    paid: 612.5,
    due: 0,
    status: "paid",
  },
  {
    name: "Jordan Smith",
    email: "jordan.s@example.com",
    share: 612.5,
    paid: 200,
    due: 412.5,
    status: "due",
  },
  {
    name: "Casey Wang",
    email: "casey.w@example.com",
    share: 612.5,
    paid: 612.5,
    due: 0,
    status: "paid",
  },
  {
    name: "Taylor Bell",
    email: "t.bell@example.com",
    share: 612.5,
    paid: 415,
    due: 197.5,
    status: "due",
  },
];

const formatMoney = (value) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getInitials = (name) =>
  name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

export default function Settlement() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalExpense = 2450;
  const totalCollected = 1840;
  const remaining = 610;

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <TopBar
        onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        isOpen={isMobileMenuOpen}
      />
      <SideBar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      <main className="ml-0 flex-1 px-4 py-6 pt-24 md:ml-56 md:px-8 md:pt-8 sm:mt-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Settlement Summary
              </h1>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                Session: Weekend Trip to Goa • Final breakdown of balances
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-zinc-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-zinc-100"
              >
                <FaFileExport className="text-xs" />
                Export PDF
              </button>
              <button
                type="button"
                className="rounded-full bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-emerald-500"
              >
                Finish & Archive Session
              </button>
            </div>
          </div>

          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Session Expense
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {formatMoney(totalExpense)}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-zinc-200">
                <div className="h-full w-[76%] rounded-full bg-emerald-400" />
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Collected
              </p>
              <p className="mt-1 text-3xl font-bold text-emerald-500">
                {formatMoney(totalCollected)}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-zinc-200">
                <div className="h-full w-[60%] rounded-full bg-emerald-400" />
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Remaining Balance
              </p>
              <p className="mt-1 text-3xl font-bold text-orange-500">
                {formatMoney(remaining)}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-zinc-200">
                <div className="h-full w-[24%] rounded-full bg-orange-400" />
              </div>
            </article>
          </section>

          <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
              <p>Participant</p>
              <p>Total Share</p>
              <p>Amount Paid</p>
              <p>Balance Due</p>
              <p>Status / Action</p>
            </div>

            <div className="divide-y divide-zinc-200">
              {participants.map((person) => (
                <div
                  key={person.email}
                  className="grid gap-3 px-4 py-3 md:grid-cols-[2fr_1fr_1fr_1fr_1.5fr] md:items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold text-slate-700">
                      {getInitials(person.name)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{person.name}</p>
                      <p className="text-xs text-slate-400">{person.email}</p>
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-700">
                    {formatMoney(person.share)}
                  </p>
                  <p className="text-sm font-semibold text-slate-700">
                    {formatMoney(person.paid)}
                  </p>
                  <p
                    className={`text-sm font-bold ${
                      person.due > 0 ? "text-orange-500" : "text-emerald-500"
                    }`}
                  >
                    {person.due > 0 ? `+${formatMoney(person.due)}` : "$0.00"}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    {person.status === "paid" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        <FaCheckCircle className="text-[9px]" /> Paid
                      </span>
                    ) : (
                      <>
                        <span className="rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          via eSewa
                        </span>
                        <span className="rounded-full bg-violet-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          via Khalti
                        </span>
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500 hover:bg-zinc-100"
                        >
                          <FaPaperPlane className="text-[9px]" /> Send Nudge
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-5 flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <FaRegClock className="text-xs" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">
                  Awaiting {formatMoney(remaining)} total
                </p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Once all participants have cleared their balance, you can archive this session.
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Quick pay:
                  </span>
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    via eSewa
                  </span>
                  <span className="rounded-full bg-violet-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    via Khalti
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="self-start rounded-full bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-900 hover:bg-emerald-500 md:self-auto"
            >
              Finish & Archive Session
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}