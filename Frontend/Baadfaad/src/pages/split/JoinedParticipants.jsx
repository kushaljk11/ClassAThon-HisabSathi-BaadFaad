import SideBar from "../../components/layout/Dashboard/SideBar";

export default function SessionLobby() {
  // Mock data matching the participant list in the screenshot
  const participants = [
    {
      id: 1,
      name: "Aman Gupta",
      initial: "A",
      color: "bg-purple-200",
      textColor: "text-purple-700",
      isHost: true,
    },
    {
      id: 2,
      name: "Priya Sharma",
      initial: "P",
      color: "bg-pink-200",
      textColor: "text-pink-700",
      isHost: false,
    },
    {
      id: 3,
      name: "Rahul Verma",
      initial: "R",
      color: "bg-blue-200",
      textColor: "text-blue-700",
      isHost: false,
    },
    {
      id: 4,
      name: "Sneha Patel",
      initial: "S",
      color: "bg-teal-200",
      textColor: "text-teal-700",
      isHost: false,
    },
    {
      id: 5,
      name: "Vikram Singh",
      initial: "V",
      color: "bg-orange-200",
      textColor: "text-orange-700",
      isHost: false,
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <SideBar />
      <main className="ml-64 flex-1 px-10 py-6">
        <div className="mx-auto ">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-slate-900">Everyone In?</h1>
            <p className="mt-2 text-base text-slate-500">
              Wait for everyone to join before you scan the bill QR.
            </p>
            <p className="mt-2 text-base text-slate-500">
              {" "}
              You can share the session ID with your friends to invite them to
              join this split session.
            </p>
          </div>

          {/* Main Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Participants
                </p>
                <p className="text-lg font-bold text-emerald-600">5 Joined</p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Pending invitations
                </p>
                <p className="text-lg font-bold text-slate-900">2</p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Session ID
                </p>
                <p className="text-lg font-bold text-slate-900">#BF - 9021</p>
              </div>
            </div>

            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${participant.color}`}
                    >
                      <span
                        className={`text-sm font-bold ${participant.textColor}`}
                      >
                        {participant.initial}
                      </span>
                    </span>
                    <p className="font-semibold text-slate-900">
                      {participant.name}
                    </p>
                  </div>

                  {participant.isHost && (
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                      Host
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 space-y-3">
              <button className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                Continue to Scan Bill
              </button>
              <button className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                Leave Session
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
