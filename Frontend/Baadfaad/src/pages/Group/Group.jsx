import { FaPlus, FaArrowRight } from "react-icons/fa";
import TopBar from "../../components/layout/Dashboard/TopBar";
import SideBar from "../../components/layout/Dashboard/SideBar";

export default function Group() {
  return (
    <div className="min-h-screen bg-zinc-100">
      <TopBar />
      <SideBar />

      <main className="mx-auto max-w-6xl px-6 py-8 md:ml-56 md:px-8 md:pt-8 sm:mt-10">
        {/* Header */}
        <section>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Your Group</h1>
              <p className="mt-2 text-sm text-slate-500">
                Tracking items in real-time...
              </p>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Card */}
          {[
            {
              title: "Margherita Pizza",
              sub: "Italian Classic",
              price: "$18.00",
              img: "https://images.unsplash.com/photo-1604382355076-af4b0eb60143",
              shared: "4 shared",
            },
            {
              title: "Craft Beer",
              sub: "Local IPA",
              price: "$8.50",
              img: "https://images.unsplash.com/photo-1608270586620-248524c67de9",
              shared: "1 shared",
            },
            {
              title: "Truffle Fries",
              sub: "Parmesan & Parsley",
              price: "$12.00",
              img: "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a",
              shared: "3 shared",
            },
          ].map((item) => (
            <article key={item.title}>
              <div className="relative rounded-[1.8rem] bg-white p-4 shadow-sm">
                <span className="absolute right-6 top-6 rounded-full bg-white px-3 py-1 text-xs font-bold text-slate-700 shadow">
                  {item.price}
                </span>

                <img
                  src={item.img}
                  alt={item.title}
                  className="h-48 w-full rounded-xl object-cover"
                />
              </div>

              <h3 className="mt-4 text-lg font-bold text-slate-900">
                {item.title}
              </h3>
              <p className="text-sm text-slate-500">{item.sub}</p>

              <p className="mt-3 text-xs text-slate-400">{item.shared}</p>
            </article>
          ))}

          {/* Add Item Card */}
          <article className="flex flex-col items-center justify-center rounded-[1.8rem] border-2 border-dashed border-zinc-300 p-6 text-center text-slate-400 hover:border-emerald-400 hover:text-emerald-500 transition">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 text-lg">
              <FaPlus />
            </div>
            <p className="mt-3 text-sm font-semibold">Add New Item</p>
          </article>
        </section>

        {/* Bottom Summary */}
        <section className="mt-20">
          <div className="flex items-center justify-between rounded-full bg-slate-900 px-8 py-6 text-white shadow-lg">
            <div className="flex items-center gap-16">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Running Total
                </p>
                <p className="mt-1 text-2xl font-bold">$38.50</p>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Tax & Service (15%)
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-400">$5.78</p>
              </div>
            </div>

            <button className="flex items-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-sm font-bold text-slate-900 hover:bg-emerald-300 transition">
              Calculate Split
              <FaArrowRight className="text-xs" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
