import Footer from "../components/layout/Footer";
import Topbar from "../components/layout/Topbar";
import {
  FaArrowRight,
  FaBars,
  FaBell,
  FaBolt,
  FaCalculator,
  FaExchangeAlt,
  FaFireAlt,
  FaHistory,
  FaPlus,
  FaQrcode,
  FaShareAlt,
  FaShieldAlt,
  FaUtensils,
  FaVideo,
  FaWhatsapp,
  FaUsers,
  FaWallet,
} from "react-icons/fa";
import esewaLogo from "../assets/esewa.png";
import khaltiLogo from "../assets/khalti.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <Topbar />
      <main className="px-6 pb-16 pt-8 sm:px-10 lg:px-16">
        <section className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1 text-xs font-bold tracking-wider text-emerald-500">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              NOW AVAILABLE ACROSS NEPAL
            </div>

            <h1 className="text-5xl font-bold leading-tight text-slate-900 sm:text-6xl">
              Split Bills.
              <br />
              <span className="text-emerald-400">Not</span>
              <br />
              Friendships.
            </h1>

            <p className="mt-8 max-w-xl text-xl leading-relaxed text-slate-500">
              Seamless Bill Splitting & Payment Management System. The fastest
              way to divide group expenses in Nepal. No more Rs. 7 drama.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                className="rounded-full bg-emerald-400 px-8 py-4 text-2xl font-bold text-slate-900 shadow-lg shadow-emerald-300/60 transition hover:bg-emerald-300"
              >
                <span className="inline-flex items-center gap-2">
                  Start Splitting{" "}
                  <FaFireAlt className="text-xl text-yellow-400" />
                </span>
              </button>
              <button
                type="button"
                className="rounded-full bg-white px-8 py-4 text-2xl font-bold text-slate-800 transition hover:bg-slate-100"
              >
                See How It Works
              </button>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2">
                <span className="h-10 w-10 rounded-full border-2 border-zinc-100 bg-emerald-200" />
                <span className="h-10 w-10 rounded-full border-2 border-zinc-100 bg-stone-200" />
                <span className="h-10 w-10 rounded-full border-2 border-zinc-100 bg-green-300" />
              </div>
              <p className="text-lg font-medium text-slate-500">
                Joined by{" "}
                <span className="font-bold text-slate-700">10k+ groups</span>{" "}
                this month
              </p>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative rotate-[4deg] rounded-[2.5rem] border-8 border-slate-900 bg-slate-900 p-4 shadow-2xl">
              <div className="h-120 w-70 rounded-[1.8rem] bg-white p-4">
                <div className="mb-4 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    <FaBars />
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-slate-800">
                    Momo Night <FaUtensils className="text-[10px]" />
                  </span>
                  <span>
                    <FaBell />
                  </span>
                </div>

                <div className="rounded-2xl bg-zinc-50 p-4 text-center">
                  <p className="text-[10px] font-bold tracking-widest text-slate-400">
                    TOTAL BILL
                  </p>
                  <p className="text-4xl font-bold text-slate-900">Rs. 4,250</p>
                </div>

                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
                    <span className="font-semibold text-slate-700">Anish</span>
                    <span className="font-bold text-slate-800">Rs. 840</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2">
                    <span className="font-semibold text-slate-700">Sita</span>
                    <span className="font-bold text-emerald-400">PAID</span>
                  </div>
                  <div className="flex items-center justify-between rounded-2xl bg-green-100 border border-emerald-300 px-3 py-2">
                    <span className="font-semibold text-slate-700">
                      Rohan (You)
                    </span>
                    <span className="font-bold text-slate-900">Rs. 1,210</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-full bg-emerald-400 px-6 py-3 text-center text-sm font-bold text-slate-900">
                Settle Up Now
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Awakward section */}
      <section className="mx-auto mt-24 w-full  bg-white px-6 py-10 sm:px-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-4xl">
            The 10-Minute Awkward Ritual
          </h2>
          <p className="mt-4 text-xl text-slate-500">
            We&apos;ve all been there. The dinner is over, but the headache is
            just starting.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-4xl bg-zinc-200 p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-red-400">
              <FaCalculator className="text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Manual math confusion
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-slate-500">
              Calculating VAT and Service Charge while everyone stares at you.
              Stop the mental gymnastics.
            </p>
          </article>

          <article className="rounded-4xl bg-zinc-200 p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-orange-400">
              <FaWallet className="text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              One friend always overpays
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-slate-500">
              The person who paid shouldn&apos;t be the one chasing everyone for
              weeks. Balance the scales automatically.
            </p>
          </article>

          <article className="rounded-4xl bg-zinc-200 p-8">
            <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-blue-400">
              <FaExchangeAlt className="text-xl" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">
              Rs 7 change drama
            </h3>
            <p className="mt-4 text-lg leading-relaxed text-slate-500">
              &rdquo;Ma sanga 7 rupaiya chaina, 10 pathaidinxu hai?&rdquo; No
              more hunting for small change or awkward transfers.
            </p>
          </article>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto w-full bg-zinc-100 px-6 py-16 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">
                Designed for Real Tables{" "}
                <FaBolt className="inline text-amber-400" />
              </h2>
              <p className="mt-3 text-xl text-slate-500">
                Features that handle the social complexity of sharing costs.
              </p>
            </div>

            <a
              href="#features"
              className="inline-flex items-center gap-2 text-xl font-semibold text-emerald-400 hover:text-emerald-500"
            >
              View all features <FaArrowRight className="text-base" />
            </a>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-4xl border border-zinc-200 bg-white p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-400">
                <FaQrcode className="text-lg" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                Silent Split Mode
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Scan a single QR and everyone joins the room instantly. No
                typing numbers or search drama.
              </p>
            </article>

            <article className="rounded-4xl border border-zinc-200 bg-white p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-400">
                <FaCalculator className="text-lg" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                Smart Guilt Calculator
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Who owes what, with data. See group dynamics and who&apos;s
                historically the fastest payer.
              </p>
            </article>

            <article className="rounded-4xl border border-zinc-200 bg-white p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-400">
                <FaPlus className="text-lg" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                Round-Off Logic
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Automatically rounds to multiples of Rs 10. Fairly rotates who
                pays the extra 2-3 rupees.
              </p>
            </article>

            <article className="rounded-4xl border border-zinc-200 bg-white p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-400">
                <FaHistory className="text-lg" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                Last Time You Paid
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Never forget who covered the last round of chiya. Keeps a
                running tab for the whole squad.
              </p>
            </article>

            <article className="rounded-4xl border border-zinc-200 bg-white p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-400">
                <FaShieldAlt className="text-lg" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                Awkwardness Shield
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Send anonymous reminders to friends who forgot to pay. We play
                the bad guy, not you.
              </p>
            </article>

            <article className="rounded-4xl border border-zinc-200 bg-white p-8">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-400">
                <FaUsers className="text-lg" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900">
                Breakup Safe Mode
              </h3>
              <p className="mt-4 text-lg leading-relaxed text-slate-500">
                Instantly settle everything and clear the history with one tap.
                Clean slate for everyone involved.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="mx-auto w-full bg-linear-to-r from-slate-950 via-slate-900 to-emerald-950 px-6 py-20 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-white sm:text-5xl">
              3 Simple Steps to Harmony
            </h2>
            <p className="mt-4 text-lg text-slate-400">
              Because splitting should be as fast as eating.
            </p>
          </div>

          <div className="relative mt-14 grid grid-cols-1 gap-10 md:grid-cols-3">
            <div className="pointer-events-none absolute left-0 right-0 top-7 hidden border-t border-slate-700 md:block" />

            <article className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-4xl font-bold text-slate-950">
                1
              </div>
              <h3 className="text-4xl font-bold text-white">
                Snap or Enter Bill
              </h3>
              <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-slate-400">
                Take a photo of the restaurant bill or just type in the total
                amount manually.
              </p>
            </article>

            <article className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-4xl font-bold text-slate-950">
                2
              </div>
              <h3 className="text-4xl font-bold text-white">Select Items</h3>
              <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-slate-400">
                Invite friends via link or QR. Everyone taps the items they
                actually ate.
              </p>
            </article>

            <article className="relative text-center">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400 text-4xl font-bold text-slate-950">
                3
              </div>
              <h3 className="text-4xl font-bold text-white">
                Pay Clean Amount
              </h3>
              <p className="mx-auto mt-4 max-w-sm text-lg leading-relaxed text-slate-400">
                Pay your exact share instantly via integrated eSewa or Khalti
                wallets.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Payment facilties sections */}
      <section className="mx-auto w-full bg-zinc-100 px-6 py-12 sm:px-8 lg:px-16">
        <div className="mx-auto w-full max-w-6xl">
          <p className="text-center text-sm font-bold tracking-[0.35em] text-slate-500">
            POWERING INSTANT SETTLEMENTS WITH
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-10 sm:gap-14">
            <div className="flex items-center gap-3">
              <img
                src={esewaLogo}
                alt="eSewa"
                className="h-10 w-auto object-contain"
              />
              <p>Esewa</p>
            </div>

            <div className="flex items-center gap-3">
              <img
                src={khaltiLogo}
                alt="Khalti"
                className="h-10 w-auto object-contain"
              />
              <p>Khalti</p>
            </div>
          </div>
        </div>
      </section>

      {/* Whatsapp  */}
      <section className="mx-auto w-full bg-white  px-6 pb-16 pt-4 sm:px-8 lg:px-16">
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 items-center gap-10 rounded-[2.5rem] bg-emerald-100 px-8 py-10 shadow-sm lg:grid-cols-2 lg:px-14 lg:py-14">
          <div>
            <h2 className="text-5xl font-bold leading-tight text-slate-900 sm:text-6xl">
              Ready to kill the awkwardness?
            </h2>
            <p className="mt-6 max-w-xl text-2xl leading-relaxed text-slate-500">
              Share the split link directly to your WhatsApp group. No more
              &ldquo;Who owes how much?&rdquo; messages at 11 PM.
            </p>

            <button
              type="button"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-green-500 px-8 py-4 text-xl font-bold text-white transition hover:bg-green-600"
            >
              <FaShareAlt className="text-base" />
              Share on WhatsApp
            </button>
          </div>

          <div className="justify-self-center lg:justify-self-end ">
            <div className="w-full max-w-105 rounded-[1.8rem] bg-white p-5 shadow-xl shadow-emerald-200/60">
              <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                <div className="flex items-center gap-3">
                  <span className="h-12 w-12 rounded-full bg-zinc-200" />
                  <div>
                    <p className="text-lg font-bold text-slate-800">
                      Mandala Group 2026
                    </p>
                    <p className="text-xs text-emerald-500">online</p>
                  </div>
                </div>
                <FaVideo className="text-slate-400" />
              </div>

              <div className="mt-4 space-y-4 text-sm">
                <div className="max-w-[85%] rounded-2xl bg-zinc-100 px-4 py-3 text-slate-600">
                  Aaja ko dinner ko bill split gareko xu hai guys. Heram la!
                </div>

                <div className="rounded-2xl border border-emerald-300 bg-emerald-100 px-4 py-3">
                  <div className="mb-2 flex items-center justify-between text-sm font-bold text-slate-800">
                    <span>BaadFaad | Momo Night</span>
                    <FaWhatsapp className="text-emerald-500" />
                  </div>
                  <p className="text-xs text-slate-500">Your Share</p>
                  <div className="mt-1 flex items-center justify-between">
                    <p className="text-4xl font-bold text-slate-900">Rs. 5633</p>
                    <button
                      type="button"
                      className="rounded-full bg-emerald-400 px-4 py-1 text-xs font-bold text-white"
                    >
                      Pay Now
                    </button>
                  </div>
                </div>

                <div className="ml-auto w-fit rounded-full bg-zinc-100 px-4 py-2 text-sm text-slate-500">
                  Sent just now ✓✓
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
