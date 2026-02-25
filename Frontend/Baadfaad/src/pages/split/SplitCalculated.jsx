import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import {
  FaFire,
  FaReceipt,
  FaArchive,
  FaPlus,
  FaTimes,
  FaCalculator,
  FaSpinner,
} from "react-icons/fa";
import esewaLogo from "../../assets/esewa.png";
import khaltiLogo from "../../assets/khalti.png";
import api from "../../config/config";

export default function SplitCalculated() {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cleanRoundMode, setCleanRoundMode] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("esewa");
  const [tags, setTags] = useState(["Dinner", "Fuel", "Night Out", "Movies", "Travel"]);
  const [selectedTags, setSelectedTags] = useState(["Dinner"]);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newTag, setNewTag] = useState("");
  const [finishing, setFinishing] = useState(false);

  // Load split data from localStorage (saved by ScanBill) or fetch from API
  const [split, setSplit] = useState(null);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const storedSplit = localStorage.getItem("currentSplit");
    const storedSession = localStorage.getItem("currentSession");
    if (storedSplit) setSplit(JSON.parse(storedSplit));
    if (storedSession) setSession(JSON.parse(storedSession));
  }, []);

  // Derived from API data or fallback
  const totalAmount = split?.totalAmount || session?.totalAmount || 0;
  const breakdown = split?.breakdown || [];

  // Find the "big spender" — participant with highest amount
  const bigSpender = breakdown.length
    ? breakdown.reduce((max, b) => (b.amount > max.amount ? b : max), breakdown[0])
    : null;

  const participants = breakdown.map((b) => {
    const name = b.user?.name || b.participant?.name || "Participant";
    return {
      name,
      subtitle: bigSpender ? `Owes ${bigSpender.user?.name || bigSpender.participant?.name || "payer"}` : "",
      amount: cleanRoundMode ? Math.round(b.amount / 10) * 10 : b.amount,
      payment: selectedPayment === "esewa" ? "eSewa" : "Khalti",
      paymentColor:
        selectedPayment === "esewa"
          ? "bg-green-100 text-green-700"
          : "bg-purple-100 text-purple-700",
      avatar: "👤",
    };
  });

  const handleToggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddNewTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setSelectedTags([...selectedTags, newTag.trim()]);
      setNewTag("");
      setShowAddTag(false);
    }
  };

  const handleFinish = async () => {
    if (!split?._id) {
      navigate("/dashboard");
      return;
    }
    setFinishing(true);
    try {
      await api.post(`/splits/${split._id}/finalize`);
      // Clean up stored session data
      localStorage.removeItem("currentSession");
      localStorage.removeItem("currentSplit");
      localStorage.removeItem("currentReceipt");
      navigate("/dashboard");
    } catch (err) {
      console.error("Finalize failed:", err);
      navigate("/dashboard");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-zinc-50">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 flex-1 px-4 py-6 pt-24 md:ml-56 md:px-8 md:pt-8 sm:mt-10">
        <div className="mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">
                Split Calculated!
              </h1>
              <p className="mt-2 text-sm text-slate-500 md:text-base">
                Your group expenses are ready to be settled.
              </p>
            </div>
            <div className="w-full rounded-2xl border-2 border-emerald-400 bg-emerald-50 px-4 py-2 text-center md:w-auto md:px-5 md:py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Total Bill Amount
              </p>
              <p className="mt-1 text-xl font-bold text-slate-900 md:text-2xl">
                Rs. {totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Big Spender and Clean Round Mode - Side by Side */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:gap-6 lg:grid-cols-2">
            {/* Big Spender Card */}
            <div className="rounded-2xl border border-amber-200 bg-linear-to-br from-amber-50 to-orange-50 p-4 shadow-sm md:rounded-3xl md:p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-200 text-orange-600 md:h-12 md:w-12">
                  <FaFire className="text-xl md:text-2xl" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Big Spender <FaFire className="inline text-orange-500" />
                    </h3>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 md:text-sm">
                    {bigSpender ? `${bigSpender.user?.name || bigSpender.participant?.name || 'Someone'} paid Rs. ${bigSpender.amount.toLocaleString()}` : 'No data yet'}
                  </p>
                  <span className="mt-2 inline-block rounded-full bg-amber-200 px-2 py-1 text-xs font-bold uppercase tracking-wider text-amber-800 md:px-3">
                    VIP CONTRIBUTOR
                  </span>
                </div>
              </div>
            </div>

            {/* Clean Round Mode */}
            <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <FaCalculator className="text-emerald-600 text-lg" />
                    <h3 className="text-base font-bold text-slate-900">
                      Clean Round Mode
                    </h3>
                  </div>
                  <p className="mt-2 text-xs text-slate-500 md:text-sm">
                    Automatically round decimals to nearest 10 for easier calculations.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setCleanRoundMode(!cleanRoundMode)}
                  className={`relative h-8 w-14 shrink-0 rounded-full transition ${
                    cleanRoundMode ? "bg-emerald-400" : "bg-zinc-300"
                  }`}
                >
                  <div
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition ${
                      cleanRoundMode ? "right-1" : "left-1"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Tag This Outing */}
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
            <div className="mb-4 flex items-center gap-2">
              <FaReceipt className="text-slate-400" />
              <h2 className="text-base font-bold text-slate-900 md:text-lg">Tag This Outing</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleToggleTag(tag)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    selectedTags.includes(tag)
                      ? "bg-emerald-400 text-slate-900"
                      : "border border-zinc-300 bg-white text-slate-600 hover:bg-zinc-50"
                  }`}
                >
                  {tag}
                </button>
              ))}
              {!showAddTag ? (
                <button
                  type="button"
                  onClick={() => setShowAddTag(true)}
                  className="rounded-full border border-dashed border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-emerald-400 hover:text-emerald-600"
                >
                  + Add New
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleAddNewTag()}
                    placeholder="Tag name"
                    className="w-32 rounded-full border border-emerald-400 bg-white px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={handleAddNewTag}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-white transition hover:bg-emerald-500"
                  >
                    <FaPlus className="text-xs" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddTag(false);
                      setNewTag("");
                    }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-slate-600 transition hover:bg-zinc-300"
                  >
                    <FaTimes className="text-xs" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaReceipt className="text-slate-400" />
                <h2 className="text-base font-bold text-slate-900 md:text-lg">Payment Methods</h2>
              </div>
              <p className="text-xs font-semibold text-emerald-600 md:text-sm">
                Payable Amount: Rs. {totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setSelectedPayment("esewa")}
                className={`rounded-2xl border-2 py-6 text-center transition ${
                  selectedPayment === "esewa"
                    ? "border-green-400 bg-green-50"
                    : "border-zinc-200 bg-zinc-50 hover:border-green-300"
                }`}
              >
                <div className="mb-2 flex items-center justify-center">
                  <img src={esewaLogo} alt="eSewa" className="h-8 w-8 object-contain md:h-10 md:w-10" />
                </div>
                <p className="text-sm font-bold text-slate-900">eSewa</p>
              </button>
              <button
                type="button"
                onClick={() => setSelectedPayment("khalti")}
                className={`rounded-2xl border-2 py-6 text-center transition ${
                  selectedPayment === "khalti"
                    ? "border-purple-400 bg-purple-50"
                    : "border-zinc-200 bg-zinc-50 hover:border-purple-300"
                }`}
              >
                <div className="mb-2 flex items-center justify-center">
                  <img src={khaltiLogo} alt="Khalti" className="h-8 w-8 object-contain md:h-10 md:w-10" />
                </div>
                <p className="text-sm font-bold text-slate-900">Khalti</p>
              </button>
            </div>
            <button
              type="button"
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-slate-900 px-6 py-3 text-sm font-bold text-white transition hover:bg-slate-800 md:px-8 md:py-4 md:text-base"
            >
              ⚡ PROCEED TO PAY
            </button>
          </div>

          {/* Settlement Breakdown */}
          <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm md:rounded-3xl md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaReceipt className="text-slate-400" />
                <h2 className="text-base font-bold text-slate-900 md:text-lg">
                  Settlement Breakdown
                </h2>
              </div>
              <span className="text-xs font-semibold text-slate-500 md:text-sm">
                {participants.length} Participants
              </span>
            </div>
            <div className="space-y-2 md:space-y-3">
              {participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 md:px-4 md:py-3"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm md:h-10 md:w-10 md:text-lg">
                      {participant.avatar}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 md:text-sm">
                        {participant.name}
                      </p>
                      <p className="text-xs text-slate-500">{participant.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 md:flex-row md:items-center md:gap-3">
                    <p className="text-sm font-bold text-slate-900 md:text-base">
                      Rs. {participant.amount.toLocaleString()}
                    </p>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${participant.paymentColor}`}
                    >
                      {participant.payment}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Finish & Archive Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleFinish}
              disabled={finishing}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-6 py-3 text-base font-bold text-slate-900 shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500 md:px-8 md:py-4 md:text-lg disabled:opacity-50"
            >
              {finishing ? <FaSpinner className="animate-spin" /> : <FaArchive />}
              FINISH & ARCHIVE
            </button>
            <p className="mt-3 text-center text-xs text-slate-400">
              Archiving will save this split to your history and notify unpaid members.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
