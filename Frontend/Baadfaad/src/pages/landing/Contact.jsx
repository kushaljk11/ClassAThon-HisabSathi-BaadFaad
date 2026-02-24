import {
  FaArrowRight,
  FaAt,
  FaEnvelope,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";
import Footer from "../../components/layout/landing/Footer";
import Topbar from "../../components/layout/landing/Topbar";

export default function Contact() {
  return (
    <div className="min-h-screen bg-linear-to-br from-emerald-50 via-zinc-50 to-violet-50 text-slate-900">
      <Topbar />

      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-6 pt-8 sm:px-10">

        <main className="grid flex-1 grid-cols-1 items-center gap-10 py-14 lg:grid-cols-[1fr_1fr]">
          <section>
            <span className="inline-flex rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold tracking-wider text-emerald-500">
              GET IN TOUCH
            </span>

            <h1 className="mt-6 text-6xl font-bold leading-tight text-slate-950">
              Let&apos;s talk
              <br />
              <span className="text-emerald-400">asap.</span>
            </h1>

            <p className="mt-6 max-w-md text-2xl leading-relaxed text-slate-500">
              Have a burning question or just want to say hi? We&apos;re all
              ears and ready to help you level up.
            </p>

            <button
              type="button"
              className="mt-10 flex w-full max-w-md items-center justify-between rounded-full bg-emerald-400 px-6 py-5 text-left shadow-lg shadow-emerald-200"
            >
              <span className="flex items-center gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-500 text-slate-900">
                  <FaWhatsapp />
                </span>
                <span>
                  <span className="block text-xs font-bold tracking-wide text-emerald-900/70">
                    DIRECT LINE
                  </span>
                  <span className="text-3xl font-bold text-white">
                    Ping us on WhatsApp
                  </span>
                </span>
              </span>
              <FaArrowRight className="text-xl text-slate-900" />
            </button>

            <div className="mt-5 flex w-full max-w-md items-center gap-4 rounded-full bg-white px-6 py-5 shadow-sm">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-zinc-100 text-slate-500">
                <FaEnvelope />
              </span>
              <span>
                <span className="block text-xs font-bold tracking-wide text-slate-400">
                  EMAIL SUPPORT
                </span>
                <span className="text-2xl font-semibold text-slate-900">
                  contact@baadfaad.com
                </span>
              </span>
            </div>

            <div className="mt-10 flex items-center gap-4">
              <p className="text-xs font-bold tracking-[0.2em] text-slate-400">
                FOLLOW US
              </p>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              >
                <FaAt className="text-xs" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              >
                <FaArrowRight className="rotate-180 text-xs" />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600"
              >
                <FaInstagram className="text-xs" />
              </button>
            </div>
          </section>

          <section className="rounded-4xl bg-white p-8 shadow-sm sm:p-10">
            <form className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-500">
                  Full Name
                </span>
                <input
                  type="text"
                  placeholder="Enter your name"
                  className="w-full rounded-full bg-zinc-100 px-5 py-4 text-sm text-slate-700 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-emerald-300"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-500">
                  Email Address
                </span>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full rounded-full bg-zinc-100 px-5 py-4 text-sm text-slate-700 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-emerald-300"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-500">
                  Message
                </span>
                <textarea
                  rows={4}
                  placeholder="Tell us what's on your mind..."
                  className="w-full resize-none rounded-[1.8rem] bg-zinc-100 px-5 py-4 text-sm text-slate-700 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:ring-emerald-300"
                />
              </label>

              <button
                type="submit"
                className="mt-3 w-full rounded-full bg-linear-to-r from-emerald-950 to-slate-900 px-8 py-5 text-lg font-bold text-white shadow-lg"
              >
                Send Message <span className="text-emerald-300">&gt;</span>
              </button>
            </form>

            <p className="mt-6 text-center text-xs font-medium text-slate-400">
              Average response time: &lt; 2 hours
            </p>
          </section>
        </main>

      </div>
      <Footer />
    </div>
  );
}
