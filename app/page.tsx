"use client";

import { useMemo, useState } from "react";
import { actionRecords, currentUser, sites } from "@/lib/mock-data";
import { buildConfirmationMessage } from "@/lib/ai-builder";
import { calculatePackagePrice, cancellationFee, packages } from "@/lib/pricing";

type Screen = "home" | "order" | "client" | "crm" | "reporting" | "knowledge" | "admin" | "settings";
type OrderStep = "client" | "bundle" | "files" | "domains" | "contract" | "review";
type Toast = { id: number; type: "green" | "red"; text: string };

type OrderData = {
  customerName: string;
  businessName: string;
  phone: string;
  email: string;
  industry: string;
  googleLink: string;
  phoneVerified: boolean;
  emailVerified: boolean;
  packageKey: "starter" | "business" | "pro" | "premium";
  term: "36_month" | "12_month" | "month_to_month";
  filesNote: string;
  domainChoice: "new" | "existing" | "temporary" | "later";
  domain: string;
  existingDomain: string;
  contractAcknowledged: boolean;
  signature: string;
  adminOverrideReason: string;
  presentationMode: boolean;
  trainingMode: boolean;
};

const initialOrder: OrderData = {
  customerName: "John Smith",
  businessName: "John’s Barber Shop",
  phone: "+12055550181",
  email: "john@johnsbarber.com",
  industry: "Barber / Salon",
  googleLink: "",
  phoneVerified: false,
  emailVerified: false,
  packageKey: "business",
  term: "36_month",
  filesNote: "Logo, service menu, barber photos, Google reviews, and pricing sheet.",
  domainChoice: "new",
  domain: "johnsbarbershop.com",
  existingDomain: "",
  contractAcknowledged: false,
  signature: "",
  adminOverrideReason: "",
  presentationMode: false,
  trainingMode: false
};

const nav: { label: string; screen: Screen }[] = [
  { label: "Home", screen: "home" },
  { label: "Place New Order", screen: "order" },
  { label: "Manage Clients", screen: "client" },
  { label: "CRM / Leads", screen: "crm" },
  { label: "Reporting", screen: "reporting" },
  { label: "Knowledge Hub", screen: "knowledge" },
  { label: "Seller Action Records", screen: "admin" },
  { label: "Settings", screen: "settings" }
];

const steps: { key: OrderStep; label: string; next: string }[] = [
  { key: "client", label: "Client Setup", next: "Verify phone number to continue." },
  { key: "bundle", label: "Bundle Builder", next: "Select package, contract term, and promos." },
  { key: "files", label: "Files & Links", next: "Confirm uploads or skip files for now." },
  { key: "domains", label: "Domains", next: "Choose new, existing, temporary, or assign later." },
  { key: "contract", label: "Terms & Contract", next: "Customer must acknowledge terms." },
  { key: "review", label: "Review Order", next: "Submit final order or edit any step." }
];

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [collapsed, setCollapsed] = useState(false);
  const [orderStep, setOrderStep] = useState<OrderStep>("client");
  const [highestStep, setHighestStep] = useState(0);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [order, setOrder] = useState<OrderData>(initialOrder);
  const [smsCode, setSmsCode] = useState("");
  const [smsStatus, setSmsStatus] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [aiRequest, setAiRequest] = useState("Add an AI chatbot and make the site feel more premium.");
  const ai = useMemo(() => buildConfirmationMessage(aiRequest), [aiRequest]);
  const business36 = calculatePackagePrice("business", "36_month", true);
  const business12 = calculatePackagePrice("business", "12_month", true);

  function toast(type: "green" | "red", text: string) {
    const id = Date.now();
    setToasts((prev) => [...prev.slice(-3), { id, type, text }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4200);
  }

  function openOrder(reset = false) {
    if (reset) {
      setOrder(initialOrder);
      setOrderStep("client");
      setHighestStep(0);
      setEditingFromReview(false);
      setSmsCode("");
      setSmsStatus("");
      toast("green", "New order draft started.");
    }
    setScreen("order");
  }

  function currentIndex() {
    return steps.findIndex((s) => s.key === orderStep);
  }

  function validateStep(): boolean {
    if (orderStep === "client" && (!order.customerName || !order.businessName || !order.phone || !order.email || !order.phoneVerified)) {
      toast("red", "Cannot continue until required client fields and phone verification are complete.");
      return false;
    }
    if (orderStep === "bundle" && order.packageKey === "premium" && order.term !== "36_month") {
      toast("red", "Premium/PWA must use a 36-month contract.");
      return false;
    }
    if (orderStep === "files" && !order.filesNote.trim()) {
      toast("red", "Add upload notes or type 'skip files for now'.");
      return false;
    }
    if (orderStep === "domains" && order.domainChoice === "existing" && !order.existingDomain.trim()) {
      toast("red", "Enter the existing customer-owned domain or choose another option.");
      return false;
    }
    if (orderStep === "contract" && (!order.contractAcknowledged || !order.signature.trim())) {
      toast("red", "Contract acknowledgement and customer signature are required.");
      return false;
    }
    return true;
  }

  function nextStep() {
    if (!validateStep()) return;
    const idx = currentIndex();
    const next = steps[idx + 1];
    setHighestStep(Math.max(highestStep, idx + 1));
    if (editingFromReview) {
      setEditingFromReview(false);
      setOrderStep("review");
      setHighestStep(5);
      toast("green", "Changes saved. Returned to order review.");
      return;
    }
    if (next) {
      setOrderStep(next.key);
      toast("green", `${steps[idx].label} saved.`);
    }
  }

  function editStep(step: OrderStep) {
    setEditingFromReview(true);
    setOrderStep(step);
    setHighestStep(5);
    toast("green", `Editing ${steps.find((s) => s.key === step)?.label}. Save changes to return to review.`);
  }

  async function sendSmsPin() {
    setSmsStatus("Sending SMS PIN...");
    try {
      const response = await fetch("/api/sms/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: order.phone, brand: "RPE Studios" }) });
      const data = await response.json();
      setSmsStatus(data.message || "SMS PIN sent.");
      toast("green", "SMS PIN sent to customer.");
    } catch {
      setSmsStatus("SMS service not connected yet. Demo PIN: 123456.");
      toast("red", "SMS service unavailable. Demo PIN enabled.");
    }
  }

  async function verifySmsPin() {
    setSmsStatus("Verifying code...");
    try {
      const response = await fetch("/api/sms/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: order.phone, code: smsCode }) });
      const data = await response.json();
      if (data.verified) {
        setOrder({ ...order, phoneVerified: true });
        setSmsStatus("Phone verified successfully.");
        toast("green", "Phone number verified. Green checkmark active.");
      } else {
        setSmsStatus(data.message || "Invalid or expired PIN.");
        toast("red", "SMS PIN failed or expired.");
      }
    } catch {
      if (smsCode === "123456") {
        setOrder({ ...order, phoneVerified: true });
        setSmsStatus("Phone verified with demo PIN.");
        toast("green", "Phone number verified with demo PIN.");
      } else {
        setSmsStatus("Invalid demo PIN. Use 123456 until Twilio is configured.");
        toast("red", "Invalid SMS PIN.");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {order.trainingMode && <div className="sticky top-0 z-30 bg-amber-100 px-4 py-2 text-center text-sm font-black text-amber-800">Preview Mode — no real orders, payments, domains, or websites will be created.</div>}
      <ToastStack toasts={toasts} />
      <div className={`grid min-h-screen ${collapsed ? "grid-cols-[88px_1fr]" : "grid-cols-[280px_1fr]"} max-lg:grid-cols-1`}>
        <aside className="border-r border-slate-200 bg-white p-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-700 font-black text-white shadow-lg">RP</div>{!collapsed && <div><h1 className="text-lg font-black leading-tight">RP Studios</h1><p className="text-xs font-semibold text-slate-500">Builder OS</p></div>}</div>
            <button onClick={() => setCollapsed(!collapsed)} className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-sm font-black">{collapsed ? "»" : "«"}</button>
          </div>
          {!collapsed && <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="font-black">{currentUser.name}</div><div className="text-xs font-semibold text-slate-500">{currentUser.username}</div><div className="mt-3 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">Seller</div></div>}
          <nav className="grid gap-1">{nav.map((item) => <button key={item.screen} onClick={() => item.screen === "order" ? openOrder(true) : setScreen(item.screen)} className={`rounded-xl px-3 py-3 text-left text-sm font-black ${screen === item.screen ? "bg-purple-100 text-purple-700" : "bg-white text-slate-700 hover:bg-slate-50"}`} title={item.label}>{collapsed ? item.label.charAt(0) : item.label}</button>)}</nav>
        </aside>
        <main className="p-7">
          {screen === "home" && <Home openOrder={openOrder} setScreen={setScreen} />}
          {screen === "order" && <OrderFlow order={order} setOrder={setOrder} orderStep={orderStep} setOrderStep={setOrderStep} highestStep={highestStep} setHighestStep={setHighestStep} nextStep={nextStep} editStep={editStep} editingFromReview={editingFromReview} smsCode={smsCode} setSmsCode={setSmsCode} smsStatus={smsStatus} sendSmsPin={sendSmsPin} verifySmsPin={verifySmsPin} business36={business36} business12={business12} aiRequest={aiRequest} setAiRequest={setAiRequest} ai={ai} toast={toast} />}
          {screen === "client" && <Client openOrder={openOrder} />}
          {screen === "crm" && <Crm />}
          {screen === "reporting" && <Reporting />}
          {screen === "knowledge" && <Knowledge />}
          {screen === "admin" && <AdminActions />}
          {screen === "settings" && <Settings />}
        </main>
      </div>
    </div>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) { return <div className="fixed right-4 top-4 z-50 grid gap-2">{toasts.map((t) => <div key={t.id} className={`rounded-2xl px-4 py-3 text-sm font-black shadow-lg ${t.type === "green" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>{t.type === "green" ? "🟢" : "🔴"} {t.text}</div>)}</div>; }
function Header({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) { return <div className="mb-6 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start"><div><div className="mb-1 text-sm font-bold text-slate-500">{eyebrow}</div><h2 className="text-3xl font-black tracking-tight">{title}</h2></div><div className="flex flex-wrap gap-2">{children}</div></div>; }
function PrimaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) { return <button disabled={disabled} onClick={onClick} className="rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-black text-white hover:bg-purple-900 disabled:cursor-not-allowed disabled:bg-slate-300">{children}</button>; }
function SecondaryButton({ children, onClick, disabled }: { children: React.ReactNode; onClick?: () => void; disabled?: boolean }) { return <button disabled={disabled} onClick={onClick} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900 hover:bg-slate-50 disabled:cursor-not-allowed disabled:text-slate-300">{children}</button>; }
function Metric({ title, value, note }: { title: string; value: string; note: string }) { return <div className="card p-5"><h3 className="font-black">{title}</h3><div className="mt-2 text-3xl font-black tracking-tight">{value}</div><p className="mt-1 text-sm font-semibold text-slate-500">{note}</p></div>; }
function Action({ flag, title, text }: { flag: "green" | "red"; title: string; text: string }) { return <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3"><div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black text-white ${flag === "green" ? "bg-green-600" : "bg-red-600"}`}>{flag === "green" ? "✓" : "×"}</div><div><div className="font-black">{title}</div><p className="text-sm text-slate-500">{text}</p></div></div>; }
function Field({ label, value, placeholder, onChange }: { label: string; value?: string; placeholder?: string; onChange?: (value: string) => void }) { return <label className="grid gap-1 text-xs font-black text-slate-700">{label}<input className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" value={value ?? ""} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)} /></label>; }
function TextBox({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) { return <label className="grid gap-1 text-xs font-black text-slate-700">{label}<textarea className="min-h-[95px] rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" value={value} onChange={(e) => onChange(e.target.value)} /></label>; }
function Status({ label, value, color }: { label: string; value: string; color: "green" | "red" | "purple" | "amber" }) { const cls = color === "green" ? "bg-green-100 text-green-700" : color === "red" ? "bg-red-100 text-red-700" : color === "amber" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700"; return <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3"><div className="font-black">{label}</div><span className={`rounded-full px-2.5 py-1 text-xs font-black ${cls}`}>{value}</span></div>; }

function Home({ openOrder, setScreen }: { openOrder: (reset?: boolean) => void; setScreen: (screen: Screen) => void }) { return <><Header eyebrow="Seller workspace / Today" title="Good afternoon, Brayden"><SecondaryButton>Search clients, sites, leads...</SecondaryButton><PrimaryButton onClick={() => openOrder(true)}>+ Place New Order</PrimaryButton></Header><div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1"><Metric title="This Month Sales" value="7" note="Closed website orders" /><Metric title="Contracted MRR" value="$4,225" note="Only while under contract" /><Metric title="Pending Setup Fees" value="$1,047" note="2 accounts near auto-cancel" /><Metric title="Leads Ready" value="18" note="4 high-priority leads today" /></div><div className="mt-4 grid grid-cols-[1.55fr_.9fr] gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Active Workspace</h3><p className="mt-1 text-slate-500">Buttons are wired. Start orders, verify phones, edit review sections, and track green/red flags.</p><div className="mt-4 flex flex-wrap gap-2"><PrimaryButton onClick={() => openOrder(true)}>Place Order</PrimaryButton><SecondaryButton onClick={() => setScreen("client")}>Manage Clients</SecondaryButton><SecondaryButton onClick={() => setScreen("crm")}>Open CRM</SecondaryButton></div><div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4"><div className="font-black text-purple-700">Resume transaction available</div><p className="text-sm font-semibold text-purple-900/80">Business 36-month order for John’s Barber Shop. Last saved step: Files & Links.</p><div className="mt-3 flex gap-2"><PrimaryButton onClick={() => openOrder(false)}>Resume Transaction</PrimaryButton><button className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">X Delete Draft</button></div></div></div><div className="card p-5"><h3 className="text-lg font-black">Latest Action Flags</h3><div className="mt-4 grid gap-3"><Action flag="green" title="Client verified" text="seller.bwilson verified phone for account #48291736." /><Action flag="green" title="Promo applied" text="Business 36-month bundle applied." /><Action flag="red" title="Access denied" text="PIN attempt failed for account #74829104." /></div></div></div></>; }

function OrderFlow(p: { order: OrderData; setOrder: (o: OrderData) => void; orderStep: OrderStep; setOrderStep: (s: OrderStep) => void; highestStep: number; setHighestStep: (n: number) => void; nextStep: () => void; editStep: (s: OrderStep) => void; editingFromReview: boolean; smsCode: string; setSmsCode: (v: string) => void; smsStatus: string; sendSmsPin: () => void; verifySmsPin: () => void; business36: ReturnType<typeof calculatePackagePrice>; business12: ReturnType<typeof calculatePackagePrice>; aiRequest: string; setAiRequest: (v: string) => void; ai: ReturnType<typeof buildConfirmationMessage>; toast: (type: "green" | "red", text: string) => void }) {
  const currentIndex = steps.findIndex((s) => s.key === p.orderStep);
  return <><Header eyebrow="Place New Order" title="Website order flow"><SecondaryButton>Auto-saved draft</SecondaryButton></Header><div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-black text-slate-600">Next best action: {steps[currentIndex].next}</div><div className="mb-5 flex flex-wrap gap-2">{steps.map((s, i) => { const unlocked = i <= p.highestStep; const active = s.key === p.orderStep; return <button key={s.key} disabled={!unlocked} onClick={() => unlocked && p.setOrderStep(s.key)} className={`rounded-full px-3 py-2 text-xs font-black ${active ? "bg-purple-700 text-white" : unlocked ? "bg-green-100 text-green-700" : "cursor-not-allowed border border-slate-200 bg-slate-100 text-slate-400"}`}>{i + 1} {s.label}</button>; })}</div>{p.orderStep === "client" && <ClientStep {...p} />}{p.orderStep === "bundle" && <BundleStep {...p} />}{p.orderStep === "files" && <FilesStep {...p} />}{p.orderStep === "domains" && <DomainsStep {...p} />}{p.orderStep === "contract" && <ContractStep {...p} />}{p.orderStep === "review" && <ReviewStep {...p} />}</>;
}

function ClientStep(p: Parameters<typeof OrderFlow>[0]) { const o = p.order; return <div className="grid grid-cols-[1.5fr_.9fr] gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Client Account Setup</h3><p className="mt-1 text-sm text-slate-500">Send a temporary SMS PIN branded from RPE Studios. Code expires in 10 minutes once Twilio is connected.</p><div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1"><Field label="Customer Name" value={o.customerName} onChange={(v) => p.setOrder({ ...o, customerName: v })} /><Field label="Business Name" value={o.businessName} onChange={(v) => p.setOrder({ ...o, businessName: v })} /><Field label="Phone Number" value={o.phone} onChange={(v) => p.setOrder({ ...o, phone: v, phoneVerified: false })} /><Field label="Email Address" value={o.email} onChange={(v) => p.setOrder({ ...o, email: v })} /><Field label="Industry" value={o.industry} onChange={(v) => p.setOrder({ ...o, industry: v })} /><Field label="Google Business Link" value={o.googleLink} onChange={(v) => p.setOrder({ ...o, googleLink: v })} /></div><div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"><div className="font-black">SMS Verification</div><p className="text-sm text-slate-500">RPE Studios verification PIN. Demo PIN: 123456 until Twilio env vars are live.</p><div className="mt-3 flex flex-wrap gap-2"><PrimaryButton onClick={p.sendSmsPin}>Send SMS PIN</PrimaryButton><input className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" placeholder="Enter PIN" value={p.smsCode} onChange={(e) => p.setSmsCode(e.target.value)} /><SecondaryButton onClick={p.verifySmsPin}>Verify PIN</SecondaryButton><SecondaryButton onClick={p.sendSmsPin}>Resend Code</SecondaryButton></div><p className="mt-2 text-sm font-bold text-slate-500">{p.smsStatus || "Waiting to send PIN."}</p></div><div className="mt-4 flex gap-2"><PrimaryButton onClick={p.nextStep}>{p.editingFromReview ? "Save Changes" : "Continue"}</PrimaryButton></div></div><div className="card p-5"><h3 className="text-lg font-black">Verification Status</h3><div className="mt-4 grid gap-3"><Status label="Phone" value={o.phoneVerified ? "✓ Verified" : "Pending"} color={o.phoneVerified ? "green" : "amber"} /><Status label="Email" value="Verification queued" color="amber" /><Status label="Account Number" value="48291736" color="purple" /><Status label="Account PIN" value="Hidden until SMS verified" color="red" /></div></div></div>; }

function BundleStep(p: Parameters<typeof OrderFlow>[0]) { const o = p.order; const selected = calculatePackagePrice(o.packageKey, o.term, true); return <div className="grid gap-4"><div className="rounded-2xl border border-purple-200 bg-purple-50 p-4"><div className="font-black text-purple-700">Price Lock Display</div><p className="text-sm font-semibold text-purple-900/80">Contract rate is locked while under contract. After contract expiration, account renews at the current base rate. Promos are not valid on month-to-month unless admin-created.</p></div>{o.term === "month_to_month" && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4"><div className="font-black text-amber-800">Month-to-Month Warning</div><p className="text-sm font-semibold text-amber-900/80">Month-to-month does not qualify for standard promos. Switch to 12 or 36 months for bundle savings.</p></div>}<div className="grid grid-cols-4 gap-4 max-2xl:grid-cols-2 max-lg:grid-cols-1">{Object.entries(packages).map(([key, pkg]) => <button key={key} onClick={() => p.setOrder({ ...o, packageKey: key as OrderData["packageKey"], term: key === "premium" ? "36_month" : o.term })} className={`card min-h-[255px] p-5 text-left ${o.packageKey === key ? "border-2 border-purple-700" : ""}`}><div className="mb-3 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{key === "business" ? "Most Popular" : key === "premium" ? "36 Month Only" : pkg.name}</div><h3 className="text-lg font-black">{pkg.name}</h3><p className="mt-1 text-sm text-slate-500">{pkg.description}</p><div className="mt-3 text-3xl font-black tracking-tight">{key === "business" && o.term === "36_month" ? "$175/mo" : `$${Object.values(pkg.terms)[0]}/mo`}</div><ul className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">{pkg.included.map((item) => <li key={item}>✓ {item}</li>)}</ul></button>)}</div><div className="card p-5"><h3 className="text-lg font-black">Contract Term</h3><div className="mt-3 flex flex-wrap gap-2"><SecondaryButton disabled={o.packageKey === "premium"} onClick={() => p.setOrder({ ...o, term: "month_to_month" })}>Month-to-Month</SecondaryButton><SecondaryButton disabled={o.packageKey === "premium"} onClick={() => p.setOrder({ ...o, term: "12_month" })}>12 Month</SecondaryButton><PrimaryButton onClick={() => p.setOrder({ ...o, term: "36_month" })}>36 Month</PrimaryButton></div><p className="mt-3 text-sm font-semibold text-slate-500">Selected: {packages[o.packageKey].name} • Setup ${selected.setup} • Monthly ${selected.monthly}</p></div><PrimaryButton onClick={p.nextStep}>{p.editingFromReview ? "Save Changes" : "Continue"}</PrimaryButton></div>; }

function FilesStep(p: Parameters<typeof OrderFlow>[0]) { return <div className="grid grid-cols-[1.1fr_.9fr] gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Files & Links</h3><TextBox label="Uploaded files / content notes" value={p.order.filesNote} onChange={(v) => p.setOrder({ ...p.order, filesNote: v })} /><div className="mt-4 grid grid-cols-3 gap-3 max-md:grid-cols-1"><div className="rounded-2xl border border-slate-200 p-4 font-bold">Logo upload</div><div className="rounded-2xl border border-slate-200 p-4 font-bold">Photos / gallery</div><div className="rounded-2xl border border-slate-200 p-4 font-bold">PDFs / menus</div></div><div className="mt-4"><PrimaryButton onClick={p.nextStep}>{p.editingFromReview ? "Save Changes" : "Continue"}</PrimaryButton></div></div><AiPreviewPanel {...p} /></div>; }
function AiPreviewPanel(p: Parameters<typeof OrderFlow>[0]) { return <div className="card p-5"><div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-black">AI Client Preview</h3><SecondaryButton onClick={() => p.setOrder({ ...p.order, presentationMode: !p.order.presentationMode })}>{p.order.presentationMode ? "Exit Presentation" : "Presentation Mode"}</SecondaryButton></div>{!p.order.presentationMode && <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="mb-2 font-black">AI Confirmation Before Action</div><textarea className="mb-3 min-h-[80px] w-full rounded-xl border border-slate-200 p-3 text-sm" value={p.aiRequest} onChange={(e) => p.setAiRequest(e.target.value)} /><p className="whitespace-pre-line text-sm font-semibold text-slate-600">{p.ai.sellerMessage}</p><div className="mt-3 flex flex-wrap gap-2"><PrimaryButton onClick={() => p.toast("green", "Paid feature confirmed and added to order.")}>Confirm & Add to Order</PrimaryButton><SecondaryButton onClick={() => p.toast("green", "Preview-only feature added without billing.")}>Preview Only</SecondaryButton></div></div>}<div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">{p.order.domain || "rpstudios-preview.com"} — draft preview</div><div className="bg-gradient-to-br from-white to-purple-50 p-7"><h3 className="text-4xl font-black tracking-tight">{p.order.businessName}</h3><p className="mt-2 max-w-xl font-semibold text-slate-600">Clean, professional website preview built for client presentation before publishing.</p><div className="mt-5 flex gap-2"><PrimaryButton>Book Now</PrimaryButton><SecondaryButton>View Services</SecondaryButton></div></div></div></div>; }

function DomainsStep(p: Parameters<typeof OrderFlow>[0]) { const o = p.order; return <div className="grid grid-cols-[1.2fr_.8fr] gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Domain Decision Required</h3><p className="mt-1 text-sm text-slate-500">Choose one path. Domains add $10/month unless included by Business 36-month promo.</p><div className="mt-4 grid gap-3">{[["new","Search/buy new domain"],["existing","Add existing customer-owned domain"],["temporary","Use temporary RP Studios preview URL"],["later","Assign domain later"]].map(([value,label]) => <label key={value} className="flex gap-2 rounded-2xl border border-slate-200 p-3 text-sm font-black"><input type="radio" checked={o.domainChoice === value} onChange={() => p.setOrder({ ...o, domainChoice: value as OrderData["domainChoice"] })} />{label}</label>)}</div>{o.domainChoice === "new" && <Field label="Domain to search" value={o.domain} onChange={(v) => p.setOrder({ ...o, domain: v })} />}{o.domainChoice === "existing" && <Field label="Existing domain" value={o.existingDomain} onChange={(v) => p.setOrder({ ...o, existingDomain: v })} />}<div className="mt-4"><PrimaryButton onClick={p.nextStep}>{p.editingFromReview ? "Save Changes" : "Continue"}</PrimaryButton></div></div><div className="card p-5"><h3 className="text-lg font-black">Domain Billing</h3><Status label="Setup" value="$0" color="green" /><div className="mt-3"><Status label="Monthly" value={o.packageKey === "business" && o.term === "36_month" ? "Free included" : "$10/mo"} color="purple" /></div><div className="mt-3"><Status label="Contract" value="1 year" color="amber" /></div><div className="mt-3"><Status label="Cancel Fee" value="$35" color="red" /></div></div></div>; }

function ContractStep(p: Parameters<typeof OrderFlow>[0]) { const price = calculatePackagePrice(p.order.packageKey, p.order.term, true); return <div className="grid grid-cols-[1.2fr_.8fr] gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Terms & Conditions / Contract Review</h3><ul className="mt-3 grid gap-2 text-sm font-semibold text-slate-600"><li>Website term: {p.order.term.replace("_", " ")}</li><li>Early termination fee: ${cancellationFee}</li><li>Buyer’s remorse: 30 days</li><li>Buyer’s remorse cancellation: $50 and setup is non-refundable</li><li>Promos are locked only while under contract</li><li>Domains are 1-year contracts with $35 cancellation fee</li></ul><label className="mt-4 flex gap-2 text-sm font-black"><input type="checkbox" checked={p.order.contractAcknowledged} onChange={(e) => p.setOrder({ ...p.order, contractAcknowledged: e.target.checked })} />Customer acknowledges all terms</label><Field label="Customer Signature" value={p.order.signature} onChange={(v) => p.setOrder({ ...p.order, signature: v })} /><div className="mt-4"><PrimaryButton onClick={p.nextStep}>{p.editingFromReview ? "Save Changes" : "Continue to Review Order"}</PrimaryButton></div></div><div className="card p-5"><h3 className="text-lg font-black">Contract Summary</h3><Status label="Setup" value={`$${price.setup}`} color="purple" /><div className="mt-3"><Status label="Monthly" value={`$${price.monthly}/mo`} color="green" /></div><div className="mt-3"><Status label="Site Contract" value={p.order.term} color="amber" /></div></div></div>; }

function ReviewStep(p: Parameters<typeof OrderFlow>[0]) { const price = calculatePackagePrice(p.order.packageKey, p.order.term, true); const domainFee = p.order.packageKey === "business" && p.order.term === "36_month" ? 0 : p.order.domainChoice === "new" || p.order.domainChoice === "existing" ? 10 : 0; return <div className="card p-5"><h3 className="text-lg font-black">Review Order</h3><p className="mt-1 text-sm text-slate-500">Review all submitted information. Edit any section, save changes, and return here automatically.</p><div className="mt-5 grid gap-4"><ReviewBlock title="Client Info" onEdit={() => p.editStep("client")} rows={[`Customer: ${p.order.customerName}`, `Business: ${p.order.businessName}`, `Phone: ${p.order.phone} ${p.order.phoneVerified ? "✓" : "pending"}`, `Email: ${p.order.email}`]} /><ReviewBlock title="Package & Promo" onEdit={() => p.editStep("bundle")} rows={[`Package: ${packages[p.order.packageKey].name}`, `Term: ${p.order.term}`, `Setup: $${price.setup}`, `Monthly: $${price.monthly}/mo`]} /><ReviewBlock title="Files & Links" onEdit={() => p.editStep("files")} rows={[p.order.filesNote]} /><ReviewBlock title="Domains" onEdit={() => p.editStep("domains")} rows={[`Decision: ${p.order.domainChoice}`, `Domain: ${p.order.domainChoice === "existing" ? p.order.existingDomain : p.order.domain || "N/A"}`, `Domain monthly: $${domainFee}`]} /><ReviewBlock title="Contract" onEdit={() => p.editStep("contract")} rows={[`Acknowledged: ${p.order.contractAcknowledged ? "Yes" : "No"}`, `Signature: ${p.order.signature || "Missing"}`]} /></div><div className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-4"><div className="font-black text-green-800">Final Total</div><p className="text-sm font-semibold text-green-900/80">Setup due today: ${price.setup}. Monthly recurring: ${price.monthly + domainFee}/mo.</p></div><div className="mt-5 flex flex-wrap gap-2"><PrimaryButton onClick={() => p.toast("green", "Order submitted. Contract, notes, and action records created.")}>Submit Order</PrimaryButton><SecondaryButton onClick={() => p.toast("green", "Review saved as draft.")}>Save Review Draft</SecondaryButton></div></div>; }
function ReviewBlock({ title, rows, onEdit }: { title: string; rows: string[]; onEdit: () => void }) { return <div className="rounded-2xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between gap-3"><h4 className="font-black">{title}</h4><SecondaryButton onClick={onEdit}>Edit</SecondaryButton></div><ul className="mt-2 grid gap-1 text-sm font-semibold text-slate-600">{rows.map((r, i) => <li key={i}>{r}</li>)}</ul></div>; }

function Client({ openOrder }: { openOrder: (reset?: boolean) => void }) { return <><Header eyebrow="Manage Clients / Seller view" title="John’s Barber Shop"><PrimaryButton onClick={() => openOrder(true)}>+ Add Website</PrimaryButton><SecondaryButton>Add Domain</SecondaryButton></Header><div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1"><Metric title="Account #" value="48291736" note="Random 8-digit" /><Metric title="Active Sites" value="2" note="Unlimited allowed" /><Metric title="Monthly Bill" value="$185" note="$175 site + $10 domain" /><Metric title="Contract" value="36 mo" note="Price locked while active" /></div><div className="mt-4 grid grid-cols-[1.35fr_.9fr] gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Sites & Active Services</h3><Table headers={["Site #", "Name", "Package", "Status"]} rows={sites.map((s) => [s.siteNumber, s.name, s.packageKey, s.status])} /></div><div className="card p-5"><h3 className="text-lg font-black">Billing & Contracts</h3><div className="mt-3 grid gap-3"><Status label="Active Contract" value="Business 36-month" color="green" /><Status label="Cancellation Fee" value={`$${cancellationFee}`} color="purple" /><Status label="Contract PDFs" value="Stored on account" color="green" /></div></div></div></>; }
function Crm() { return <><Header eyebrow="CRM / Leads" title="Lead tracking and AI lead finder"><PrimaryButton>+ Add Lead</PrimaryButton></Header><div className="card p-5"><Table headers={["Business", "Industry", "Status", "AI Score", "Next Step"]} rows={[["Bright Smile Dental", "Healthcare", "Follow Up", "92", "Call owner"], ["Elite Cuts", "Barber", "New", "91", "Send audit"], ["Metro Pest Pros", "Pest Control", "Qualified", "88", "Pitch Pro"]]} /></div></>; }
function Reporting() { return <><Header eyebrow="Reporting / Seller performance" title="Sales and contracted revenue" /><div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1"><Metric title="Closed Orders" value="7" note="This month" /><Metric title="Setup Revenue" value="$3,143" note="Collected setup fees" /><Metric title="Contracted MRR" value="$4,225" note="Only while under contract" /><Metric title="Domains Sold" value="$90" note="Monthly domain add-ons" /></div></>; }
function Knowledge() { return <><Header eyebrow="Knowledge Hub / Seller support" title="Ask questions and open seller resources" /><div className="card p-5"><h3 className="text-lg font-black">Ask Knowledge AI</h3><textarea className="mt-4 min-h-[100px] w-full rounded-2xl border border-slate-200 p-3 text-sm" defaultValue="How do I explain the Business 36-month plan?" /><div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4"><div className="font-black text-purple-700">Suggested answer</div><p className="mt-1 text-sm font-semibold text-purple-900/80">The 36-month bundle gives the lower monthly price, $150 off setup, and a free managed domain. Month-to-month is available, but promos do not apply unless admin builds one.</p></div></div></>; }
function AdminActions() { return <><Header eyebrow="Admin Panel / Leader access only" title="Seller Action Records"><SecondaryButton>Export CSV</SecondaryButton></Header><div className="card mb-4 p-5"><h3 className="text-lg font-black">Admin Override Reason</h3><Field label="Reason required before override" value="Customer present but SMS failed" /></div><div className="card p-5"><Table headers={["Time", "User", "Role", "Account", "Site", "Action", "Result"]} rows={actionRecords.map((r) => [new Date(r.timestamp).toLocaleString(), r.workingUser, r.role, r.accountNumber ?? "—", r.siteNumber ?? "—", r.actionType, r.result])} /></div></>; }
function Settings() { return <><Header eyebrow="Settings / Preferences" title="Account preferences" /><div className="grid grid-cols-2 gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Profile</h3><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Name" value="Brayden Wilson" /><Field label="Username" value="seller.bwilson" /><Field label="Role" value="Seller" /><Field label="Default Dashboard" value="Seller Home" /></div></div><div className="card p-5"><h3 className="text-lg font-black">Preferences</h3><p className="mt-1 text-sm text-slate-500">Dark mode belongs here only, not in the sidebar.</p><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Theme" value="Light" /><Field label="Notifications" value="Important only" /><Field label="Dashboard Density" value="Comfortable" /><Field label="Table Rows" value="25 rows" /></div></div></div></>; }
function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) { return <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr>{headers.map((h) => <th key={h} className="border-b border-slate-200 px-2 py-3 text-xs font-black uppercase tracking-widest text-slate-400">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="border-b border-slate-100 px-2 py-3 text-sm font-semibold text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>; }
