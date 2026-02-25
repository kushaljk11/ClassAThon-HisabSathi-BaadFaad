import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SideBar from "../../components/layout/Dashboard/SideBar";
import TopBar from "../../components/layout/Dashboard/TopBar";
import { FaSpinner, FaUsers, FaCheckCircle } from "react-icons/fa";
import api from "../../config/config";
import toast from "react-hot-toast";
import { useAuth } from "../../context/authContext";

export default function JoinSplit() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const currentUserId = user?._id || user?.id;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [joining, setJoining] = useState(false);

  const splitId = searchParams.get("splitId");
  const sessionId = searchParams.get("sessionId");
  const type = searchParams.get("type");

  useEffect(() => {
    // Auto-join if user is logged in and has sessionId
    if (currentUserId && sessionId) {
      handleJoin();
    }
  }, [currentUserId, sessionId]);

  const handleJoin = async () => {
    if (!sessionId) {
      toast.error("Invalid session link");
      return;
    }

    if (!currentUserId) {
      toast.error("You must be logged in to join a session");
      navigate("/login");
      return;
    }

    setJoining(true);
    const toastId = toast.loading("Joining session...");

    try {
      const payload = { userId: currentUserId };

      await api.post(`/session/join/${sessionId}`, payload);

      toast.dismiss(toastId);
      toast.success("Joined successfully!");

      // Navigate to the lobby
      navigate(`/split/joined?splitId=${splitId}&sessionId=${sessionId}&type=${type || 'session'}`);
    } catch (err) {
      console.error("Failed to join session:", err);
      toast.dismiss(toastId);
      toast.error(err.response?.data?.message || "Failed to join session");
    } finally {
      setJoining(false);
    }
  };

  if (joining) {
    return (
      <div className="flex min-h-screen bg-zinc-50">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
        <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="ml-0 flex-1 px-8 py-6 pt-24 md:ml-56 md:pt-6 sm:mt-12 flex items-center justify-center">
          <div className="text-center">
            <FaSpinner className="animate-spin text-5xl text-emerald-500 mx-auto mb-4" />
            <p className="text-xl font-semibold text-slate-700">Joining session...</p>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-zinc-50">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
        <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="ml-0 flex-1 px-8 py-6 pt-24 md:ml-56 md:pt-6 sm:mt-12 flex items-center justify-center">
          <div className="text-center">
            <p className="text-xl font-semibold text-slate-700 mb-4">You must be logged in to join a session</p>
            <button
              onClick={() => navigate("/login")}
              className="rounded-full bg-emerald-400 px-6 py-3 font-bold text-white hover:bg-emerald-500"
            >
              Go to Login
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 flex-1 px-8 py-6 pt-24 md:ml-56 md:pt-6 sm:mt-12">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <FaUsers className="text-3xl text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Join Split Session</h1>
            <p className="mt-2 text-base text-slate-500">
              Enter your details to join this split
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-6 rounded-xl bg-emerald-50 p-4">
              <p className="text-sm font-semibold text-emerald-800 mb-3">Joining as:</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Name:</span>
                  <span className="text-sm text-slate-900">{user?.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-600">Email:</span>
                  <span className="text-sm text-slate-900">{user?.email || "Not provided"}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleJoin}
              disabled={joining}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {joining ? (
                <>
                  <FaSpinner className="animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <FaCheckCircle />
                  Join Session
                </>
              )}
            </button>

            <p className="mt-4 text-center text-xs text-slate-400">
              You'll be added to the split session immediately
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
