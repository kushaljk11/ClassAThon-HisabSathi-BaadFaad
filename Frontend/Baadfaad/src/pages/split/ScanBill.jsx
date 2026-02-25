import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import SideBar from "../../components/layout/dashboard/SideBar";
import TopBar from "../../components/layout/dashboard/TopBar";
import { FaCloudUploadAlt, FaCamera, FaCheckCircle, FaPlusCircle, FaTrash, FaSpinner } from "react-icons/fa";
import api from "../../config/config";
import { useAuth } from "../../context/authContext";
import useSessionSocket, { emitHostNavigate, emitItemsUpdate } from "../../hooks/useSessionSocket";

export default function ScanBill() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scannedData, setScannedData] = useState(null);
  const [manualItems, setManualItems] = useState([]);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("1");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [session, setSession] = useState(null);
  const [isHost, setIsHost] = useState(false);

  const splitId = searchParams.get("splitId");
  const sessionId = searchParams.get("sessionId");
  const type = searchParams.get("type");
  const groupId = searchParams.get("groupId");

  const normalizeId = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value._id) return String(value._id);
      if (value.id) return String(value.id);
      if (typeof value.toString === "function") return value.toString();
    }
    return String(value);
  };

  // Fetch session to determine host
  useEffect(() => {
    if (!sessionId) return;
    api.get(`/session/${sessionId}`).then((res) => {
      setSession(res.data);
      const currentUserId = normalizeId(user?._id || user?.id);
      const currentEmail = (user?.email || "").trim().toLowerCase();
      const firstP = res.data?.participants?.[0];
      if (firstP) {
        const hostId = normalizeId(firstP.user || firstP.participant || firstP._id);
        const hostEmail = (firstP.email || "").trim().toLowerCase();
        setIsHost(
          (!!currentUserId && hostId === currentUserId) ||
          (!!currentEmail && !!hostEmail && hostEmail === currentEmail)
        );
      }
    }).catch(() => {});
  }, [sessionId, user]);

  // Socket: listen for host-navigate (participants follow host)
  const handleHostNavigate = useCallback((data) => {
    if (data.path) navigate(data.path);
  }, [navigate]);

  // Socket: listen for live item updates from host
  const handleItemsUpdate = useCallback((data) => {
    if (data.scannedData !== undefined) setScannedData(data.scannedData);
    if (data.manualItems !== undefined) setManualItems(data.manualItems);
  }, []);

  useSessionSocket(sessionId, null, handleHostNavigate, handleItemsUpdate);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      simulateScan();
    }
  };

  const simulateScan = () => {
    setIsProcessing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsProcessing(false);
          const data = {
            restaurant: "GUSTO ITALIANO",
            address: "125 Pasta Lane, Roma NY",
            items: [
              { name: "2x Margherita Pizza", price: 28.0 },
              { name: "1x Calamari Fritti", price: 14.5 },
              { name: "3x Peroni Draft", price: 21.0 },
            ],
            total: 63.5,
          };
          setScannedData(data);
          if (sessionId) emitItemsUpdate(sessionId, data, manualItems);
          return 100;
        }
        return prev + 5;
      });
    }, 100);
  };

  const handleCameraCapture = () => {
    // Simulate camera capture
    simulateScan();
  };

  const handleAddManualItem = () => {
    if (itemName.trim() && itemPrice && itemQuantity) {
      const newItem = {
        name: `${itemQuantity}x ${itemName.trim()}`,
        price: parseFloat(itemPrice) * parseInt(itemQuantity),
        quantity: parseInt(itemQuantity),
        unitPrice: parseFloat(itemPrice),
      };
      const updated = [...manualItems, newItem];
      setManualItems(updated);
      setItemName("");
      setItemPrice("");
      setItemQuantity("1");
      if (sessionId) emitItemsUpdate(sessionId, scannedData, updated);
    }
  };

  const handleRemoveManualItem = (index) => {
    const updated = manualItems.filter((_, i) => i !== index);
    setManualItems(updated);
    if (sessionId) emitItemsUpdate(sessionId, scannedData, updated);
  };

  const calculateTotal = () => {
    const scannedTotal = scannedData ? scannedData.total : 0;
    const manualTotal = manualItems.reduce((sum, item) => sum + item.price, 0);
    return scannedTotal + manualTotal;
  };

  const handleContinue = async () => {
    if (!splitId) {
      setError("No split ID found. Please start from the beginning.");
      return;
    }

    // Build all items from scanned + manual
    const allItems = [
      ...(scannedData?.items || []).map((item) => ({
        name: item.name,
        price: item.price,
        quantity: 1,
      })),
      ...manualItems.map((item) => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
    ];

    const totalAmount = calculateTotal();

    setSaving(true);
    setError("");
    try {
      // Create receipt in backend database
      const receiptRes = await api.post("/receipts", {
        restaurant: scannedData?.restaurant || "",
        address: scannedData?.address || "",
        items: allItems,
        totalAmount,
      });

      // Update the existing split with receipt, totalAmount + sessionId for participant breakdown
      await api.put(`/splits/${splitId}`, {
        receiptId: receiptRes.data.receipt._id,
        totalAmount,
        splitType: "equal",
        sessionId,
      });

      // Navigate with IDs - data is in database
      const path = `/split/breakdown?splitId=${splitId}&sessionId=${sessionId}&type=${type}${groupId ? `&groupId=${groupId}` : ''}`;
      if (sessionId) emitHostNavigate(sessionId, path);
      navigate(path);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save receipt and calculate split");
    } finally {
      setSaving(false);
    }
  };

  // ─── Shared bill preview component ───
  const BillPreview = () => (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      {!scannedData && manualItems.length === 0 ? (
        <div className="flex h-full min-h-60 flex-col items-center justify-center text-center">
          <div className="mb-4 h-20 w-20 rounded-full bg-zinc-100"></div>
          <p className="text-sm font-semibold text-slate-400">
            {isHost ? "Receipt preview will appear here" : "Waiting for host to add items..."}
          </p>
        </div>
      ) : (
        <div>
          {scannedData && (
            <>
              <div className="mb-6 border-b border-zinc-200 pb-4 text-center">
                <h3 className="text-lg font-bold text-slate-900">{scannedData.restaurant}</h3>
                <p className="text-xs text-slate-500">{scannedData.address}</p>
              </div>
              <div className="space-y-3">
                {scannedData.items.map((item, index) => (
                  <div key={index} className="flex items-start justify-between text-sm">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {manualItems.length > 0 && (
            <>
              {scannedData && (
                <div className="my-4 border-t border-zinc-200 pt-4">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Manual Items</p>
                </div>
              )}
              {!scannedData && (
                <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Items</p>
              )}
              <div className="space-y-3">
                {manualItems.map((item, index) => (
                  <div key={index} className="flex items-start justify-between text-sm">
                    <span className="text-slate-700">{item.name}</span>
                    <span className="font-semibold text-slate-900">${item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="mt-6 border-t border-emerald-200 bg-emerald-50 px-4 py-3 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-slate-900">TOTAL</span>
              <span className="text-lg font-bold text-slate-900">${calculateTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // ─── Participant (non-host) view ───
  if (!isHost) {
    return (
      <div className="flex min-h-screen bg-zinc-50">
        <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
        <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <main className="ml-0 flex-1 px-8 py-8 pt-24 md:ml-56 md:pt-8 sm:mt-10">
          <div className="mx-auto max-w-xl">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-slate-900">Bill in Progress</h1>
              <p className="mt-2 text-base text-slate-500">
                The host is adding items to the bill. You'll see them appear here in real time.
              </p>
            </div>

            <BillPreview />

            <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-zinc-100 py-4 text-sm font-semibold text-slate-500">
              <FaSpinner className="animate-spin" />
              Waiting for host to calculate the split...
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ─── Host view (full edit controls) ───
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <TopBar onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} isOpen={isMobileMenuOpen} />
      <SideBar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <main className="ml-0 flex-1 px-8 py-8 pt-24 md:ml-56 md:pt-8 sm:mt-10">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Scan Your Bill</h1>
            <p className="mt-2 text-base text-slate-500">
              Upload a photo of your receipt or add items manually.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upload Section */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
              <label
                htmlFor="fileUpload"
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 bg-zinc-50 px-6 py-16 transition hover:border-emerald-400 hover:bg-emerald-50/30"
              >
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
                  <FaCloudUploadAlt className="text-3xl" />
                </div>
                <p className="text-lg font-bold text-slate-900">Upload or Drag & Drop</p>
                <p className="mt-2 text-sm text-slate-500">Supports JPG, PNG and PDF receipts</p>
                <input
                  id="fileUpload"
                  type="file"
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>

              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-zinc-200"></div>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">or</span>
                <div className="h-px flex-1 bg-zinc-200"></div>
              </div>

              <button
                type="button"
                onClick={handleCameraCapture}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition hover:bg-zinc-50"
              >
                <FaCamera className="text-lg" />
                Camera Capture
              </button>

              {isProcessing && (
                <div className="mt-8">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <FaCheckCircle className="animate-pulse text-emerald-500" />
                      <span className="font-semibold text-slate-700">Processing Receipt...</span>
                    </div>
                    <span className="font-bold text-emerald-600">{progress}% Complete</span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-zinc-200">
                    <div
                      className="h-full rounded-full bg-linear-to-r from-emerald-400 to-teal-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            {/* Preview Section */}
            <BillPreview />
          </div>

          {/* Manual Entry Section */}
          <div className="mt-6 rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">Add Items Manually</h2>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-600">OPTIONAL</span>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
              <div className="md:col-span-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Item Name</label>
                <input
                  type="text"
                  value={itemName}
                  onChange={(e) => setItemName(e.target.value)}
                  placeholder="e.g., Pizza"
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Quantity</label>
                <input
                  type="number"
                  value={itemQuantity}
                  onChange={(e) => setItemQuantity(e.target.value)}
                  min="1"
                  placeholder="1"
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="md:col-span-3">
                <label className="mb-2 block text-sm font-semibold text-slate-700">Price ($)</label>
                <input
                  type="number"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="w-full rounded-xl border border-zinc-300 bg-zinc-50 px-4 py-3 text-base text-slate-900 placeholder-slate-400 transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              <div className="md:col-span-1 md:self-end">
                <button
                  type="button"
                  onClick={handleAddManualItem}
                  className="flex h-12 w-full items-center justify-center rounded-xl bg-emerald-400 text-white transition hover:bg-emerald-500"
                  title="Add Item"
                >
                  <FaPlusCircle className="text-xl" />
                </button>
              </div>
            </div>

            {manualItems.length > 0 && (
              <div className="mt-6 space-y-2">
                <p className="text-sm font-semibold text-slate-700">Added Items:</p>
                {manualItems.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3"
                  >
                    <div className="flex-1">
                      <span className="text-sm font-medium text-slate-900">{item.name}</span>
                      <span className="ml-2 text-xs text-slate-500">
                        (${item.unitPrice?.toFixed(2) || "0.00"} each)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-900">${item.price.toFixed(2)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveManualItem(index)}
                        className="text-red-500 transition hover:text-red-600"
                        title="Remove Item"
                      >
                        <FaTrash className="text-sm" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Continue Button */}
          <div className="mt-6">
            {error && (
              <p className="mb-3 text-sm text-red-500 font-medium text-center">{error}</p>
            )}
            <button
              type="button"
              onClick={handleContinue}
              disabled={saving || (!scannedData && manualItems.length === 0)}
              className="w-full rounded-full bg-emerald-400 px-8 py-4 text-lg font-bold text-white shadow-lg shadow-emerald-300/40 transition hover:bg-emerald-500 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {saving ? <FaSpinner className="animate-spin" /> : null}
              Calculate Split
            </button>
            {!scannedData && manualItems.length === 0 && (
              <p className="mt-2 text-center text-sm text-slate-400">Add at least one item to continue</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}