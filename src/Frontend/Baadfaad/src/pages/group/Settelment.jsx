/**
 * @fileoverview Settlement Page
 * @description Shows the payment settlement status for a group's splits.
 *              Displays each member's outstanding balance, payment history,
 *              and allows the host to mark payments as completed or send
 *              nudge reminders. Supports exporting settlement summaries.
 *              Uses the Dashboard SideBar + TopBar layout.
 *
 * @module pages/group/Settlement
 */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import api from "../../config/config";
import toast from "react-hot-toast";
import {
  FaSpinner,
  FaFileExport,
  FaArrowRight,
  FaCheckCircle,
  FaPaperPlane,
  FaRegClock,
} from "react-icons/fa";

const formatMoney = (value) =>
  `Rs. ${(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const getInitials = (name) =>
  (name || "?")
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

export default function Settlement() {
  const navigate = useNavigate();
  const { groupId } = useParams();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [group, setGroup] = useState(null);
  const [split, setSplit] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupRes = await api.get(`/groups/${groupId}`);
        const groupData = groupRes.data?.data || groupRes.data;
        setGroup(groupData);

        const splitId = groupData?.splitId;
        if (splitId) {
          const splitRes = await api.get(`/splits/${splitId}`);
          setSplit(splitRes.data?.split || splitRes.data);
        }
      } catch (err) {
        console.error("Failed to load group data:", err);
        toast.error("Failed to load group data");
      } finally {
        setLoading(false);
      }
    };
    if (groupId) fetchData();
  }, [groupId]);

  const breakdown = split?.breakdown || [];
  const totalExpense = split?.totalAmount || 0;
  const totalCollected = breakdown.reduce((sum, b) => sum + (b.amountPaid || 0), 0);
  const remaining = Math.max(0, totalExpense - totalCollected);
  const collectPct = totalExpense > 0 ? Math.round((totalCollected / totalExpense) * 100) : 0;

  const participants = breakdown.map((b) => ({
    name: b.name || b.user?.name || b.participant?.name || "Participant",
    email: b.email || b.user?.email || "",
    share: b.amount || 0,
    paid: b.amountPaid || 0,
    due: Math.max(0, (b.amount || 0) - (b.amountPaid || 0)),
    status: b.paymentStatus || "unpaid",
  }));

  const handleContinueToNudge = () => {
    navigate(`/group/${groupId}/nudge`);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-zinc-50">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
        <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="ml-0 flex-1 flex items-center justify-center pt-24 md:ml-56 md:pt-8">
          <FaSpinner className="animate-spin text-4xl text-emerald-500" />
        </main>
      </div>
    );
  }

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
          {/* Group header with image */}
          {group?.image && (
            <div className="mb-6 overflow-hidden rounded-3xl">
              <img
                src={group.image}
                alt={group.name}
                className="h-48 w-full object-cover"
              />
            </div>
          )}

          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Settlement Summary
              </h1>
              <p className="mt-1 text-xs text-slate-500 md:text-sm">
                {group?.name || "Group"} &bull; Final breakdown of balances
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
                onClick={handleContinueToNudge}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-xs font-bold text-slate-900 hover:bg-emerald-500"
              >
                Continue to Nudge
                <FaArrowRight className="text-xs" />
              </button>
            </div>
          </div>

          {/* Summary cards */}
          <section className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-3xl border border-zinc-200 bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Total Session Expense
              </p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {formatMoney(totalExpense)}
              </p>
              <div className="mt-3 h-1.5 rounded-full bg-zinc-200">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: "100%" }} />
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
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${collectPct}%` }}
                />
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
                <div
                  className="h-full rounded-full bg-orange-400"
                  style={{ width: `${totalExpense > 0 ? Math.round((remaining / totalExpense) * 100) : 0}%` }}
                />
              </div>
            </article>
          </section>

          {/* Participant table */}
          <section className="overflow-hidden rounded-3xl border border-zinc-200 bg-white">
            <div className="hidden grid-cols-[2fr_1fr_1fr_1fr_1.5fr] border-b border-zinc-200 bg-zinc-50 px-4 py-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 md:grid">
              <p>Participant</p>
              <p>Total Share</p>
              <p>Amount Paid</p>
              <p>Balance Due</p>
              <p>Status / Action</p>
            </div>

            <div className="divide-y divide-zinc-200">
              {participants.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  No participants in this split yet.
                </div>
              ) : (
                participants.map((person, idx) => (
                  <div
                    key={person.email || idx}
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
                      {person.due > 0 ? formatMoney(person.due) : "Rs. 0.00"}
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {person.status === "paid" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                          <FaCheckCircle className="text-[9px]" /> Paid
                        </span>
                      ) : (
                        <>
                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-orange-600">
                            {person.status === "partial" ? "Partial" : "Unpaid"}
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
                ))
              )}
            </div>
          </section>

          {/* Bottom bar */}
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
                  Once all participants have cleared their balance, the group settlement is complete.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinueToNudge}
              className="self-start inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-xs font-bold text-slate-900 hover:bg-emerald-500 md:self-auto"
            >
              Continue to Nudge
              <FaArrowRight className="text-xs" />
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}