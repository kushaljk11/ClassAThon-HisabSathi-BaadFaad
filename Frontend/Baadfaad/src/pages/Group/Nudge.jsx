import { useState, useEffect } from "react";
import {
  FaCheckCircle,
  FaPaperPlane,
  FaRegClock,
  FaUserCircle,
  FaUserSecret,
  FaSpinner,
} from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import api from "../../config/config";
import toast from "react-hot-toast";

export default function Nudge() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [group, setGroup] = useState(null);
  const [splitData, setSplitData] = useState(null);
  const [sendingAll, setSendingAll] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // If we have a groupId, fetch group and its split to get breakdown
        if (groupId) {
          const groupRes = await api.get(`/groups/${groupId}`);
          const groupData = groupRes.data?.data || groupRes.data;
          setGroup(groupData);

          const splitId = groupData?.splitId;
          if (splitId) {
            const splitRes = await api.get(`/splits/${splitId}`);
            const split = splitRes.data?.split || splitRes.data;
            setSplitData(split);
            const breakdown = split?.breakdown || [];

            const mapped = breakdown.map((b) => {
              const name = b.name || b.user?.name || b.participant?.name || "Participant";
              const email = b.email || b.user?.email || "";
              const share = b.amount || 0;
              const paid = b.amountPaid || 0;
              const due = Math.max(0, share - paid);
              const isPaid = b.paymentStatus === "paid";
              return {
                _id: b.participant || b.user?._id || b._id,
                name,
                email,
                share,
                paid,
                due,
                status: isPaid ? "Fully Settled" : due > 0 ? "Pending Payment" : "Fully Settled",
                amount: `Rs. ${due.toLocaleString()}`,
                pending: !isPaid && due > 0,
                action: isPaid ? "Settled" : "Anonymous Nudge",
                actionStyle: isPaid
                  ? "bg-zinc-100 text-slate-400"
                  : "bg-emerald-100 text-emerald-700",
              };
            });
            setMembers(mapped);
          }
        } else {
          // Fallback: get participants from API
          const res = await api.get("/participants");
          const participantList = res.data || [];
          const mapped = participantList.map((p) => ({
            _id: p._id,
            name: p.name,
            email: p.email || "",
            status: p.isHost ? "Fully Settled" : "Pending Payment",
            amount: "Rs. 0.00",
            pending: !p.isHost,
            action: p.isHost ? "Settled" : "Anonymous Nudge",
            actionStyle: p.isHost
              ? "bg-zinc-100 text-slate-400"
              : "bg-emerald-100 text-emerald-700",
          }));
          setMembers(mapped);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
        toast.error("Failed to load nudge data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [groupId]);

  const handleSendNudge = async (member) => {
    if (!member.email || member.action === "Settled" || member.action === "Nudge Sent") return;
    setSendingId(member._id);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const hostName = userData.name || userData.fullName || "Your friend";

      await api.post("/nudge/send", {
        recipientName: member.name,
        recipientEmail: member.email,
        senderName: hostName,
        groupName: group?.name || "Split Group",
        amount: member.due || 0,
      });
      // Update local state
      setMembers((prev) =>
        prev.map((m) =>
          m._id === member._id
            ? { ...m, action: "Nudge Sent", actionStyle: "bg-zinc-100 text-slate-400" }
            : m
        )
      );
      toast.success(`Nudge sent to ${member.name}!`);
    } catch (err) {
      console.error("Failed to send nudge:", err);
      toast.error(`Failed to send nudge to ${member.name}`);
    } finally {
      setSendingId(null);
    }
  };

  const handleNudgeAll = async () => {
    setSendingAll(true);
    const pending = members.filter((m) => m.pending && m.action === "Anonymous Nudge");
    if (pending.length === 0) {
      toast("No pending members to nudge", { icon: "\u2139\uFE0F" });
      setSendingAll(false);
      return;
    }
    for (const member of pending) {
      await handleSendNudge(member);
    }
    toast.success(`Nudged ${pending.length} pending member${pending.length > 1 ? "s" : ""}!`);
    setSendingAll(false);
  };

  const settledCount = members.filter((m) => !m.pending).length;
  const totalCount = members.length;
  const pendingCount = totalCount - settledCount;
  const progressPct = totalCount > 0 ? Math.round((settledCount / totalCount) * 100) : 0;

  // Total Group Balance = total split amount, Settled = total paid so far
  const totalBalance = splitData?.totalAmount || members.reduce((sum, m) => sum + (m.share || 0), 0);
  const settledBalance = members.reduce((sum, m) => sum + (m.paid || 0), 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-100 flex items-center justify-center">
        <FaSpinner className="animate-spin text-4xl text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100">
      <TopBar />
      <SideBar />

      <main className="mx-auto max-w-6xl px-6 py-8 md:ml-56 md:px-8 md:pt-8 sm:mt-10">
        <section>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold text-slate-900">
                Awkwardness Shield
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-500">
                Let us do the heavy lifting. We&apos;ll send neutral reminders
                to your friends so you don&apos;t have to. Reminders are sent by
                BaadFaad, keeping things professional and stress-free.
              </p>
            </div>

            <div className="text-right">
              <p className="text-xs font-bold tracking-wider text-slate-400">
                GROUP PROGRESS
              </p>
              <p className="text-5xl font-bold text-emerald-500">{progressPct}%</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <article className="rounded-[1.8rem] border border-zinc-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Group Balance
              </p>
              <p className="mt-2 text-5xl font-bold text-slate-900">Rs. {totalBalance.toLocaleString()}</p>
            </article>

            <article className="rounded-[1.8rem] border border-zinc-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Settled So Far
              </p>
              <p className="mt-2 text-5xl font-bold text-emerald-500">Rs. {settledBalance.toLocaleString()}</p>
            </article>

            <article className="rounded-[1.8rem] border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <p>{settledCount} of {totalCount} Participants</p>
                <p>{pendingCount} Pending</p>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${progressPct}%` }} />
              </div>
            </article>
          </div>

          <article className="mt-5 rounded-[1.8rem] bg-slate-900 px-6 py-5 text-white">
            <div className="flex items-start gap-3">
              <FaCheckCircle className="mt-0.5 text-emerald-400" />
              <div>
                <p className="font-bold">Friendly Reminder Policy</p>
                <p className="mt-1 text-sm text-slate-300">
                  Nudges are sent by BaadFaad system accounts. The recipient
                  won&apos;t see who triggered the reminder, making it a neutral
                  experience for everyone.
                </p>
              </div>
            </div>
          </article>
        </section>

        <section className="mt-8">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl font-bold text-slate-900">Settlement Status</h2>
            <button
              type="button"
              onClick={handleNudgeAll}
              disabled={sendingAll}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-bold text-slate-900 disabled:opacity-50"
            >
              {sendingAll ? <FaSpinner className="animate-spin text-xs" /> : <FaPaperPlane className="text-xs" />}
              Nudge All Pending
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {members.map((member) => (
              <article
                key={member.name}
                className="rounded-[1.8rem] border border-emerald-100 bg-white px-5 py-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 text-slate-500">
                      <FaUserCircle />
                    </span>
                    <div>
                      <p className="font-bold text-slate-900">{member.name}</p>
                      <p
                        className={`text-xs ${
                          member.pending ? "text-amber-500" : "text-emerald-500"
                        }`}
                      >
                        {member.pending ? (
                          <>
                            <FaRegClock className="mr-1 inline text-[10px]" />
                            {member.status}
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="mr-1 inline text-[10px]" />
                            {member.status}
                          </>
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Amount
                      </p>
                      <p className="mt-1 text-3xl font-bold text-slate-900">
                        {member.amount}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`inline-flex items-center gap-1 rounded-full px-4 py-2 text-xs font-bold ${member.actionStyle}`}
                      disabled={member.action === "Settled" || member.action === "Nudge Sent" || sendingId === member._id}
                      onClick={() => handleSendNudge(member)}
                    >
                      {sendingId === member._id ? (
                        <FaSpinner className="animate-spin text-[10px]" />
                      ) : member.action !== "Settled" ? (
                        <FaUserSecret className="text-[10px]" />
                      ) : null}
                      {member.action}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <p className="mt-8 text-center text-xs text-slate-400">
          BaadFaad protects your social relationships by acting as the mediator.
          Reminders are formatted to be helpful system alerts, not demands.
        </p>
      </main>
    </div>
  );
}
