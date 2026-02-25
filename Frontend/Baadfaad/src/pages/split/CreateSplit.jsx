import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import { FaReceipt, FaQrcode, FaSpinner } from "react-icons/fa";
import api from "../../config/config";
import { useAuth } from "../../context/authContext";

export default function CreateSplit() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      setError("Please enter a session name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/sessions", {
        name: sessionName.trim(),
        hostName: user?.name || "Host",
        hostEmail: user?.email || "",
      });
      const session = res.data.session;
      // Store session in localStorage so other pages can access it
      localStorage.setItem("currentSession", JSON.stringify(session));
      navigate("/split/ready");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!sessionName.trim()) {
      setError("Please enter a name");
      return;
    }
    setLoading(true);
    setError("");
    try {
      // Create a group, then a session linked to it
      const groupRes = await api.post("/groups", {
        name: sessionName.trim(),
        createdBy: user?._id || user?.id || "000000000000000000000000",
      });
      const group = groupRes.data.group;
      const sessionRes = await api.post("/sessions", {
        name: sessionName.trim(),
        hostName: user?.name || "Host",
        hostEmail: user?.email || "",
        groupId: group.id || group._id,
      });
      const session = sessionRes.data.session;
      localStorage.setItem("currentSession", JSON.stringify(session));
      navigate("/split/ready");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create group & session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="ml-0 flex-1 px-8 py-8 pt-24 md:ml-56 md:pt-8 sm:mt-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900">New Split Session</h1>
            <p className="mt-2 text-base text-slate-500">
              Organize your group expenses in seconds.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                <FaReceipt className="text-lg" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Start a New Session
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="sessionName"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Session Name
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <FaReceipt className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    id="sessionName"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g., Dinner at Thamel"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 pl-11 text-base text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-medium">{error}</p>
              )}

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCreateSession}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-8 py-4 text-base font-bold text-slate-900 shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin text-lg" /> : <FaQrcode className="text-lg" />}
                  Create Session & Generate QR
                </button>

                <button
                  type="button"
                  onClick={handleCreateGroup}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-400 bg-white px-8 py-4 text-base font-bold text-emerald-600 transition hover:bg-emerald-50 disabled:opacity-50"
                >
                  <FaQrcode className="text-lg" />
                  Create Group & Generate QR
                </button>
              </div>

              <p className="text-center text-sm text-slate-400">
                Clicking create will generate a unique QR code for others to scan and join instantly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
