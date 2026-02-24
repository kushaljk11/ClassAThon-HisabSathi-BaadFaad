import SideBar from "../../components/layout/Dashboard/SideBar";
import { FaArrowRight, FaCopy, FaQrcode } from "react-icons/fa";

export default function ReadyToSplit() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <SideBar />
      
      <main className="ml-0 flex-1 px-8 py-6 md:ml-56">
        <div className="mx-auto max-w-xl">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-slate-900">Ready to Split!</h1>
            <p className="mt-2 text-base text-slate-500">
              Ask your friends to scan this code to join the session instantly.
            </p>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 text-center">
              <span className="inline-block rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold tracking-wider text-emerald-600">
                ACTIVE SESSION
              </span>
              <h2 className="mt-3 text-2xl font-bold text-slate-900">
                Dinner at Trisara
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Total Amount: <span className="font-bold text-slate-900">Rs. 4,500</span>
              </p>
            </div>

            <div className="relative mx-auto w-fit">
              <div className="absolute -left-3 -top-3 h-8 w-8 border-l-4 border-t-4 border-emerald-400 rounded-tl-xl"></div>
              <div className="absolute -right-3 -top-3 h-8 w-8 border-r-4 border-t-4 border-emerald-400 rounded-tr-xl"></div>
              <div className="absolute -bottom-3 -left-3 h-8 w-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl"></div>
              <div className="absolute -bottom-3 -right-3 h-8 w-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl"></div>
              
              <div className="rounded-2xl bg-linear-to-br from-emerald-50 to-teal-50 p-6">
                <div className="rounded-xl bg-white p-4 shadow-md">
                  <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-lg bg-zinc-100">
                    <FaQrcode className="text-5xl text-slate-400" />
                  </div>
                  <p className="mt-3 text-center text-xs text-slate-400">
                    Scan to join this split session
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500"></span>
                <span className="font-semibold text-slate-600">Live Update</span>
              </div>
              <span className="font-bold text-emerald-600">1 Joined</span>
            </div>

            <div className="mt-5 text-center">
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="h-10 w-10 rounded-full bg-orange-200"></span>
                <span className="h-10 w-10 rounded-full border-2 border-dashed border-zinc-300 bg-zinc-50"></span>
              </div>
              <p className="text-sm text-slate-400">
                Waiting for your friends to scan...
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500"
            >
              Go to Live Split Room
              <FaArrowRight className="text-sm" />
            </button>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-8 py-3 text-sm font-semibold text-slate-600 transition hover:bg-zinc-50"
            >
              <FaCopy className="text-xs" />
              Copy Session Link
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
