import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  FaCheckCircle,
  FaRegPaperPlane,
  FaWallet,
  FaSpinner,
  FaTimesCircle,
  FaHourglassHalf,
  FaArrowRight,
} from "react-icons/fa";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import api from "../../config/config";
import toast, { Toaster } from "react-hot-toast";
import useSessionSocket, { emitHostNavigate } from "../../hooks/useSessionSocket";

const AVATAR_COLORS = [
  "bg-emerald-200",
  "bg-zinc-300",
  "bg-amber-200",
  "bg-violet-200",
  "bg-blue-200",
  "bg-rose-200",
];

const STATUS_OPTIONS = ["unpaid", "partial", "paid"];

function statusBadge(status) {
  switch (status) {
    case "paid":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
          <FaCheckCircle className="text-[10px]" /> Paid
        </span>
      );
    case "partial":
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
          <FaHourglassHalf className="text-[10px]" /> Partial
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-600">
          <FaTimesCircle className="text-[10px]" /> Unpaid
        </span>
      );
  }
}

export default function SplitBreakdown() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [split, setSplit] = useState(null);
  const [session, setSession] = useState(null);
  const [notifying, setNotifying] = useState(false);
  const [updatingIdx, setUpdatingIdx] = useState(null);

  const splitId = searchParams.get("splitId");
  const sessionId = searchParams.get("sessionId");
  const type = searchParams.get("type");

  const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentUserId = storedUser?._id || storedUser?.id;

  const fetchSplit = useCallback(async () => {
    try {
      if (splitId) {
        const splitRes = await api.get(`/splits/${splitId}`);
        setSplit(splitRes.data.split);
      }
    } catch {
      toast.error("Failed to load split data");
    }
  }, [splitId]);

  useEffect(() => {
    const fetchData = async () => {
      await fetchSplit();
      try {
        if (sessionId) {
          const sessionRes = await api.get(`/session/${sessionId}`);
          setSession(sessionRes.data);
        }
      } catch {
        toast.error("Failed to load session data");
      }
    };
    fetchData();
  }, [splitId, sessionId, fetchSplit]);

  // Determine if current user is the host (first participant in session)
  const sessionParticipants = session?.session?.participants || session?.participants || [];
  const firstParticipant = sessionParticipants[0];
  const hostUserId =
    typeof firstParticipant === "object"
      ? firstParticipant.user?._id || firstParticipant.user || firstParticipant._id
      : firstParticipant;
  const isHost = currentUserId && String(hostUserId) === String(currentUserId);

  // Socket: listen for host-navigate so non-host users get redirected
  const onHostNavigate = useCallback(
    (data) => {
      if (data?.path) navigate(data.path);
    },
    [navigate]
  );

  useSessionSocket(sessionId, null, onHostNavigate, null);

  const totalAmount = split?.totalAmount || 0;
  const breakdown = split?.breakdown || [];
  const participantCount = breakdown.length;

  // --- Host: update a participant's amountPaid / paymentStatus ---
  const handlePaymentUpdate = async (index, field, value) => {
    if (!splitId) return;
    setUpdatingIdx(index);
    try {
      const body = {};
      if (field === "amountPaid") {
        body.amountPaid = Number(value) || 0;
      } else if (field === "paymentStatus") {
        body.paymentStatus = value;
      }
      await api.put(`/splits/${splitId}/participant/${index}`, body);
      await fetchSplit();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update payment");
    } finally {
      setUpdatingIdx(null);
    }
  };

  // --- Notify all participants via detailed split-summary email ---
  const handleNotifyAll = async () => {
    if (!split?._id || breakdown.length === 0) {
      toast.error("No split data to notify about");
      return;
    }

    setNotifying(true);
    const toastId = toast.loading("Sending split summary emails...");

    try {
      await api.post(`/splits/${split._id}/finalize`);

      const summaryBreakdown = breakdown.map((b) => {
        const name = b.name || b.user?.name || b.participant?.name || "Participant";
        const email = b.email || b.user?.email || b.participant?.email || "";
        const amountPaid = b.amountPaid || 0;
        return {
          name,
          email,
          share: b.amount,
          amountPaid,
          balanceDue: Math.max(0, b.amount - amountPaid),
        };
      });

      const res = await api.post("/nudge/split-summary", {
        groupName: session?.name || session?.session?.name || "Split",
        totalAmount,
        breakdown: summaryBreakdown,
      });

      toast.dismiss(toastId);

      const { sent = 0, failed = 0 } = res.data;
      if (sent > 0) {
        toast.success(`Sent summary to ${sent} participant${sent > 1 ? "s" : ""}!`, {
          duration: 4000,
        });
      }
      if (failed > 0) {
        toast.error(`Failed to send ${failed} email${failed > 1 ? "s" : ""}`, { duration: 3000 });
      }
      if (sent === 0 && failed === 0) {
        toast.success("Split finalized! No emails to send (no emails on file).", { duration: 3000 });
      }
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to send notifications", { duration: 4000 });
    } finally {
      setNotifying(false);
    }
  };

  // --- Continue to SplitCalculated page (host navigates everyone) ---
  const handleContinue = () => {
    const targetPath = `/split/calculated?splitId=${splitId}&sessionId=${sessionId}&type=${type}`;
    emitHostNavigate(sessionId, targetPath);
    navigate(targetPath);
  };

  return (
    <div className="min-h-screen bg-zinc-100">
      <Toaster position="top-right" reverseOrder={false} />
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 mx-auto w-full max-w-6xl px-7 py-8 pt-24 md:ml-56 md:pt-8 sm:mt-10">
        <h1 className="text-3xl font-bold text-slate-900">Split Breakdown</h1>
        <p className="mt-2 text-sm text-slate-500">
          Detailed breakdown of shared expenses
          {!isHost && " — the host can update payment status"}
        </p>

        {/* ── Total Bill Card ── */}
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
                Split equally among {participantCount} participant{participantCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </section>

        {/* ── Participants ── */}
        <section className="mt-8">
          <h2 className="text-3xl font-bold text-slate-900">Participants Details</h2>

          <div className="mt-4 space-y-3">
            {breakdown.map((b, i) => {
              const name = b.name || b.user?.name || b.participant?.name || `Participant ${i + 1}`;
              const initials = name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
              const amountPaid = b.amountPaid || 0;
              const due = Math.max(0, b.amount - amountPaid);
              const paymentStatus = b.paymentStatus || "unpaid";
              const avatarBg = AVATAR_COLORS[i % AVATAR_COLORS.length];

              return (
                <article
                  key={i}
                  className="rounded-4xl border border-emerald-100 bg-white px-5 py-4"
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    {/* Left: avatar + name */}
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold text-slate-700 ${avatarBg}`}
                      >
                        {initials}
                      </span>
                      <div>
                        <p className="text-2xl font-bold text-slate-900">{name}</p>
                        <p className="text-sm text-slate-400">
                          Total Share: Rs {b.amount?.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Right: payment info */}
                    <div className="flex flex-wrap items-center gap-6">
                      {/* Amount Paid */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Amount Paid
                        </p>
                        {isHost ? (
                          <input
                            type="number"
                            min={0}
                            max={b.amount}
                            value={amountPaid}
                            disabled={updatingIdx === i}
                            onChange={(e) => handlePaymentUpdate(i, "amountPaid", e.target.value)}
                            className="mt-1 w-28 rounded-full border border-emerald-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
                          />
                        ) : (
                          <div className="mt-1 rounded-full bg-zinc-100 px-4 py-2 text-sm font-bold text-slate-700">
                            Rs {amountPaid.toLocaleString()}
                          </div>
                        )}
                      </div>

                      {/* Status */}
                      <div className="min-w-28">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Status
                        </p>
                        {isHost ? (
                          <select
                            value={paymentStatus}
                            disabled={updatingIdx === i}
                            onChange={(e) => handlePaymentUpdate(i, "paymentStatus", e.target.value)}
                            className="mt-1 cursor-pointer rounded-full border border-emerald-200 bg-zinc-50 px-4 py-2 text-sm font-bold text-slate-700 outline-none focus:border-emerald-400"
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="mt-1">{statusBadge(paymentStatus)}</div>
                        )}
                      </div>

                      {/* Balance Due (read-only for everyone) */}
                      <div className="min-w-24">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Balance Due
                        </p>
                        {due > 0 ? (
                          <p className="mt-1 text-2xl font-bold text-red-500">
                            +Rs {due.toLocaleString()}
                          </p>
                        ) : (
                          <p className="mt-1 text-2xl font-bold text-emerald-500">Settled</p>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* ── Bottom Action ── */}
        <section className="mt-8 rounded-4xl bg-linear-to-r from-slate-950 to-slate-900 px-6 py-6 text-white">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-3xl font-bold">Almost done!</p>
              <p className="mt-1 text-sm text-slate-300">
                {isHost
                  ? "Notify participants about their share, then continue."
                  : "Waiting for the host to continue..."}
              </p>
            </div>

            {isHost ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleNotifyAll}
                  disabled={notifying}
                  className="inline-flex items-center gap-2 rounded-full bg-amber-400 px-6 cursor-pointer py-3 text-base font-bold text-slate-900 shadow-lg shadow-amber-300/40 disabled:opacity-50"
                >
                  {notifying ? <FaSpinner className="animate-spin text-xs" /> : <FaRegPaperPlane className="text-xs" />}
                  Notify All
                </button>

                <button
                  type="button"
                  onClick={handleContinue}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-6 cursor-pointer py-3 text-base font-bold text-white shadow-lg shadow-emerald-300/40"
                >
                  Continue
                  <FaArrowRight className="text-xs" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400">
                <FaSpinner className="animate-spin" />
                <span className="text-sm font-medium">Waiting for host...</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
