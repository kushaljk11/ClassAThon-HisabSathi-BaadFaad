import { useState } from "react";
import { FaCheckCircle, FaRegPaperPlane, FaWallet } from "react-icons/fa";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";

const participants = [
  {
    name: "Rahul Sharma",
    share: "Rs 5,000",
    paid: "Rs 5000",
    due: null,
    status: "Paid",
    tag: "HIGHEST SHARE",
    avatar: "RS",
    avatarBg: "bg-emerald-200",
  },
  {
    name: "Priya Patel",
    share: "Rs 2,500",
    paid: "Rs 1500",
    due: "Rs 1,000",
    status: null,
    tag: null,
    avatar: "PP",
    avatarBg: "bg-zinc-300",
  },
  {
    name: "Arjun Singh",
    share: "Rs 2,500",
    paid: "Rs 0",
    due: "Rs 2,500",
    status: null,
    tag: null,
    avatar: "AS",
    avatarBg: "bg-amber-200",
  },
  {
    name: "Sneha Reddy",
    share: "Rs 2,500",
    paid: "Rs 2500",
    due: null,
    status: "Paid",
    tag: null,
    avatar: "SR",
    avatarBg: "bg-violet-200",
  },
];

export default function SplitBreakdown() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-100">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 mx-auto w-full max-w-6xl px-7 py-8 pt-24 md:ml-56 md:pt-8">
          <h1 className="text-5xl font-bold text-slate-900">Split Breakdown</h1>
          <p className="mt-2 text-sm text-slate-500">
            Detailed breakdown of shared expenses for Weekend Getaway
          </p>

          <section className="mt-6 overflow-hidden rounded-4xl border border-emerald-100 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr]">
              <div className="flex items-center justify-center bg-emerald-100 p-8 text-emerald-500">
                <FaWallet className="text-5xl" />
              </div>

              <div className="p-8">
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  Total Bill Amount
                </p>
                <p className="mt-1 text-6xl font-bold text-slate-900">Rs 12,500</p>
                <p className="mt-2 text-sm text-slate-500">
                  Shared among 4 participants
                </p>
              </div>
            </div>
          </section>

          <section className="mt-8">
            <h2 className="text-3xl font-bold text-slate-900">Participants Details</h2>

            <div className="mt-4 space-y-3">
              {participants.map((person) => (
                <article
                  key={person.name}
                  className="rounded-4xl border border-emerald-100 bg-white px-5 py-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-slate-700 ${person.avatarBg}`}
                      >
                        {person.avatar}
                      </span>

                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold text-slate-900">{person.name}</p>
                          {person.tag ? (
                            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                              {person.tag}
                            </span>
                          ) : null}
                        </div>
                        <p className="text-sm text-slate-400">
                          Total Share: {person.share}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-8">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Amount Paid
                        </p>
                        <div className="mt-1 rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-slate-700">
                          {person.paid}
                        </div>
                      </div>

                      <div className="min-w-26">
                        {person.status ? (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Status
                            </p>
                            <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                              <FaCheckCircle className="text-[10px]" />
                              {person.status}
                            </span>
                          </>
                        ) : (
                          <>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Balance Due
                            </p>
                            <p className="mt-1 text-3xl font-bold text-red-500">
                              +{person.due}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="mt-8 rounded-4xl bg-linear-to-r from-slate-950 to-slate-900 px-6 py-6 text-white">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-3xl font-bold">Almost done!</p>
                <p className="mt-1 text-sm text-slate-300">
                  We&apos;ll send notifications to those with pending balances.
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-8 py-3 text-base font-bold text-slate-900 shadow-lg shadow-emerald-300/40"
              >
                Finish &amp; Notify All
                <FaRegPaperPlane className="text-xs" />
              </button>
            </div>
          </section>
      </main>
    </div>
  );
}
