import {
  FaCheckCircle,
  FaPaperPlane,
  FaRegClock,
  FaUserCircle,
  FaUserSecret,
} from "react-icons/fa";
import SideBar from "../../components/layout/Dashboard/SideBar";
import TopBar from "../../components/layout/Dashboard/TopBar";
const members = [
  {
    name: "Alex Rivera",
    status: "Fully Settled",
    amount: "$155.00",
    pending: false,
    action: "Settled",
    actionStyle: "bg-zinc-100 text-slate-400",
  },
  {
    name: "Sarah Jennings",
    status: "Pending Payment",
    amount: "$210.00",
    pending: true,
    action: "Anonymous Nudge",
    actionStyle: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Jordan Wu",
    status: "Pending Payment",
    amount: "$64.00",
    pending: true,
    action: "Nudge Sent",
    actionStyle: "bg-zinc-100 text-slate-400",
  },
  {
    name: "David Chen",
    status: "Pending Payment",
    amount: "$130.00",
    pending: true,
    action: "Anonymous Nudge",
    actionStyle: "bg-emerald-100 text-emerald-700",
  },
];

export default function Nudge() {
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
              <p className="text-5xl font-bold text-emerald-500">65%</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-3">
            <article className="rounded-[1.8rem] border border-zinc-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Total Group Balance
              </p>
              <p className="mt-2 text-5xl font-bold text-slate-900">$1,240.00</p>
            </article>

            <article className="rounded-[1.8rem] border border-zinc-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Settled So Far
              </p>
              <p className="mt-2 text-5xl font-bold text-emerald-500">$806.00</p>
            </article>

            <article className="rounded-[1.8rem] border border-zinc-200 bg-white p-5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                <p>8 of 12 Participants</p>
                <p>4 Pending</p>
              </div>
              <div className="mt-5 h-3 overflow-hidden rounded-full bg-zinc-100">
                <div className="h-full w-[65%] rounded-full bg-emerald-400" />
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
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 text-sm font-bold text-slate-900"
            >
              <FaPaperPlane className="text-xs" />
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
                      disabled={member.action === "Settled"}
                    >
                      {member.action !== "Settled" ? <FaUserSecret className="text-[10px]" /> : null}
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
