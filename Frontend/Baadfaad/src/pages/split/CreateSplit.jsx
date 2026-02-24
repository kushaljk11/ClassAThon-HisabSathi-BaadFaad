import { useState } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import { FaReceipt, FaQrcode } from "react-icons/fa";

export default function CreateSplit() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCreateSession = () => {
    navigate("/split/scan");
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      
      <main className="ml-0 flex-1 px-8 py-8 pt-24 md:ml-56 md:pt-8">
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
                    placeholder="e.g., Dinner at Thamel"
                    className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 pl-11 text-base text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleCreateSession}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-8 py-4 text-base font-bold text-slate-900 shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500"
                >
                  <FaQrcode className="text-lg" />
                  Create Session & Generate QR
                </button>

                <button
                  type="button"
                  onClick={handleCreateSession}
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-emerald-400 bg-white px-8 py-4 text-base font-bold text-emerald-600 transition hover:bg-emerald-50"
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
