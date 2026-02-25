import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { FaCheckCircle, FaRegPaperPlane, FaWallet, FaSpinner } from "react-icons/fa";
import SideBar from "../../components/layout/Dashboard/SideBar";
import TopBar from "../../components/layout/Dashboard/TopBar";
import api from "../../config/config";
import toast, { Toaster } from "react-hot-toast";

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
  const [searchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [split, setSplit] = useState(null);
  const [session, setSession] = useState(null);
  const [notifying, setNotifying] = useState(false);

  const splitId = searchParams.get("splitId");
  const sessionId = searchParams.get("sessionId");
  const type = searchParams.get("type");

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (splitId) {
          const splitRes = await api.get(`/splits/${splitId}`);
          setSplit(splitRes.data.split);
        }
        if (sessionId) {
          const sessionRes = await api.get(`/session/${sessionId}`);
          setSession(sessionRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Failed to load split data");
      }
    };

    fetchData();
  }, [splitId, sessionId]);

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
    if (!split?._id) {
      toast.error("No split data found");
      return;
    }
    
    setNotifying(true);
    const toastId = toast.loading("Sending notifications to all participants...");
    
    try {
      await api.post(`/splits/${split._id}/finalize`);
      
      // Send nudge/email to all participants with pending amounts
      let emailsSent = 0;
      let emailsFailed = 0;
      
      for (const b of breakdown) {
        const name = b.user?.name || b.participant?.name || "Friend";
        const email = b.user?.email || b.participant?.email;
        
        if (email && b.amount > 0) {
          try {
            await api.post("/nudge/send", {
              recipientName: name,
              recipientEmail: email,
              senderName: "BaadFaad",
              groupName: session?.name || "Split",
              amount: b.amount,
            });
            emailsSent++;
          } catch (err) {
            console.error(`Failed to send email to ${email}:`, err);
            emailsFailed++;
          }
        }
      }
      
      // Dismiss loading toast and show success
      toast.dismiss(toastId);
      
      if (emailsSent > 0) {
        toast.success(
          `Successfully sent notifications to ${emailsSent} participant${emailsSent > 1 ? 's' : ''}!`,
          { duration: 4000 }
        );
      }
      
      if (emailsFailed > 0) {
        toast.error(
          `Failed to send ${emailsFailed} notification${emailsFailed > 1 ? 's' : ''}`,
          { duration: 3000 }
        );
      }
      
      if (emailsSent === 0 && emailsFailed === 0) {
        toast.success("Split finalized successfully!", { duration: 3000 });
      }
      
      // Navigate after a short delay to let user see the toast
      setTimeout(() => {
        navigate(`/split/calculated?splitId=${splitId}&sessionId=${sessionId}&type=${type}`);
      }, 1500);
    } catch (err) {
      console.error("Finalize failed:", err);
      toast.dismiss(toastId);
      toast.error(
        err.response?.data?.message || "Failed to finalize split. Please try again.",
        { duration: 4000 }
      );
    } finally {
      setNotifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Toaster position="top-right" reverseOrder={false} />
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 mx-auto w-full max-w-6xl px-7 py-8 pt-24 md:ml-56 md:pt-8 sm:mt-10">
          <h1 className="text-3xl font-bold text-slate-900">Split Breakdown</h1>
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
                <p className="mt-1 text-4xl font-bold text-slate-900">Rs {totalAmount.toLocaleString()}</p>
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
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-8 cursor-pointer py-3 text-base font-bold text-white shadow-lg shadow-emerald-300/40 disabled:opacity-50"
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
