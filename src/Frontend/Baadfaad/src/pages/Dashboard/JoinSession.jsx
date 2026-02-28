/**
 * @fileoverview Join Session Page
 * @description Allows a user to join an existing bill-splitting session by
 *              entering or pasting a session ID. Validates the input and
 *              navigates to the split flow with the session context.
 *              Uses the Dashboard SideBar + TopBar layout.
 *
 * @module pages/Dashboard/JoinSession
 */
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/layout/Dashboard/SideBar";
import TopBar from "../../components/layout/Dashboard/TopBar";
import { FaLink, FaArrowRight } from "react-icons/fa";
import toast from "react-hot-toast";

export default function JoinSession() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [sessionLink, setSessionLink] = useState("");

  const handleJoinSession = () => {
    if (!sessionLink.trim()) {
      toast.error("Please enter a session link");
      return;
    }

    try {
      // Parse the link to extract splitId and sessionId
      const url = new URL(sessionLink);
      const splitId = url.searchParams.get("splitId");
      const sessionId = url.searchParams.get("sessionId");
      const type = url.searchParams.get("type") || "session";

      if (!splitId || !sessionId) {
        toast.error("Invalid session link. Please check the link and try again.");
        return;
      }

      // Navigate to appropriate join path: group links require group join
      if (url.searchParams.get('groupId') || type === 'group') {
        navigate(`/group/join?groupId=${url.searchParams.get('groupId') || ''}&splitId=${splitId}`);
      } else {
        navigate(`/session/join?splitId=${splitId}&sessionId=${sessionId}`);
      }
    } catch (err) {
      toast.error("Invalid link format. Please paste a valid session link.");
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 flex-1 px-8 py-6 pt-24 md:ml-56 md:pt-6 sm:mt-12">
        <div className="mx-auto max-w-md">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <FaLink className="text-3xl text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900">Join Split Session</h1>
            <p className="mt-2 text-base text-slate-500">
              Paste the session link you received to join
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <label htmlFor="sessionLink" className="block text-sm font-semibold text-slate-700 mb-2">
                  Session Link
                </label>
                <input
                  type="text"
                  id="sessionLink"
                  value={sessionLink}
                  onChange={(e) => setSessionLink(e.target.value)}
                  placeholder="https://example.com/session/join?splitId=... or https://example.com/group/join?groupId=..."
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <button
                type="button"
                onClick={handleJoinSession}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500"
              >
                Continue
                <FaArrowRight className="text-sm" />
              </button>
            </div>

            <div className="mt-6 rounded-xl bg-zinc-50 p-4">
              <p className="text-xs font-semibold text-slate-600 mb-2">How to join:</p>
              <ol className="text-xs text-slate-500 space-y-1 list-decimal list-inside">
                <li>Ask the host to share the session link</li>
                <li>Paste the link in the field above</li>
                <li>Click Continue to join the split</li>
              </ol>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
