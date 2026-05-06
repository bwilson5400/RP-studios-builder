"use client";

import { useMemo, useState } from "react";
import { actionRecords, clients, currentUser, sites } from "@/lib/mock-data";
import { buildConfirmationMessage } from "@/lib/ai-builder";
import { calculatePackagePrice, cancellationFee, packages } from "@/lib/pricing";

type Screen = "home" | "order" | "bundle" | "ai" | "client" | "crm" | "reporting" | "knowledge" | "admin" | "settings";

const nav: { label: string; screen: Screen }[] = [
  { label: "Home", screen: "home" },
  { label: "Place New Order", screen: "order" },
  { label: "Bundle Builder", screen: "bundle" },
  { label: "AI Website Build", screen: "ai" },
  { label: "Manage Clients", screen: "client" },
  { label: "CRM / Leads", screen: "crm" },
  { label: "Reporting", screen: "reporting" },
  { label: "Knowledge Hub", screen: "knowledge" },
  { label: "Seller Action Records", screen: "admin" },
  { label: "Settings", screen: "settings" }
];

export default function Page() {
  const [screen, setScreen] = useState<Screen>("home");
  const [aiRequest, setAiRequest] = useState("Add an AI chatbot and make the site feel more premium.");
  const ai = useMemo(() => buildConfirmationMessage(aiRequest), [aiRequest]);
  const business36 = calculatePackagePrice("business", "36_month", true);
  const business12 = calculatePackagePrice("business", "12_month", true);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen grid-cols-[280px_1fr] max-lg:grid-cols-1">
        <aside className="border-r border-slate-200 bg-white p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-purple-700 font-black text-white shadow-lg">RP</div>
            <div>
              <h1 className="text-lg font-black leading-tight">RP Studios</h1>
              <p className="text-xs font-semibold text-slate-500">Builder OS</p>
            </div>
          </div>

          <div className="mb-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-black">{currentUser.name}</div>
            <div className="text-xs font-semibold text-slate-500">{currentUser.username}</div>
            <div className="mt-3 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">Seller</div>
          </div>

          <nav className="grid gap-1">
            {nav.map((item) => (
              <button
                key={item.screen}
                onClick={() => setScreen(item.screen)}
                className={`rounded-xl px-3 py-3 text-left text-sm font-black ${screen === item.screen ? "bg-purple-100 text-purple-700" : "bg-white text-slate-700 hover:bg-slate-50"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="p-7">
          {screen === "home" && <Home setScreen={setScreen} />}
          {screen === "order" && <Order setScreen={setScreen} />}
          {screen === "bundle" && <Bundle business36={business36} business12={business12} setScreen={setScreen} />}
          {screen === "ai" && <AiBuild aiRequest={aiRequest} setAiRequest={setAiRequest} ai={ai} />}
          {screen === "client" && <Client />}
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

function Header({ eyebrow, title, children }: { eyebrow: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4 max-md:flex-col max-md:items-start">
      <div>
        <div className="mb-1 text-sm font-bold text-slate-500">{eyebrow}</div>
        <h2 className="text-3xl font-black tracking-tight">{title}</h2>
      </div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function PrimaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="rounded-xl bg-purple-700 px-4 py-2.5 text-sm font-black text-white hover:bg-purple-900">{children}</button>;
}

function SecondaryButton({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return <button onClick={onClick} className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-black text-slate-900 hover:bg-slate-50">{children}</button>;
}

function Metric({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="card p-5">
      <h3 className="font-black">{title}</h3>
      <div className="mt-2 text-3xl font-black tracking-tight">{value}</div>
      <p className="mt-1 text-sm font-semibold text-slate-500">{note}</p>
    </div>
  );
}

function Home({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <>
      <Header eyebrow="Seller workspace / Today" title="Good afternoon, Brayden">
        <SecondaryButton>Search clients, sites, leads...</SecondaryButton>
        <PrimaryButton onClick={() => setScreen("order")}>+ Place New Order</PrimaryButton>
      </Header>

      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
        <Metric title="This Month Sales" value="7" note="Closed website orders" />
        <Metric title="Contracted MRR" value="$4,225" note="Only while under contract" />
        <Metric title="Pending Setup Fees" value="$1,047" note="2 accounts near auto-cancel" />
        <Metric title="Leads Ready" value="18" note="4 high-priority leads today" />
      </div>

      <div className="mt-4 grid grid-cols-[1.55fr_.9fr] gap-4 max-xl:grid-cols-1">
        <div className="card p-5">
          <h3 className="text-lg font-black">Active Workspace</h3>
          <p className="mt-1 text-slate-500">Quick actions for the seller: place an order, manage clients, open CRM, or continue an unfinished transaction.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton onClick={() => setScreen("order")}>Place Order</PrimaryButton>
            <SecondaryButton onClick={() => setScreen("client")}>Manage Clients</SecondaryButton>
            <SecondaryButton onClick={() => setScreen("crm")}>Open CRM</SecondaryButton>
          </div>
          <div className="mt-5 rounded-2xl border border-purple-200 bg-purple-50 p-4">
            <div className="font-black text-purple-700">Resume transaction available</div>
            <p className="text-sm font-semibold text-purple-900/80">Business 36-month order for John’s Barber Shop. Last saved step: Files & Links.</p>
            <div className="mt-3 flex gap-2">
              <PrimaryButton>Resume Transaction</PrimaryButton>
              <button className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">X Delete Draft</button>
            </div>
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-lg font-black">Latest Action Flags</h3>
          <div className="mt-4 grid gap-3">
            <Action flag="green" title="Client verified" text="seller.bwilson verified phone for account #48291736." />
            <Action flag="green" title="Promo applied" text="Business 36-month bundle applied." />
            <Action flag="red" title="Access denied" text="PIN attempt failed for account #74829104." />
          </div>
        </div>
      </div>
    </>
  );
}

function Action({ flag, title, text }: { flag: "green" | "red"; title: string; text: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3">
      <div className={`grid h-8 w-8 place-items-center rounded-full text-sm font-black text-white ${flag === "green" ? "bg-green-600" : "bg-red-600"}`}>{flag === "green" ? "✓" : "×"}</div>
      <div>
        <div className="font-black">{title}</div>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  );
}

function Steps({ current }: { current: number }) {
  const steps = ["Client Setup", "Bundle Builder", "Files & Links", "Domains", "Contract", "Cart"];
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {steps.map((step, index) => (
        <span key={step} className={`rounded-full px-3 py-2 text-xs font-black ${index + 1 === current ? "bg-purple-700 text-white" : index + 1 < current ? "bg-green-100 text-green-700" : "border border-slate-200 bg-white text-slate-500"}`}>
          {index + 1} {step}
        </span>
      ))}
    </div>
  );
}

function Field({ label, value, placeholder }: { label: string; value?: string; placeholder?: string }) {
  return (
    <label className="grid gap-1 text-xs font-black text-slate-700">
      {label}
      <input className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold" defaultValue={value} placeholder={placeholder} />
    </label>
  );
}

function Order({ setScreen }: { setScreen: (screen: Screen) => void }) {
  return (
    <>
      <Header eyebrow="Place New Order / Client Setup" title="Create a website order"><SecondaryButton>Save Draft</SecondaryButton></Header>
      <Steps current={1} />
      <div className="grid grid-cols-[1.5fr_.9fr] gap-4 max-xl:grid-cols-1">
        <div className="card p-5">
          <h3 className="text-lg font-black">New Client Account</h3>
          <p className="mt-1 text-sm text-slate-500">Account setup happens inside order placement. Phone and email verification are required.</p>
          <div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1">
            <Field label="Customer Name" value="John Smith" />
            <Field label="Business Name" value="John’s Barber Shop" />
            <Field label="Phone Number" value="(205) 555-0181" />
            <Field label="Email Address" value="john@johnsbarber.com" />
            <Field label="Industry" value="Barber / Salon" />
            <Field label="Google Business Link" placeholder="Paste link..." />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <PrimaryButton>Send SMS Verification</PrimaryButton>
            <SecondaryButton>Send Email Verification</SecondaryButton>
            <PrimaryButton onClick={() => setScreen("bundle")}>Continue to Bundle Builder</PrimaryButton>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-black">Verification & Security</h3>
          <div className="mt-4 grid gap-3">
            <Status label="Phone" value="Verified" color="green" />
            <Status label="Email" value="Pending" color="amber" />
            <Status label="Account Number" value="48291736" color="purple" />
            <Status label="Account PIN" value="Hidden until SMS verified" color="red" />
          </div>
        </div>
      </div>
    </>
  );
}

function Status({ label, value, color }: { label: string; value: string; color: "green" | "red" | "purple" | "amber" }) {
  const cls = color === "green" ? "bg-green-100 text-green-700" : color === "red" ? "bg-red-100 text-red-700" : color === "amber" ? "bg-amber-100 text-amber-700" : "bg-purple-100 text-purple-700";
  return <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3"><div className="font-black">{label}</div><span className={`rounded-full px-2.5 py-1 text-xs font-black ${cls}`}>{value}</span></div>;
}

function Bundle({ business36, business12, setScreen }: { business36: ReturnType<typeof calculatePackagePrice>; business12: ReturnType<typeof calculatePackagePrice>; setScreen: (screen: Screen) => void }) {
  return (
    <>
      <Header eyebrow="Place New Order / Bundle Builder" title="Choose package, term, promos, and add-ons"><PrimaryButton onClick={() => setScreen("ai")}>Start AI Build</PrimaryButton></Header>
      <Steps current={2} />
      <div className="mb-4 rounded-2xl border border-purple-200 bg-purple-50 p-4">
        <div className="font-black text-purple-700">Business promo selected</div>
        <p className="text-sm font-semibold text-purple-900/80">36-month Business: $199 base → ${business36.monthly}/mo promo, setup $499 → ${business36.setup}, free domain included. 12-month Business promo starts at ${business12.monthly}/mo.</p>
      </div>
      <div className="grid grid-cols-4 gap-4 max-2xl:grid-cols-2 max-lg:grid-cols-1">
        {Object.entries(packages).map(([key, pkg]) => (
          <div key={key} className={`card flex min-h-[320px] flex-col justify-between p-5 ${key === "business" ? "border-2 border-purple-700" : ""}`}>
            <div>
              <div className="mb-3 inline-flex rounded-full bg-purple-100 px-3 py-1 text-xs font-black text-purple-700">{key === "business" ? "Most Popular • Promo Applied" : key === "premium" ? "36 Month Only" : pkg.name}</div>
              <h3 className="text-lg font-black">{pkg.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{pkg.description}</p>
              <div className="mt-3 text-3xl font-black tracking-tight">{key === "business" ? "$175/mo" : `$${Object.values(pkg.terms)[0]}/mo`}</div>
              <ul className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">{pkg.included.map((item) => <li key={item}>✓ {item}</li>)}</ul>
            </div>
            {key === "business" ? <PrimaryButton>Selected</PrimaryButton> : <SecondaryButton>Select</SecondaryButton>}
          </div>
        ))}
      </div>
    </>
  );
}

function AiBuild({ aiRequest, setAiRequest, ai }: { aiRequest: string; setAiRequest: (value: string) => void; ai: ReturnType<typeof buildConfirmationMessage> }) {
  return (
    <>
      <Header eyebrow="AI Website Build / Preview before design" title="Build the site with plain English"><SecondaryButton>Save Draft</SecondaryButton><PrimaryButton>Generate Preview</PrimaryButton></Header>
      <div className="grid grid-cols-[1.05fr_.95fr] gap-4 max-xl:grid-cols-1">
        <div className="card p-5">
          <h3 className="text-lg font-black">AI Builder Chat</h3>
          <p className="mt-1 text-sm text-slate-500">The AI always confirms what it will do, explains why, discloses costs, then waits for seller approval.</p>
          <textarea className="mt-4 min-h-[110px] w-full rounded-2xl border border-slate-200 p-3 text-sm" value={aiRequest} onChange={(e) => setAiRequest(e.target.value)} />
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="mb-2 font-black">AI Confirmation Before Action</div>
            <p className="whitespace-pre-line text-sm font-semibold text-slate-600">{ai.sellerMessage}</p>
            <div className="mt-4 flex flex-wrap gap-2"><PrimaryButton>Confirm & Add to Order</PrimaryButton><SecondaryButton>Preview Only</SecondaryButton><button className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-black text-white">Cancel</button></div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="text-lg font-black">Client-Facing Draft Preview</h3>
          <p className="mt-1 text-sm text-slate-500">This preview works inside the builder before seller/client feedback or real publishing.</p>
          <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-100 px-4 py-2 text-xs font-black text-slate-500">johnsbarbershop.com — draft preview</div>
            <div className="bg-gradient-to-br from-white to-purple-50 p-7">
              <h3 className="text-4xl font-black tracking-tight">John’s Barber Shop</h3>
              <p className="mt-2 max-w-xl font-semibold text-slate-600">Clean cuts, easy booking, and a professional local brand built to convert walk-ins into loyal customers.</p>
              <div className="mt-5 flex gap-2"><PrimaryButton>Book Now</PrimaryButton><SecondaryButton>View Services</SecondaryButton></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Client() {
  return (
    <>
      <Header eyebrow="Manage Clients / Seller view" title="John’s Barber Shop"><PrimaryButton>+ Add Website</PrimaryButton><SecondaryButton>Add Domain</SecondaryButton></Header>
      <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1">
        <Metric title="Account #" value="48291736" note="Random 8-digit" />
        <Metric title="Active Sites" value="2" note="Unlimited allowed" />
        <Metric title="Monthly Bill" value="$185" note="$175 site + $10 domain" />
        <Metric title="Contract" value="36 mo" note="Price locked while active" />
      </div>
      <div className="mt-4 grid grid-cols-[1.35fr_.9fr] gap-4 max-xl:grid-cols-1">
        <div className="card p-5"><h3 className="text-lg font-black">Sites & Active Services</h3><Table headers={["Site #", "Name", "Package", "Status"]} rows={sites.map((s) => [s.siteNumber, s.name, s.packageKey, s.status])} /></div>
        <div className="card p-5"><h3 className="text-lg font-black">Billing & Contracts</h3><div className="mt-3 grid gap-3"><Status label="Active Contract" value="Business 36-month" color="green" /><Status label="Cancellation Fee" value={`$${cancellationFee}`} color="purple" /><Status label="Contract PDFs" value="Stored on account" color="green" /></div></div>
      </div>
    </>
  );
}

function Crm() { return <><Header eyebrow="CRM / Leads" title="Lead tracking and AI lead finder"><PrimaryButton>+ Add Lead</PrimaryButton></Header><div className="card p-5"><Table headers={["Business", "Industry", "Status", "AI Score", "Next Step"]} rows={[["Bright Smile Dental", "Healthcare", "Follow Up", "92", "Call owner"], ["Elite Cuts", "Barber", "New", "91", "Send audit"], ["Metro Pest Pros", "Pest Control", "Qualified", "88", "Pitch Pro"]]} /></div></>; }

function Reporting() { return <><Header eyebrow="Reporting / Seller performance" title="Sales and contracted revenue" /><div className="grid grid-cols-4 gap-4 max-xl:grid-cols-2 max-md:grid-cols-1"><Metric title="Closed Orders" value="7" note="This month" /><Metric title="Setup Revenue" value="$3,143" note="Collected setup fees" /><Metric title="Contracted MRR" value="$4,225" note="Only while under contract" /><Metric title="Domains Sold" value="$90" note="Monthly domain add-ons" /></div></>; }

function Knowledge() { return <><Header eyebrow="Knowledge Hub / Seller support" title="Ask questions and open seller resources" /><div className="card p-5"><h3 className="text-lg font-black">Ask Knowledge AI</h3><textarea className="mt-4 min-h-[100px] w-full rounded-2xl border border-slate-200 p-3 text-sm" defaultValue="How do I explain the Business 36-month plan?" /><div className="mt-4 rounded-2xl border border-purple-200 bg-purple-50 p-4"><div className="font-black text-purple-700">Suggested answer</div><p className="mt-1 text-sm font-semibold text-purple-900/80">The 36-month bundle gives the lower monthly price, $150 off setup, and a free managed domain. Month-to-month is available, but promos do not apply unless admin builds one.</p></div></div></>; }

function AdminActions() { return <><Header eyebrow="Admin Panel / Leader access only" title="Seller Action Records"><SecondaryButton>Export CSV</SecondaryButton></Header><div className="card p-5"><Table headers={["Time", "User", "Role", "Account", "Site", "Action", "Result"]} rows={actionRecords.map((r) => [new Date(r.timestamp).toLocaleString(), r.workingUser, r.role, r.accountNumber ?? "—", r.siteNumber ?? "—", r.actionType, r.result])} /></div></>; }

function Settings() { return <><Header eyebrow="Settings / Preferences" title="Account preferences" /><div className="grid grid-cols-2 gap-4 max-xl:grid-cols-1"><div className="card p-5"><h3 className="text-lg font-black">Profile</h3><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Name" value="Brayden Wilson" /><Field label="Username" value="seller.bwilson" /><Field label="Role" value="Seller" /><Field label="Default Dashboard" value="Seller Home" /></div></div><div className="card p-5"><h3 className="text-lg font-black">Preferences</h3><p className="mt-1 text-sm text-slate-500">Dark mode belongs here only, not in the sidebar.</p><div className="mt-4 grid grid-cols-2 gap-3"><Field label="Theme" value="Light" /><Field label="Notifications" value="Important only" /><Field label="Dashboard Density" value="Comfortable" /><Field label="Table Rows" value="25 rows" /></div></div></div></>; }

function Table({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="mt-4 overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr>{headers.map((h) => <th key={h} className="border-b border-slate-200 px-2 py-3 text-xs font-black uppercase tracking-widest text-slate-400">{h}</th>)}</tr></thead><tbody>{rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j} className="border-b border-slate-100 px-2 py-3 text-sm font-semibold text-slate-700">{cell}</td>)}</tr>)}</tbody></table></div>;
}
