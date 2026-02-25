import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import api from "../../config/config";

const COLORS = [
  { color: "bg-purple-200", textColor: "text-purple-700" },
  { color: "bg-pink-200", textColor: "text-pink-700" },
  { color: "bg-blue-200", textColor: "text-blue-700" },
  { color: "bg-teal-200", textColor: "text-teal-700" },
  { color: "bg-orange-200", textColor: "text-orange-700" },
  { color: "bg-rose-200", textColor: "text-rose-700" },
];

export default function SessionLobby() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [session, setSession] = useState(null);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem("currentSession");
    if (stored) {
      const parsed = JSON.parse(stored);
      setSession(parsed);
      fetchSession(parsed._id);

      // Poll every 3 seconds
      const interval = setInterval(() => fetchSession(parsed._id), 3000);
      return () => clearInterval(interval);
    }
  }, []);

  const fetchSession = async (sessionId) => {
    try {
      const res = await api.get(`/sessions/${sessionId}`);
      const s = res.data.session;
      setSession(s);
      localStorage.setItem("currentSession", JSON.stringify(s));
      setParticipants(
        (s.participants || []).map((p, i) => ({
          ...p,
          initial: p.name?.[0]?.toUpperCase() || "?",
          ...COLORS[i % COLORS.length],
        }))
      );
    } catch (err) {
      console.error("Failed to fetch session:", err);
    }
  };

  const handleContinueToScan = () => {
    navigate("/split/scan");
  };

  const handleLeave = () => {
    localStorage.removeItem("currentSession");
    navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      <main className="ml-0 flex-1 px-10 py-6 pt-24 md:ml-56 md:pt-6  sm:mt-10">
        <div className="mx-auto ">
          {/* Header Section */}
          <div className="mb-6">
            <h1 className="text-6xl font-bold text-slate-900">Everyone In?</h1>
            <p className="mt-2 text-base text-slate-500">
              Wait for everyone to join before you scan the bill QR.
            </p>
            <p className="mt-2 text-base text-slate-500">
              {" "}
              Session: <span className="font-bold text-slate-700">{session?.name || 'Loading...'}</span>
            </p>
          </div>

          {/* Main Card */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-xl bg-emerald-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Participants
                </p>
                <p className="text-lg font-bold text-emerald-600">{participants.length} Joined</p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Status
                </p>
                <p className="text-lg font-bold text-slate-900">{session?.status || 'waiting'}</p>
              </div>

              <div className="rounded-xl bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Session ID
                </p>
                <p className="text-lg font-bold text-slate-900">#{session?.code || '...'}</p>
              </div>
            </div>

            <div className="space-y-3">
              {participants.map((participant) => (
                <div
                  key={participant._id || participant.id}
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
              <button onClick={handleContinueToScan} className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2">
                Continue to Scan Bill
              </button>
              <button onClick={handleLeave} className="w-full rounded-xl bg-slate-900 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2">
                Leave Session
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
