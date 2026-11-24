import { useState } from "react";
import { CheckCircle2, ChevronDown, Plus, ShieldCheck, UserPlus } from "lucide-react";
import { DEFENDER_PLANS, FRAMEWORKS, POLICIES, RECS } from "../data";
import { Badge, Btn, Card, Icon, PageHeader, ScoreRing, sevTone, Tabs, Toggle } from "../ui";
import { recFixed, scoreColor, scoreLabel, secureScore, uid, useNav, useStore } from "../store";
import { cn } from "../utils/cn";
import { Sentinel, Network, KeyVault } from "./SecurityOps";

const TABS = [
  { id: "overview", label: "Overview", icon: "ShieldCheck" },
  { id: "defender", label: "Defender plans", icon: "Shield" },
  { id: "sentinel", label: "Sentinel", icon: "Radar" },
  { id: "identity", label: "Identity (Entra ID)", icon: "Fingerprint" },
  { id: "network", label: "Network & Firewall", icon: "Flame" },
  { id: "keyvault", label: "Key Vault", icon: "KeyRound" },
  { id: "compliance", label: "Compliance", icon: "FileCheck" },
];

function Overview() {
  const { state, fixRec } = useStore();
  const { go } = useNav();
  const sc = secureScore(state);
  const [openId, setOpenId] = useState<string | null>(null);
  const open = RECS.filter((r) => !recFixed(state, r.id));
  const fixed = RECS.filter((r) => recFixed(state, r.id));
  const count = (s: string) => open.filter((r) => r.severity === s).length;
  const col = scoreColor(sc.pct);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex items-center gap-6 p-6 lg:col-span-1">
          <ScoreRing value={sc.pct} size={150} color={col} label={scoreLabel(sc.pct)} />
          <div>
            <p className="text-sm text-slate-500">Secure score</p>
            <p className="text-2xl font-semibold text-slate-900">{sc.got}<span className="text-base text-slate-400"> / {sc.total}</span></p>
            <p className="mt-1 text-xs text-slate-500">points earned by fixing recommendations</p>
          </div>
        </Card>
        <div className="grid grid-cols-3 gap-4 lg:col-span-2">
          {[
            { l: "High severity", v: count("High"), c: "#d13438" },
            { l: "Medium severity", v: count("Medium"), c: "#f59e0b" },
            { l: "Low severity", v: count("Low"), c: "#0078d4" },
          ].map((s) => (
            <Card key={s.l} className="flex flex-col justify-center p-5">
              <p className="text-4xl font-semibold" style={{ color: s.c }}>{s.v}</p>
              <p className="mt-1 text-sm text-slate-500">{s.l}</p>
              <div className="mt-3 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full" style={{ width: `${(s.v / RECS.length) * 100 * 2}%`, background: s.c }} /></div>
            </Card>
          ))}
          <Card className="col-span-3 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-violet-50 to-sky-50 p-5">
            <div className="flex items-center gap-3"><ShieldCheck className="h-8 w-8 text-violet-600" />
              <div><p className="font-semibold text-slate-800">Zero Trust mindset</p><p className="text-sm text-slate-500">Verify explicitly · Use least privilege · Assume breach</p></div></div>
            <div className="flex gap-2">
              <Btn variant="outline" onClick={() => go("discover")}>Learn how</Btn>
              {open.length > 0 && <Btn onClick={() => open.forEach((r) => fixRec(r.id))}>Fix all ({open.length})</Btn>}
            </div>
          </Card>
        </div>
      </div>

      <Card>
        <div className="border-b border-slate-100 px-5 py-3.5"><h3 className="font-semibold text-slate-800">Recommendations <span className="text-slate-400">({open.length} open)</span></h3></div>
        {open.length === 0 && <p className="p-8 text-center text-emerald-600">🎉 Perfect posture — all recommendations are resolved.</p>}
        <ul className="divide-y divide-slate-100">
          {open.map((r) => (
            <li key={r.id} className="px-5 py-3.5">
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setOpenId(openId === r.id ? null : r.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <ChevronDown className={cn("h-4 w-4 shrink-0 text-slate-400 transition", openId === r.id && "rotate-180")} />
                  <Badge tone={sevTone(r.severity)}>{r.severity}</Badge>
                  <span className="text-sm font-medium text-slate-800">{r.title}</span>
                </button>
                <span className="text-xs font-medium text-slate-400">+{r.weight} pts</span>
                {r.tab !== "overview" && <Btn variant="ghost" className="!py-1 !text-xs" onClick={() => go("security", { tab: r.tab })}>Open</Btn>}
                <Btn className="!py-1 !text-xs" onClick={() => fixRec(r.id)}>Quick fix</Btn>
              </div>
              {openId === r.id && (
                <div className="animate-pop ml-7 mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                  <p>{r.desc}</p>
                  {r.mitre && <p className="mt-2 text-xs text-slate-400">MITRE ATT&CK: <span className="font-mono text-slate-600">{r.mitre}</span></p>}
                </div>
              )}
            </li>
          ))}
        </ul>
        {fixed.length > 0 && (
          <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Healthy ({fixed.length})</p>
            <div className="flex flex-wrap gap-2">{fixed.map((r) => <span key={r.id} className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs text-emerald-700 ring-1 ring-emerald-200"><CheckCircle2 className="h-3.5 w-3.5" />{r.title.length > 48 ? r.title.slice(0, 46) + "…" : r.title}</span>)}</div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Defender() {
  const { state, set, log } = useStore();
  const on = Object.values(state.defender).filter(Boolean).length;
  const cost = DEFENDER_PLANS.reduce((a, p) => a + (state.defender[p.id] ? p.price : 0), 0);
  const toggle = (id: string, name: string, v: boolean) => {
    set((s) => ({ ...s, defender: { ...s.defender, [id]: v } }));
    log(`${v ? "Enabled" : "Disabled"} ${name}`, "security");
  };
  return (
    <div className="space-y-5">
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#0a1a3f] to-[#3b2a9c] p-6 text-white">
        <div><p className="text-sm text-blue-200">Workload protection coverage</p>
          <p className="text-3xl font-semibold">{on} <span className="text-lg text-blue-200">of {DEFENDER_PLANS.length} plans enabled</span></p>
          <p className="mt-1 text-sm text-blue-200">Simulated cost: ${cost}/month per protected resource</p></div>
        <Btn variant="outline" className="!border-0 !text-blue-800" onClick={() => { set((s) => ({ ...s, defender: Object.fromEntries(DEFENDER_PLANS.map((p) => [p.id, true])) })); log("Enabled all Defender plans", "security"); }}>Enable all plans</Btn>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DEFENDER_PLANS.map((p) => {
          const v = !!state.defender[p.id];
          return (
            <Card key={p.id} className={cn("p-5 transition", v && "ring-2 ring-emerald-400/50")}>
              <div className="flex items-start justify-between">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-white", v ? "bg-emerald-600" : "bg-slate-400")}><Icon name={p.icon} className="h-5 w-5" /></span>
                <Toggle checked={v} onChange={(x) => toggle(p.id, p.name, x)} />
              </div>
              <h4 className="mt-3 font-semibold text-slate-800">{p.name}</h4>
              <p className="mt-1 text-sm text-slate-500">{p.desc}</p>
              <div className="mt-3 flex items-center justify-between text-xs"><Badge tone={v ? "green" : "slate"}>{v ? "On" : "Off"}</Badge><span className="text-slate-400">${p.price}/resource/mo</span></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Identity() {
  const { state, set, log, toast } = useStore();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Reader");
  const mfaCount = state.users.filter((u) => u.mfa).length;
  const setMfa = (id: string, v: boolean) => {
    set((s) => ({ ...s, users: s.users.map((u) => (u.id === id ? { ...u, mfa: v } : u)) }));
  };
  const add = () => {
    if (!name.trim()) return;
    const email = name.trim().toLowerCase().replace(/\s+/g, ".") + "@ramzure.dev";
    set((s) => ({ ...s, users: [...s.users, { id: uid(), name: name.trim(), email, role, mfa: false, last: "Never" }] }));
    log(`Invited ${name.trim()} as ${role}`, "info"); toast(`Invited ${name.trim()}`); setName("");
  };
  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="font-semibold text-slate-800">Users & MFA</h3>
          <Badge tone={mfaCount === state.users.length ? "green" : "amber"}>{mfaCount}/{state.users.length} protected with MFA</Badge>
        </div>
        <ul className="divide-y divide-slate-100">
          {state.users.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-5 py-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-violet-500 text-sm font-semibold text-white">{u.name.charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-slate-800">{u.name}</p><p className="truncate text-xs text-slate-400">{u.role} · last sign-in {u.last}</p></div>
              <span className="hidden text-xs text-slate-500 sm:block">{u.mfa ? "MFA enforced" : "No MFA"}</span>
              <Toggle checked={u.mfa} onChange={(v) => setMfa(u.id, v)} />
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/60 p-4">
          <input value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === "Enter" && add()} placeholder="Full name" className="min-w-[140px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-az" />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm">
            {["Reader", "Contributor", "Developer", "Security Reader", "Owner"].map((r) => <option key={r}>{r}</option>)}
          </select>
          <Btn onClick={add}><UserPlus className="h-4 w-4" /> Invite</Btn>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <div className="border-b border-slate-100 px-5 py-3.5"><h3 className="font-semibold text-slate-800">Conditional Access</h3><p className="text-xs text-slate-400">If signal → then enforce control</p></div>
        <ul className="divide-y divide-slate-100">
          {POLICIES.map((p) => (
            <li key={p.id} className="flex items-start gap-3 px-5 py-3.5">
              <div className="flex-1"><p className="text-sm font-medium text-slate-800">{p.name}</p><p className="text-xs text-slate-500">{p.desc}</p></div>
              <Toggle checked={!!state.policies[p.id]} onChange={(v) => { set((s) => ({ ...s, policies: { ...s.policies, [p.id]: v } })); log(`${v ? "Enabled" : "Disabled"} policy: ${p.name}`, "security"); }} />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Compliance() {
  const { state } = useStore();
  const pct = secureScore(state).pct;
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {FRAMEWORKS.map((f) => {
        const v = Math.min(100, Math.round(f.base + pct * 0.78));
        const passed = Math.round((f.controls * v) / 100);
        return (
          <Card key={f.name} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3"><span className="rounded-lg bg-sky-50 p-2 text-az"><Icon name="FileCheck" className="h-5 w-5" /></span>
                <div><p className="font-semibold text-slate-800">{f.name}</p><p className="text-xs text-slate-400">{passed} of {f.controls} controls passing</p></div></div>
              <span className="text-2xl font-semibold" style={{ color: scoreColor(v) }}>{v}%</span>
            </div>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${v}%`, background: scoreColor(v) }} /></div>
          </Card>
        );
      })}
      <Card className="p-5 md:col-span-2"><p className="text-sm text-slate-500"><Plus className="mr-1 inline h-4 w-4" />Compliance is computed from your secure score — fix recommendations in the Overview tab to raise every framework's percentage. Values are illustrative for learning purposes.</p></Card>
    </div>
  );
}

export default function Security() {
  const { nav, go } = useNav();
  const tab = nav.tab ?? "overview";
  const { state } = useStore();
  const sc = secureScore(state);
  return (
    <div>
      <PageHeader icon="ShieldCheck" color="#6d28d9" title="Security Center" subtitle="Defender for Cloud · Sentinel · Entra ID · Key Vault · Network security"
        actions={<Badge tone={sc.pct < 40 ? "red" : sc.pct < 70 ? "amber" : "green"} className="!px-3 !py-1 !text-sm">Secure score {sc.pct}%</Badge>} />
      <Tabs tabs={TABS} value={tab} onChange={(id) => go("security", { tab: id })} />
      {tab === "overview" && <Overview />}
      {tab === "defender" && <Defender />}
      {tab === "sentinel" && <Sentinel />}
      {tab === "identity" && <Identity />}
      {tab === "network" && <Network />}
      {tab === "keyvault" && <KeyVault />}
      {tab === "compliance" && <Compliance />}
    </div>
  );
}
