import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaCheckCircle, FaRegPaperPlane, FaWallet, FaSpinner } from "react-icons/fa";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import api from "../../config/config";

const AVATAR_COLORS = [
  "bg-emerald-200",
  "bg-zinc-300",
  "bg-amber-200",
  "bg-violet-200",
  "bg-blue-200",
  "bg-rose-200",
];

export default function SplitBreakdown() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [split, setSplit] = useState(null);
  const [notifying, setNotifying] = useState(false);

  useEffect(() => {
    const storedSplit = localStorage.getItem("currentSplit");
    if (storedSplit) {
      const parsed = JSON.parse(storedSplit);
      setSplit(parsed);
      // Fetch fresh data if we have an ID
      if (parsed._id) {
        api.get(`/splits/${parsed._id}`).then((res) => {
          setSplit(res.data.split);
        }).catch(() => {});
      }
    }
  }, []);

  const totalAmount = split?.totalAmount || 0;
  const breakdown = split?.breakdown || [];
  const participantCount = breakdown.length;

  const participants = breakdown.map((b, i) => {
    const name = b.user?.name || b.participant?.name || `Participant ${i + 1}`;
    const initials = name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
    const paid = 0; // Could track actual payments in future
    const due = b.amount;
    return {
      name,
      share: `Rs ${b.amount.toLocaleString()}`,
      paid: `Rs ${paid.toLocaleString()}`,
      due: due > 0 ? `Rs ${due.toLocaleString()}` : null,
      status: paid >= b.amount ? "Paid" : null,
      tag: i === 0 ? "HIGHEST SHARE" : null,
      avatar: initials,
      avatarBg: AVATAR_COLORS[i % AVATAR_COLORS.length],
    };
  });

  const handleFinishAndNotify = async () => {
    if (!split?._id) return;
    setNotifying(true);
    try {
      await api.post(`/splits/${split._id}/finalize`);
      // Send nudge to all pending participants
      for (const b of breakdown) {
        const name = b.user?.name || b.participant?.name || "Friend";
        const email = b.user?.email || b.participant?.email;
        if (email && b.amount > 0) {
          await api.post("/nudge/send", {
            recipientName: name,
            recipientEmail: email,
            senderName: "BaadFaad",
            groupName: localStorage.getItem("splitName") || "Split",
            amount: b.amount,
          }).catch(() => {}); // don't block on nudge failures
        }
      }
      localStorage.removeItem("currentSplit");

      localStorage.removeItem("splitName");
      navigate("/dashboard");
    } catch (err) {
      console.error("Finalize failed:", err);
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 mx-auto w-full max-w-6xl px-7 py-8 pt-24 md:ml-56 md:pt-8 sm:mt-10">
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
                <p className="mt-1 text-6xl font-bold text-slate-900">Rs {totalAmount.toLocaleString()}</p>
                <p className="mt-2 text-sm text-slate-500">
                  Shared among {participantCount} participants
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
                onClick={handleFinishAndNotify}
                disabled={notifying}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-8 py-3 text-base font-bold text-slate-900 shadow-lg shadow-emerald-300/40 disabled:opacity-50"
              >
                {notifying ? <FaSpinner className="animate-spin text-xs" /> : null}
                Finish &amp; Notify All
                <FaRegPaperPlane className="text-xs" />
              </button>
            </div>
          </section>
      </main>
    </div>
  );
}
