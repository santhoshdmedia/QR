import { useEffect, useRef, useState } from "react";
import QRCodeStyling from "qr-code-styling";
import {
  FaFacebook, FaInstagram, FaWhatsapp, FaYoutube,
  FaLinkedin, FaPinterest, FaSpotify, FaGithub,
  FaDiscord, FaTelegram, FaReddit, FaTwitch, FaTwitter
} from "react-icons/fa";
import { FaTiktok, FaXTwitter, FaSnapchat } from "react-icons/fa6";
import {
  MdFileDownload, MdContentCopy, MdCheck, MdWifi, MdPerson,
  MdPhone, MdEmail, MdLink, MdSms, MdLocationOn, MdUpload
} from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io";
import "./App.css";

// ─── SimpleIcons CDN for QR logo images ──────────────────────────────────────
const SI = (slug, hex) => `https://cdn.simpleicons.org/${slug}/${hex}`;

// ─── Frames ───────────────────────────────────────────────────────────────────
const frames = [
  { url: "",                             label: "None",       qrSize: 150, top: "50%", left: "50%" },
  { url: "/assets/images/white-home.png",label: "Home",       qrSize: 120, top: "60%", left: "50%" },
  { url: "/assets/images/message.png",   label: "Message",    qrSize: 100, top: "32%", left: "50%" },
  { url: "/assets/images/scooter.png",   label: "Scooter",    qrSize:  98, top: "30%", left: "28%" },
  { url: "/assets/images/hand scan.png", label: "Hand Scan",  qrSize: 100, top: "32%", left: "52%" },
  { url: "/assets/images/photo.png",     label: "Photo",      qrSize: 121, top: "42%", left: "50%" },
  { url: "/assets/images/beer.png",      label: "Beer",       qrSize: 100, top: "53%", left: "48%" },
  { url: "/assets/images/cup.png",       label: "Cup",        qrSize: 100, top: "55%", left: "46%" },
  { url: "/assets/images/bill.png",      label: "Bill",       qrSize: 125, top: "40%", left: "50%" },
  { url: "/assets/images/juice.png",     label: "Juice",      qrSize: 100, top: "60%", left: "50%" },
  { url: "/assets/images/restarant.png", label: "Restaurant", qrSize: 105, top: "53%", left: "62%" },
];

// ─── Social Logos ─────────────────────────────────────────────────────────────
// Icon  = react-icon used for UI display
// qrUrl = CDN image URL passed to the QR library as logo
const socialLogos = [
  { Icon: FaFacebook,  qrUrl: SI("facebook",  "1877F2"), color: "#1877F2", label: "Facebook"  },
  { Icon: FaInstagram, qrUrl: SI("instagram", "E4405F"), color: "#E4405F", label: "Instagram" },
  { Icon: FaXTwitter,  qrUrl: SI("x",         "000000"), color: "#000000", label: "X/Twitter" },
  { Icon: FaWhatsapp,  qrUrl: SI("whatsapp",  "25D366"), color: "#25D366", label: "WhatsApp"  },
  { Icon: FaYoutube,   qrUrl: SI("youtube",   "FF0000"), color: "#FF0000", label: "YouTube"   },
  { Icon: FaTiktok,    qrUrl: SI("tiktok",    "000000"), color: "#000000", label: "TikTok"    },
  { Icon: FaPinterest, qrUrl: SI("pinterest", "E60023"), color: "#E60023", label: "Pinterest" },
  { Icon: FaSnapchat,  qrUrl: SI("snapchat",  "FFCA28"), color: "#FFCA28", label: "Snapchat"  },
  { Icon: FaSpotify,   qrUrl: SI("spotify",   "1DB954"), color: "#1DB954", label: "Spotify"   },
  { Icon: FaGithub,    qrUrl: SI("github",    "333333"), color: "#333333", label: "GitHub"    },
  { Icon: FaDiscord,   qrUrl: SI("discord",   "5865F2"), color: "#5865F2", label: "Discord"   },
  { Icon: FaTelegram,  qrUrl: SI("telegram",  "26A5E4"), color: "#26A5E4", label: "Telegram"  },
  { Icon: FaReddit,    qrUrl: SI("reddit",    "FF4500"), color: "#FF4500", label: "Reddit"    },
  { Icon: FaTwitch,    qrUrl: SI("twitch",    "9146FF"), color: "#9146FF", label: "Twitch"    },
];

// ─── QR Instance ──────────────────────────────────────────────────────────────
const qrInstance = new QRCodeStyling({
  width: 150, height: 150,
  data: "https://example.com",
  dotsOptions:       { color: "#111827", type: "square" },
  backgroundOptions: { color: "transparent" },
  imageOptions:      { crossOrigin: "anonymous", margin: 4 },
});

// ─── Static Config ────────────────────────────────────────────────────────────
const QR_TYPES = [
  { value: "url",      label: "URL",      Icon: MdLink         },
  { value: "text",     label: "Text",     Icon: MdSms          },
  { value: "phone",    label: "Phone",    Icon: MdPhone        },
  { value: "email",    label: "Email",    Icon: MdEmail        },
  { value: "sms",      label: "SMS",      Icon: MdSms          },
  { value: "wifi",     label: "WiFi",     Icon: MdWifi         },
  { value: "vcard",    label: "Contact",  Icon: MdPerson       },
  { value: "whatsapp", label: "WhatsApp", Icon: IoLogoWhatsapp },
  { value: "location", label: "Location", Icon: MdLocationOn   },
];

const DOT_STYLES = [
  { value: "square",         label: "Square"  },
  { value: "dots",           label: "Dots"    },
  { value: "rounded",        label: "Rounded" },
  { value: "classy",         label: "Classy"  },
  { value: "classy-rounded", label: "Classy+" },
  { value: "extra-rounded",  label: "Soft"    },
];

const CORNER_SQ_STYLES  = [
  { value: "square",        label: "Square"  },
  { value: "dot",           label: "Dot"     },
  { value: "extra-rounded", label: "Rounded" },
];

const CORNER_DOT_STYLES = [
  { value: "square", label: "Square" },
  { value: "dot",    label: "Dot"    },
];

const COLOR_PRESETS = [
  { label: "Ink",    dot: "#111827", bg: "#ffffff", g2: "#374151" },
  { label: "Indigo", dot: "#4338ca", bg: "#eef2ff", g2: "#818cf8" },
  { label: "Forest", dot: "#14532d", bg: "#f0fdf4", g2: "#4ade80" },
  { label: "Rose",   dot: "#9f1239", bg: "#fff1f2", g2: "#f43f5e" },
  { label: "Ocean",  dot: "#075985", bg: "#f0f9ff", g2: "#38bdf8" },
  { label: "Dusk",   dot: "#e2e8f0", bg: "#0f172a", g2: "#94a3b8" },
  { label: "Amber",  dot: "#92400e", bg: "#fffbeb", g2: "#f59e0b" },
  { label: "Neon",   dot: "#7c3aed", bg: "#0a0a0a", g2: "#ec4899" },
];

const FONTS = [
  { value: "Georgia, serif",            label: "Georgia"     },
  { value: "'Courier New', monospace",  label: "Courier New" },
  { value: "Impact, sans-serif",        label: "Impact"      },
  { value: "'Arial Black', sans-serif", label: "Arial Black" },
  { value: "Palatino, serif",           label: "Palatino"    },
];

const ERROR_LEVELS = [
  { value: "L", tip: "~7% recovery"  },
  { value: "M", tip: "~15% recovery" },
  { value: "Q", tip: "~25% recovery" },
  { value: "H", tip: "~30% recovery" },
];

const TABS = [
  { label: "Content", icon: "📄" },
  { label: "Style",   icon: "🎨" },
  { label: "Decor",   icon: "✨" },
  { label: "Text",    icon: "Aa" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function App() {
  const qrRef = useRef(null);
  const [activeTab, setActiveTab] = useState(0);

  // Content state
  const [qrType,    setQrType]    = useState("url");
  const [url,       setUrl]       = useState("");
  const [plainText, setPlainText] = useState("");
  const [phone,     setPhone]     = useState("");
  const [email,     setEmail]     = useState("");
  const [smsPhone,  setSmsPhone]  = useState("");
  const [smsMsg,    setSmsMsg]    = useState("");
  const [wifiSSID,  setWifiSSID]  = useState("");
  const [wifiPwd,   setWifiPwd]   = useState("");
  const [wifiEnc,   setWifiEnc]   = useState("WPA");
  const [vcName,    setVcName]    = useState("");
  const [vcPhone,   setVcPhone]   = useState("");
  const [vcEmail,   setVcEmail]   = useState("");
  const [vcOrg,     setVcOrg]     = useState("");
  const [waPhone,   setWaPhone]   = useState("");
  const [waMsg,     setWaMsg]     = useState("");
  const [geoLat,    setGeoLat]    = useState("");
  const [geoLng,    setGeoLng]    = useState("");

  // Style state
  const [qrShape,       setQrShape]       = useState("square");
  const [cornerSqType,  setCornerSqType]  = useState("square");
  const [cornerDotType, setCornerDotType] = useState("square");
  const [dotColor,      setDotColor]      = useState("#111827");
  const [useGradient,   setUseGradient]   = useState(false);
  const [dotColor2,     setDotColor2]     = useState("#6366f1");
  const [gradAngle,     setGradAngle]     = useState(45);
  const [bgColor,       setBgColor]       = useState("#ffffff");
  const [transparentBg, setTransparentBg] = useState(false);
  const [errorLevel,    setErrorLevel]    = useState("M");

  // Decorate state
  const [frame, setFrame] = useState("");
  const [logo,  setLogo]  = useState("");

  // Text state
  const [scanText,    setScanText]    = useState("Scan Me");
  const [textColor,   setTextColor]   = useState("#111827");
  const [fontSize,    setFontSize]    = useState(15);
  const [fontFamily,  setFontFamily]  = useState("Georgia, serif");

  // UI state
  const [copied, setCopied] = useState(false);

  const currentFrame = frames.find(f => f.url === frame) || frames[0];
  const qrSize = currentFrame.qrSize;

  // ── Mount / remount on frame change ─────────────────────────────────────
  useEffect(() => {
    if (qrRef.current) { qrRef.current.innerHTML = ""; qrInstance.append(qrRef.current); }
  }, []);

  useEffect(() => {
    if (qrRef.current) { qrRef.current.innerHTML = ""; qrInstance.append(qrRef.current); }
  }, [frame]);

  // ── Generate QR data string ──────────────────────────────────────────────
  const generateData = () => {
    switch (qrType) {
      case "url":      return url || "https://example.com";
      case "text":     return plainText || "Hello World";
      case "phone":    return `tel:${phone}`;
      case "email":    return `mailto:${email}`;
      case "sms":      return `SMSTO:${smsPhone}:${smsMsg}`;
      case "wifi":     return `WIFI:T:${wifiEnc};S:${wifiSSID};P:${wifiPwd};;`;
      case "vcard":    return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcName}\nTEL:${vcPhone}\nEMAIL:${vcEmail}\nORG:${vcOrg}\nEND:VCARD`;
      case "whatsapp": return `https://wa.me/${waPhone.replace(/\D/g, "")}?text=${encodeURIComponent(waMsg)}`;
      case "location": return `geo:${geoLat},${geoLng}`;
      default:         return "https://example.com";
    }
  };

  // ── Update QR instance ───────────────────────────────────────────────────
  useEffect(() => {
    const dotsOptions = {
      type: qrShape,
      ...(useGradient
        ? { gradient: { type: "linear", rotation: (gradAngle * Math.PI) / 180,
              colorStops: [{ offset: 0, color: dotColor }, { offset: 1, color: dotColor2 }] } }
        : { color: dotColor }
      ),
    };
    qrInstance.update({
      width: qrSize, height: qrSize,
      data:  generateData(),
      image: logo,
      dotsOptions,
      cornersSquareOptions: { type: cornerSqType },
      cornersDotOptions:    { type: cornerDotType },
      backgroundOptions:    { color: transparentBg ? "transparent" : bgColor },
      qrOptions:            { errorCorrectionLevel: errorLevel },
    });
  }, [
    url, plainText, phone, email, smsPhone, smsMsg,
    wifiSSID, wifiPwd, wifiEnc, vcName, vcPhone, vcEmail, vcOrg,
    waPhone, waMsg, geoLat, geoLng, qrType,
    qrShape, cornerSqType, cornerDotType,
    dotColor, useGradient, dotColor2, gradAngle,
    bgColor, transparentBg, errorLevel, logo, qrSize,
  ]);

  // ── Apply a color preset ─────────────────────────────────────────────────
  const applyPreset = (p) => {
    setDotColor(p.dot); setBgColor(p.bg);
    setDotColor2(p.g2); setTransparentBg(false);
  };

  // ── Download PNG (4× scale, direct canvas composite) ────────────────────
  const downloadPNG = async () => {
    const SCALE = 4, PAD = 24, PREV = 220, TEXT_H = 52;
    const cW = (PREV + PAD * 2) * SCALE;
    const cH = (PREV + PAD + TEXT_H + PAD) * SCALE;
    const canvas = document.createElement("canvas");
    canvas.width = cW; canvas.height = cH;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = transparentBg ? "#ffffff" : bgColor;
    ctx.fillRect(0, 0, cW, cH);

    const ox = PAD * SCALE, oy = PAD * SCALE, pw = PREV * SCALE, ph = PREV * SCALE;

    if (frame) {
      await new Promise(res => {
        const img = new Image(); img.crossOrigin = "anonymous";
        img.onload = () => { ctx.drawImage(img, ox, oy, pw, ph); res(); };
        img.onerror = res; img.src = frame;
      });
    }

    const qrCanvas = qrRef.current?.querySelector("canvas");
    if (qrCanvas) {
      const qs = qrSize * SCALE;
      const qx = ox + pw * (parseFloat(currentFrame.left) / 100) - qs / 2;
      const qy = oy + ph * (parseFloat(currentFrame.top)  / 100) - qs / 2;
      ctx.drawImage(qrCanvas, qx, qy, qs, qs);
    }

    ctx.fillStyle = textColor;
    ctx.font = `700 ${fontSize * SCALE}px ${fontFamily}`;
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(scanText, cW / 2, oy + ph + (TEXT_H / 2) * SCALE);

    const link = document.createElement("a");
    link.download = "qr-code.png";
    link.href = canvas.toDataURL("image/png", 1.0);
    link.click();
  };

  // ── Download SVG ─────────────────────────────────────────────────────────
  const downloadSVG = () => qrInstance.download({ name: "qr-code", extension: "svg" });

  // ── Copy QR image to clipboard ────────────────────────────────────────────
  const copyToClipboard = async () => {
    const qrCanvas = qrRef.current?.querySelector("canvas");
    if (!qrCanvas) return;
    qrCanvas.toBlob(async blob => {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      } catch { /* clipboard API not supported */ }
    });
  };

  // ── Upload custom logo ────────────────────────────────────────────────────
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setLogo(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Shared styles ─────────────────────────────────────────────────────────
  const inputCls = "w-full px-3 py-2.5 rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-800 font-medium text-sm placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition";

  const Chip = ({ value, current, onClick, label }) => (
    <button onClick={() => onClick(value)}
      className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all whitespace-nowrap
        ${current === value
          ? "bg-slate-900 text-white border-slate-900 shadow"
          : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
      {label}
    </button>
  );

  const Toggle = ({ value, onChange, label }) => (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm font-semibold text-slate-600">{label}</span>
      <button onClick={() => onChange(!value)}
        className={`relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0
          ${value ? "bg-indigo-500" : "bg-slate-300"}`}>
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${value ? "translate-x-5" : ""}`} />
      </button>
    </div>
  );

  const SectionLabel = ({ children }) => (
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{children}</p>
  );

  // ── Render content inputs based on qrType ────────────────────────────────
  const renderContentInputs = () => {
    switch (qrType) {
      case "url":
        return <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://example.com" className={inputCls} />;
      case "text":
        return <textarea value={plainText} onChange={e => setPlainText(e.target.value)} placeholder="Your text…" rows={4} className={`${inputCls} resize-none`} />;
      case "phone":
        return <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1 234 567 8900" type="tel" className={inputCls} />;
      case "email":
        return <input value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@example.com" type="email" className={inputCls} />;
      case "sms":
        return <div className="flex flex-col gap-2">
          <input value={smsPhone} onChange={e => setSmsPhone(e.target.value)} placeholder="Phone number"         className={inputCls} />
          <input value={smsMsg}   onChange={e => setSmsMsg(e.target.value)}   placeholder="Message (optional)"   className={inputCls} />
        </div>;
      case "wifi":
        return <div className="flex flex-col gap-2">
          <input value={wifiSSID} onChange={e => setWifiSSID(e.target.value)} placeholder="Network name (SSID)"  className={inputCls} />
          <input value={wifiPwd}  onChange={e => setWifiPwd(e.target.value)}  placeholder="Password"             className={inputCls} type="password" />
          <select value={wifiEnc} onChange={e => setWifiEnc(e.target.value)}  className={inputCls}>
            <option value="WPA">WPA / WPA2</option>
            <option value="WEP">WEP</option>
            <option value="nopass">No Password</option>
          </select>
        </div>;
      case "vcard":
        return <div className="flex flex-col gap-2">
          <input value={vcName}  onChange={e => setVcName(e.target.value)}  placeholder="Full Name *"         className={inputCls} />
          <input value={vcPhone} onChange={e => setVcPhone(e.target.value)} placeholder="Phone number *"      className={inputCls} />
          <input value={vcEmail} onChange={e => setVcEmail(e.target.value)} placeholder="Email address"       className={inputCls} />
          <input value={vcOrg}   onChange={e => setVcOrg(e.target.value)}   placeholder="Organization"        className={inputCls} />
        </div>;
      case "whatsapp":
        return <div className="flex flex-col gap-2">
          <input value={waPhone} onChange={e => setWaPhone(e.target.value)} placeholder="+1 234 567 8900"             className={inputCls} />
          <input value={waMsg}   onChange={e => setWaMsg(e.target.value)}   placeholder="Pre-filled message (optional)" className={inputCls} />
        </div>;
      case "location":
        return <div className="flex flex-col gap-2">
          <input value={geoLat} onChange={e => setGeoLat(e.target.value)} placeholder="Latitude  (e.g. 40.7128)"   className={inputCls} />
          <input value={geoLng} onChange={e => setGeoLng(e.target.value)} placeholder="Longitude (e.g. -74.0060)"  className={inputCls} />
        </div>;
      default: return null;
    }
  };

  const previewBg = transparentBg
    ? "repeating-conic-gradient(#e2e8f0 0% 25%, #f8fafc 0% 50%) 0 0 / 14px 14px"
    : bgColor;

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-amber-400 via-yellow-300 to-orange-400 px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start">

        {/* ── LEFT ───────────────────────────────────────────────────────── */}
        <div className="flex-1 rounded-3xl bg-white shadow-2xl overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-slate-800 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-400 flex items-center justify-center font-black text-slate-900 text-sm">QR</div>
            <div>
              <h1 className="text-white font-black text-base tracking-tight">QR Code Studio</h1>
              <p className="text-slate-400 text-xs">Generate · Customize · Download</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-slate-100 bg-white">
            {TABS.map((tab, i) => (
              <button key={i} onClick={() => setActiveTab(i)}
                className={`flex-1 py-3 text-xs font-black tracking-wide transition-all flex flex-col items-center gap-0.5
                  ${activeTab === i
                    ? "text-slate-900 border-b-2 border-amber-400 bg-amber-50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"}`}>
                <span className="text-base leading-none">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Panels */}
          <div className="p-5 max-h-[65vh] overflow-y-auto">

            {/* ── 0: Content ─────────────────────────────────────────────── */}
            {activeTab === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <SectionLabel>QR Type</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {QR_TYPES.map(t => (
                      <button key={t.value} onClick={() => setQrType(t.value)}
                        className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border-2 text-xs font-bold transition-all
                          ${qrType === t.value
                            ? "border-amber-400 bg-amber-50 text-amber-900 shadow-sm"
                            : "border-slate-200 text-slate-500 hover:border-slate-300 bg-white"}`}>
                        <t.Icon size={18} className={qrType === t.value ? "text-amber-500" : "text-slate-400"} />
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <SectionLabel>Details</SectionLabel>
                  {renderContentInputs()}
                </div>
              </div>
            )}

            {/* ── 1: Style ───────────────────────────────────────────────── */}
            {activeTab === 1 && (
              <div className="flex flex-col gap-6">

                {/* Color Presets */}
                <div>
                  <SectionLabel>Color Presets</SectionLabel>
                  <div className="grid grid-cols-4 gap-2">
                    {COLOR_PRESETS.map(p => (
                      <button key={p.label} onClick={() => applyPreset(p)}
                        className="rounded-xl overflow-hidden border-2 border-slate-200 hover:border-amber-400 hover:scale-105 transition-all shadow-sm">
                        <div className="h-5" style={{ background: p.bg }} />
                        <div className="h-3" style={{ background: p.dot }} />
                        <p className="text-[9px] font-black text-center py-0.5 text-slate-500 bg-white">{p.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dot Style */}
                <div>
                  <SectionLabel>Dot Style</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {DOT_STYLES.map(s => <Chip key={s.value} value={s.value} current={qrShape} onClick={setQrShape} label={s.label} />)}
                  </div>
                </div>

                {/* Corner Styles */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SectionLabel>Corner Square</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {CORNER_SQ_STYLES.map(s => <Chip key={s.value} value={s.value} current={cornerSqType} onClick={setCornerSqType} label={s.label} />)}
                    </div>
                  </div>
                  <div>
                    <SectionLabel>Corner Dot</SectionLabel>
                    <div className="flex flex-wrap gap-1.5">
                      {CORNER_DOT_STYLES.map(s => <Chip key={s.value} value={s.value} current={cornerDotType} onClick={setCornerDotType} label={s.label} />)}
                    </div>
                  </div>
                </div>

                {/* Dot Color + Gradient */}
                <div>
                  <SectionLabel>Dot Color</SectionLabel>
                  <Toggle value={useGradient} onChange={setUseGradient} label="Gradient" />
                  <div className="flex gap-3 mt-2 items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="color" value={dotColor} onChange={e => setDotColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5 shadow-sm" />
                      <span className="text-xs font-mono text-slate-500">{useGradient ? "From" : "Color"}</span>
                    </label>
                    {useGradient && (
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="color" value={dotColor2} onChange={e => setDotColor2(e.target.value)}
                          className="w-10 h-10 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5 shadow-sm" />
                        <span className="text-xs font-mono text-slate-500">To</span>
                      </label>
                    )}
                  </div>
                  {useGradient && (
                    <div className="mt-3">
                      <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                        <span>Angle</span><span className="font-bold">{gradAngle}°</span>
                      </div>
                      <div className="h-5 rounded-lg mb-2 border border-slate-100"
                        style={{ background: `linear-gradient(${gradAngle}deg, ${dotColor}, ${dotColor2})` }} />
                      <input type="range" min={0} max={360} value={gradAngle} onChange={e => setGradAngle(+e.target.value)}
                        className="w-full accent-amber-500" />
                    </div>
                  )}
                </div>

                {/* Background */}
                <div>
                  <SectionLabel>Background</SectionLabel>
                  <Toggle value={transparentBg} onChange={setTransparentBg} label="Transparent" />
                  {!transparentBg && (
                    <label className="flex items-center gap-2 mt-2 cursor-pointer">
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5 shadow-sm" />
                      <span className="text-xs font-mono text-slate-500">{bgColor}</span>
                    </label>
                  )}
                </div>

                {/* Error Correction */}
                <div>
                  <SectionLabel>Error Correction</SectionLabel>
                  <div className="flex gap-2 mb-1.5">
                    {ERROR_LEVELS.map(l => (
                      <button key={l.value} onClick={() => setErrorLevel(l.value)} title={l.tip}
                        className={`flex-1 py-2 rounded-xl text-sm font-black border-2 transition-all
                          ${errorLevel === l.value
                            ? "bg-slate-900 text-white border-slate-900 shadow"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"}`}>
                        {l.value}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">Higher = more resilient. Use H when adding a logo.</p>
                </div>
              </div>
            )}

            {/* ── 2: Decorate ────────────────────────────────────────────── */}
            {activeTab === 2 && (
              <div className="flex flex-col gap-6">

                {/* Frames */}
                <div>
                  <SectionLabel>Frames</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    {frames.map((f, i) =>
                      f.url ? (
                        <img key={i} src={f.url} alt={f.label} title={f.label} onClick={() => setFrame(f.url)}
                          className={`w-14 h-14 rounded-2xl border-2 p-1 object-contain cursor-pointer transition-all
                            ${frame === f.url ? "border-amber-400 ring-2 ring-amber-200 scale-105 bg-amber-50" : "border-slate-200 bg-white hover:border-slate-400 hover:scale-105"}`}
                        />
                      ) : (
                        <div key={i} onClick={() => setFrame("")}
                          className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-xs font-black cursor-pointer transition-all
                            ${frame === "" ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-400 hover:border-slate-400"}`}>
                          None
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Social Logos */}
                <div>
                  <SectionLabel>Social Logo</SectionLabel>
                  <div className="flex flex-wrap gap-2">
                    <div onClick={() => setLogo("")}
                      className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-xs font-black cursor-pointer transition-all
                        ${logo === "" ? "border-amber-400 bg-amber-50 text-amber-700" : "border-slate-200 bg-white text-slate-400 hover:border-slate-400"}`}>
                      None
                    </div>
                    {socialLogos.map((s, i) => (
                      <div key={i} title={s.label} onClick={() => setLogo(s.qrUrl)}
                        className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all
                          ${logo === s.qrUrl
                            ? "border-amber-400 ring-2 ring-amber-200 scale-105 shadow-sm"
                            : "border-slate-200 bg-white hover:border-slate-400 hover:scale-105"}`}
                        style={{ background: logo === s.qrUrl ? `${s.color}18` : "white" }}>
                        <s.Icon size={22} color={s.color} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Custom Upload */}
                <div>
                  <SectionLabel>Upload Custom Logo</SectionLabel>
                  <label className="flex items-center gap-3 px-4 py-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 cursor-pointer hover:border-amber-400 hover:bg-amber-50 transition-all">
                    <MdUpload size={20} className="text-slate-400" />
                    <span className="text-sm font-semibold text-slate-500">Choose image (PNG, JPG, SVG)</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </label>
                  {logo && !socialLogos.find(s => s.qrUrl === logo) && logo !== "" && (
                    <div className="mt-2 flex items-center gap-2 p-2 bg-slate-50 rounded-xl">
                      <img src={logo} alt="custom" className="w-9 h-9 rounded-lg object-contain border border-slate-200" />
                      <span className="text-xs text-slate-500 flex-1">Custom logo active</span>
                      <button onClick={() => setLogo("")} className="text-xs text-red-400 hover:text-red-600 font-semibold">Remove</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── 3: Text ────────────────────────────────────────────────── */}
            {activeTab === 3 && (
              <div className="flex flex-col gap-6">

                <div>
                  <SectionLabel>Label Text</SectionLabel>
                  <input value={scanText} onChange={e => setScanText(e.target.value)} placeholder="Scan Me" className={inputCls} />
                </div>

                <div>
                  <SectionLabel>Font Family</SectionLabel>
                  <div className="flex flex-col gap-2">
                    {FONTS.map(f => (
                      <button key={f.value} onClick={() => setFontFamily(f.value)}
                        className={`py-2.5 px-4 rounded-xl border-2 text-sm text-left transition-all
                          ${fontFamily === f.value
                            ? "border-amber-400 bg-amber-50 text-amber-900 font-bold"
                            : "border-slate-200 bg-white text-slate-700 hover:border-slate-400"}`}
                        style={{ fontFamily: f.value }}>
                        {f.label} — The quick brown fox
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <SectionLabel>Font Size</SectionLabel>
                    <span className="text-xs font-black text-slate-400">{fontSize}px</span>
                  </div>
                  <input type="range" min={10} max={32} value={fontSize} onChange={e => setFontSize(+e.target.value)}
                    className="w-full accent-amber-500" />
                  <div className="flex justify-between text-[10px] text-slate-300 mt-0.5">
                    <span>10</span><span>32</span>
                  </div>
                </div>

                <div>
                  <SectionLabel>Text Color</SectionLabel>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)}
                      className="w-10 h-10 rounded-xl border-2 border-slate-200 cursor-pointer p-0.5 shadow-sm" />
                    <span className="text-sm font-mono text-slate-500">{textColor}</span>
                  </label>
                </div>

              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT ──────────────────────────────────────────────────────── */}
        <div className="w-full lg:w-[288px] flex flex-col items-center gap-3 lg:sticky lg:top-8">

          {/* Preview Card */}
          <div className="w-full bg-white rounded-3xl shadow-2xl p-5 flex flex-col items-center border border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Live Preview</p>

            <div className="relative w-[220px] h-[220px] flex items-center justify-center rounded-2xl overflow-hidden"
              style={{ background: previewBg }}>
              {frame && (
                <img src={frame} alt="frame"
                  className="absolute inset-0 w-full h-full object-contain z-10 pointer-events-none" />
              )}
              <div ref={qrRef} className="absolute z-20"
                style={{
                  top: currentFrame.top, left: currentFrame.left,
                  transform: "translate(-50%, -50%)",
                  width: qrSize, height: qrSize,
                }} />
            </div>

            <p className="mt-4 font-bold tracking-wide text-center break-all"
              style={{ color: textColor, fontSize, fontFamily }}>
              {scanText}
            </p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 w-full">
            <button onClick={downloadPNG}
              className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 text-white text-sm font-black tracking-wide shadow-lg hover:bg-slate-700 hover:-translate-y-0.5 active:translate-y-0 transition-all">
              <MdFileDownload size={18} /> Download PNG
            </button>
            <button onClick={downloadSVG}
              className="flex items-center justify-center gap-2 py-2.5 rounded-2xl bg-amber-400 text-slate-900 text-sm font-black tracking-wide shadow hover:bg-amber-300 hover:-translate-y-0.5 transition-all">
              <MdFileDownload size={18} /> Download SVG
            </button>
            <button onClick={copyToClipboard}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-black tracking-wide shadow transition-all hover:-translate-y-0.5
                ${copied ? "bg-green-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
              {copied
                ? <><MdCheck size={18} /> Copied to clipboard!</>
                : <><MdContentCopy size={18} /> Copy Image</>}
            </button>
          </div>

          <p className="text-[10px] text-slate-400 text-center px-2 leading-relaxed">
            PNG exported at 4× resolution · SVG is infinitely scalable
          </p>
        </div>
      </div>
    </div>
  );
}