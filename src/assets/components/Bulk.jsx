import { useEffect, useRef, useState, useCallback } from "react";
import QRCodeStyling from "qr-code-styling";
import JSZip from "jszip";
import { MdDownload, MdClear, MdPlayArrow, MdList, MdGridView, MdClose } from "react-icons/md";
import { HiSparkles } from "react-icons/hi2";

// ─── Parse bulk input into an array of strings ──────────────────────────────
function parseBulkInput(raw) {
  const text = raw.trim();
  if (!text) return [];

  const results = new Set();

  // Split by newlines and commas
  const parts = text.split(/[\n,]+/).map(s => s.trim()).filter(Boolean);

  for (const part of parts) {
    // Range detection: prefix + padded-number TO prefix + padded-number
    // e.g.  a001-a123  |  A001 to A999  |  001-050  |  item001-item010
    const rangeMatch = part.match(
      /^([a-zA-Z]*)(\d+)\s*(?:-|to)\s*([a-zA-Z]*)(\d+)$/i
    );
    if (rangeMatch) {
      const [, prefixA, numA, prefixB, numB] = rangeMatch;
      const prefix = prefixA || prefixB;
      const start  = parseInt(numA, 10);
      const end    = parseInt(numB, 10);
      const pad    = numA.length; // preserve leading zeros
      if (!isNaN(start) && !isNaN(end)) {
        const lo = Math.min(start, end);
        const hi = Math.max(start, end);
        if (hi - lo > 5000) {
          // safety cap
          for (let i = lo; i <= lo + 5000; i++)
            results.add(prefix + String(i).padStart(pad, "0"));
        } else {
          for (let i = lo; i <= hi; i++)
            results.add(prefix + String(i).padStart(pad, "0"));
        }
      }
      continue;
    }

    // Plain value
    if (part.length > 0) results.add(part);
  }

  return [...results];
}

// ─── Generate a single QR as PNG blob ───────────────────────────────────────
async function generateQRBlob(data, options = {}) {
  const size = options.size || 400;
  const qr = new QRCodeStyling({
    width: size, height: size,
    data,
    dotsOptions:       { color: options.dotColor || "#111827", type: options.dotStyle || "square" },
    backgroundOptions: { color: options.bgColor  || "#ffffff" },
    qrOptions:         { errorCorrectionLevel: "M" },
    imageOptions:      { crossOrigin: "anonymous", margin: 4 },
  });
  const blob = await qr.getRawData("png");
  return blob;
}

// ─── BulkQR component ────────────────────────────────────────────────────────
export default function Bulk() {
  const [inputText,  setInputText]  = useState("a001-a010");
  const [parsed,     setParsed]     = useState([]);
  const [parseError, setParseError] = useState("");
  const [previews,   setPreviews]   = useState([]);   // { value, url }
  const [generating, setGenerating] = useState(false);
  const [progress,   setProgress]   = useState(0);
  const [viewMode,   setViewMode]   = useState("grid"); // grid | list
  const [dotColor,   setDotColor]   = useState("#111827");
  const [bgColor,    setBgColor]    = useState("#ffffff");
  const [dotStyle,   setDotStyle]   = useState("square");
  const [qrSize,     setQrSize]     = useState(400);
  const [statusMsg,  setStatusMsg]  = useState("");
  const abortRef = useRef(false);

  // ── Parse preview whenever input changes ──────────────────────────────────
  useEffect(() => {
    const items = parseBulkInput(inputText);
    setParsed(items);
    if (items.length === 0 && inputText.trim()) {
      setParseError("No valid items found.");
    } else {
      setParseError("");
    }
  }, [inputText]);

  // ── Generate all previews ─────────────────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    if (parsed.length === 0) return;
    abortRef.current = false;
    setGenerating(true);
    setProgress(0);
    setPreviews([]);
    setStatusMsg("Generating QR codes…");

    const result = [];
    for (let i = 0; i < parsed.length; i++) {
      if (abortRef.current) break;
      const value = parsed[i];
      try {
        const blob = await generateQRBlob(value, { dotColor, bgColor, dotStyle, size: 200 });
        const url  = URL.createObjectURL(blob);
        result.push({ value, url, blob });
      } catch (e) {
        result.push({ value, url: null, blob: null, error: true });
      }
      setProgress(Math.round(((i + 1) / parsed.length) * 100));
    }

    setPreviews(result);
    setGenerating(false);
    setStatusMsg(abortRef.current ? "Cancelled." : `✓ ${result.length} QR codes ready`);
  }, [parsed, dotColor, bgColor, dotStyle]);

  // ── Download ZIP ──────────────────────────────────────────────────────────
  const handleDownloadZip = useCallback(async () => {
    if (previews.length === 0) return;
    setStatusMsg("Packaging ZIP…");
    const zip   = new JSZip();
    const folder = zip.folder("qr-codes");

    // Re-generate at full resolution for download
    for (let i = 0; i < previews.length; i++) {
      const { value } = previews[i];
      try {
        const blob = await generateQRBlob(value, { dotColor, bgColor, dotStyle, size: qrSize });
        folder.file(`${value}.png`, blob);
      } catch (_) { /* skip */ }
      setProgress(Math.round(((i + 1) / previews.length) * 100));
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = "qr-codes.zip";
    link.click();
    setStatusMsg(`✓ Downloaded ${previews.length} QR codes`);
  }, [previews, dotColor, bgColor, dotStyle, qrSize]);

  const handleCancel = () => { abortRef.current = true; };
  const handleClear  = () => {
    setPreviews([]);
    setParsed([]);
    setInputText("");
    setStatusMsg("");
    setProgress(0);
  };

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition";

  const DOT_STYLES = ["square","dots","rounded","classy","classy-rounded","extra-rounded"];

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-400 px-4 py-10">
      <div className="w-full max-w-5xl flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
            <HiSparkles className="text-amber-400" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Bulk QR Generator</h1>
            <p className="text-slate-700 text-sm font-medium">Generate series, lists, and download as ZIP</p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">

          {/* ── LEFT: Controls ─────────────────────────────────────────── */}
          <div className="w-full lg:w-80 flex flex-col gap-4">

            {/* Input */}
            <div className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100 flex flex-col gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Input Format</p>
                <div className="flex flex-col gap-1.5 text-xs text-slate-500 bg-slate-50 rounded-xl p-3 font-mono">
                  <span><span className="text-amber-600 font-bold">Series:</span>  a001-a020 <span className="text-slate-300">or</span> a001 to a020</span>
                  <span><span className="text-amber-600 font-bold">List:</span>    a001,a002,a003</span>
                  <span><span className="text-amber-600 font-bold">Mixed:</span>   one per line or comma</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Values</p>
                  {parsed.length > 0 && (
                    <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {parsed.length} items
                    </span>
                  )}
                </div>
                <textarea
                  value={inputText}
                  onChange={e => setInputText(e.target.value)}
                  placeholder={"a001-a050\nor\ncode01,code02,code03"}
                  rows={6}
                  className={`${inputCls} resize-none font-mono text-xs`}
                />
                {parseError && <p className="text-xs text-red-400 mt-1">{parseError}</p>}
              </div>

              {/* Quick examples */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "001–020",   val: "001-020" },
                  { label: "a001–a123", val: "a001-a123" },
                  { label: "CSV list",  val: "QR001,QR002,QR003,QR004,QR005" },
                  { label: "Mixed",     val: "ITEM001-ITEM005\nSPECIAL,VIP" },
                ].map(ex => (
                  <button key={ex.label} onClick={() => setInputText(ex.val)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[10px] font-bold hover:bg-amber-100 hover:text-amber-800 transition-all">
                    {ex.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Style options */}
            <div className="bg-white rounded-3xl shadow-xl p-5 border border-slate-100 flex flex-col gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style</p>

              <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dot Color</span>
                  <input type="color" value={dotColor} onChange={e => setDotColor(e.target.value)}
                    className="w-full h-9 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5" />
                </label>
                <label className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Background</span>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-full h-9 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5" />
                </label>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dot Style</p>
                <div className="flex flex-wrap gap-1.5">
                  {DOT_STYLES.map(s => (
                    <button key={s} onClick={() => setDotStyle(s)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-black border-2 transition-all capitalize
                        ${dotStyle === s
                          ? "bg-slate-900 text-white border-slate-900"
                          : "bg-white text-slate-400 border-slate-200 hover:border-slate-400"}`}>
                      {s.replace("-", " ")}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Export Size</p>
                  <span className="text-xs font-black text-slate-400">{qrSize}px</span>
                </div>
                <input type="range" min={200} max={1200} step={100} value={qrSize}
                  onChange={e => setQrSize(+e.target.value)}
                  className="w-full accent-amber-500" />
                <div className="flex justify-between text-[9px] text-slate-300 mt-0.5">
                  <span>200</span><span>1200</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <button onClick={handleGenerate}
                disabled={generating || parsed.length === 0}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-slate-900 text-white text-sm font-black tracking-wide shadow-lg hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:-translate-y-0.5 active:translate-y-0 transition-all">
                <MdPlayArrow size={20} />
                {generating ? `Generating… ${progress}%` : `Generate ${parsed.length > 0 ? parsed.length : ""} QR Codes`}
              </button>

              {previews.length > 0 && (
                <button onClick={handleDownloadZip}
                  disabled={generating}
                  className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-amber-400 text-slate-900 text-sm font-black shadow hover:bg-amber-300 hover:-translate-y-0.5 transition-all disabled:opacity-40">
                  <MdDownload size={20} />
                  Download ZIP ({previews.length})
                </button>
              )}

              {generating && (
                <button onClick={handleCancel}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-red-50 text-red-500 border-2 border-red-200 text-sm font-black hover:bg-red-100 transition-all">
                  <MdClose size={16} /> Cancel
                </button>
              )}

              {previews.length > 0 && !generating && (
                <button onClick={handleClear}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-sm font-black hover:bg-slate-200 transition-all">
                  <MdClear size={16} /> Clear All
                </button>
              )}
            </div>

            {/* Status */}
            {statusMsg && (
              <p className={`text-center text-xs font-bold px-3 py-2 rounded-xl
                ${statusMsg.startsWith("✓") ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-500"}`}>
                {statusMsg}
              </p>
            )}
          </div>

          {/* ── RIGHT: Preview Grid ─────────────────────────────────────── */}
          <div className="flex-1 flex flex-col gap-3">

            {/* Toolbar */}
            {(previews.length > 0 || generating) && (
              <div className="flex items-center justify-between bg-white rounded-2xl px-4 py-2.5 shadow border border-slate-100">
                <span className="text-xs font-black text-slate-500">
                  {generating ? `${progress}% — generating…` : `${previews.length} QR codes`}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:text-slate-600"}`}>
                    <MdGridView size={16} />
                  </button>
                  <button onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-amber-100 text-amber-700" : "text-slate-400 hover:text-slate-600"}`}>
                    <MdList size={16} />
                  </button>
                </div>
              </div>
            )}

            {/* Progress bar */}
            {generating && (
              <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }} />
              </div>
            )}

            {/* Empty state */}
            {previews.length === 0 && !generating && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center">
                  <HiSparkles className="text-slate-300" size={32} />
                </div>
                <p className="text-slate-400 font-bold text-sm">Enter values and click Generate</p>
                <p className="text-slate-300 text-xs">Supports ranges like a001–a999 and CSV lists</p>
              </div>
            )}

            {/* Preview items */}
            {previews.length > 0 && (
              <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-4 overflow-y-auto max-h-[70vh]">
                <div className={
                  viewMode === "grid"
                    ? "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3"
                    : "flex flex-col gap-2"
                }>
                  {previews.map(({ value, url, error }) =>
                    viewMode === "grid" ? (
                      <div key={value}
                        className="flex flex-col items-center gap-1.5 p-2 rounded-2xl border-2 border-slate-100 hover:border-amber-300 hover:bg-amber-50 transition-all group">
                        {url
                          ? <img src={url} alt={value} className="w-full aspect-square rounded-xl object-contain" />
                          : <div className="w-full aspect-square rounded-xl bg-red-50 flex items-center justify-center text-red-300 text-xs">Error</div>
                        }
                        <p className="text-[9px] font-black text-slate-400 group-hover:text-amber-700 text-center break-all leading-tight">{value}</p>
                        {url && (
                          <a href={url} download={`${value}.png`}
                            className="opacity-0 group-hover:opacity-100 text-[9px] font-black text-amber-600 underline transition-all">
                            Save
                          </a>
                        )}
                      </div>
                    ) : (
                      <div key={value}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl border border-slate-100 hover:border-amber-200 hover:bg-amber-50 transition-all group">
                        {url
                          ? <img src={url} alt={value} className="w-10 h-10 rounded-lg object-contain border border-slate-200" />
                          : <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center text-red-300 text-xs">!</div>
                        }
                        <span className="flex-1 text-sm font-mono font-bold text-slate-700">{value}</span>
                        {url && (
                          <a href={url} download={`${value}.png`}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg bg-amber-100 text-amber-700 transition-all">
                            <MdDownload size={14} />
                          </a>
                        )}
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}