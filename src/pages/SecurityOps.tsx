import { useCallback, useEffect, useRef, useState } from "react";
import { Ban, Copy, Eye, EyeOff, Lock, Plus, RefreshCw, ShieldAlert, ShieldCheck, Trash2, X, Zap } from "lucide-react";
import { COUNTRIES, THREAT_TYPES } from "../data";
import { Badge, Btn, Card, Icon, sevTone, Toggle } from "../ui";
import { genSecret, timeAgo, uid, useStore } from "../store";
import { cn } from "../utils/cn";

/* ================= SENTINEL ================= */
interface Ev {
  id: string; time: number; name: string; sev: string; mitre: string; ip: string; country: string;
  target: string; port: string; status: "New" | "Blocked" | "Dismissed";
}
const rndIp = () => `${[185, 45, 91, 103, 194, 77, 62, 212][Math.floor(Math.random() * 8)]}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 254) + 1}`;
const pick = <T,>(a: readonly T[]) => a[Math.floor(Math.random() * a.length)];

export function Sentinel() {
  const { state, set, log, toast } = useStore();
  const [events, setEvents] = useState<Ev[]>([]);
  const [live, setLive] = useState(true);
  const [auto, setAuto] = useState(false);
  const [total, setTotal] = useState(0);
  const autoRef = useRef(auto);
  autoRef.current = auto;

  const block = useCallback((e: Ev, automatic = false) => {
    set((s) => ({
      ...s,
      blocked: s.blocked + 1,
      nsg: [{ id: uid(), priority: 90 + s.nsg.filter((r) => r.name.startsWith("Block-")).length, name: `Block-${e.ip}`, port: "*", protocol: "*", source: e.ip, action: "Deny" }, ...s.nsg],
    }));
    setEvents((evs) => evs.map((x) => (x.id === e.id ? { ...x, status: "Blocked" } : x)));
    log(`${automatic ? "Playbook auto-blocked" : "Blocked"} ${e.ip} (${e.name})`, "security");
    if (!automatic) toast(`Deny rule created for ${e.ip}`, "security");
  }, [set, log, toast]);

  const gen = useCallback((): Ev => {
    const t = pick(THREAT_TYPES);
    return {
      id: uid(), time: Date.now(), name: t.name, sev: t.sev, mitre: t.mitre, ip: rndIp(), country: pick(COUNTRIES),
      target: pick(["vm-web-01", "app-ramzure-portal", "sql-orders-db", "kv-ramzure-prod", "stramzuredata01"]), port: t.port, status: "New",
    };
  }, []);

  useEffect(() => { setEvents(Array.from({ length: 4 }, gen).map((e, i) => ({ ...e, time: Date.now() - i * 40000 }))); setTotal(4); }, [gen]);

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => {
      const e = gen();
      setTotal((n) => n + 1);
      setEvents((evs) => [e, ...evs].slice(0, 14));
      if (autoRef.current && e.sev === "High") setTimeout(() => block(e, true), 600);
    }, 2800);
    return () => clearInterval(t);
  }, [live, gen, block]);

  const open = events.filter((e) => e.status === "New");
  const by = THREAT_TYPES.map((t) => ({ n: t.name, c: events.filter((e) => e.name === t.name).length })).filter((x) => x.c).sort((a, b) => b.c - a.c).slice(0, 5);
  const maxc = Math.max(1, ...by.map((b) => b.c));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Events ingested", v: (state.blocked * 37 + total).toLocaleString(), c: "text-az" },
          { l: "Open incidents", v: open.length, c: "text-amber-600" },
          { l: "Auto-blocked IPs", v: state.blocked.toLocaleString(), c: "text-emerald-600" },
          { l: "Mean time to respond", v: auto ? "0.6 s" : "4m 12s", c: "text-violet-600" },
        ].map((s) => <Card key={s.l} className="p-5"><p className="text-sm text-slate-500">{s.l}</p><p className={cn("mt-1 text-3xl font-semibold", s.c)}>{s.v}</p></Card>)}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800">
              <span className="relative flex h-2.5 w-2.5"><span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", live && "animate-ping bg-red-500")} /><span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", live ? "bg-red-500" : "bg-slate-300")} /></span>
              Live threat feed
            </h3>
            <div className="flex items-center gap-4 text-sm">
              <label className="flex items-center gap-2 text-slate-600"><Zap className="h-4 w-4 text-amber-500" />SOAR playbook<Toggle checked={auto} onChange={(v) => { setAuto(v); log(`Sentinel playbook auto-response ${v ? "enabled" : "disabled"}`, "security"); }} /></label>
              <Btn variant="outline" className="!py-1 !text-xs" onClick={() => setLive(!live)}>{live ? "Pause" : "Resume"}</Btn>
            </div>
          </div>
          <ul className="max-h-[480px] divide-y divide-slate-100 overflow-y-auto">
            {events.map((e) => (
              <li key={e.id} className={cn("animate-slide-in px-5 py-3", e.status !== "New" && "bg-slate-50/70 opacity-70")}>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={sevTone(e.sev)}>{e.sev}</Badge>
                  <span className="text-sm font-medium text-slate-800">{e.name}</span>
                  {e.status !== "New" && <Badge tone={e.status === "Blocked" ? "green" : "slate"}>{e.status}</Badge>}
                  <span className="ml-auto text-xs text-slate-400">{timeAgo(e.time)}</span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  <span className="font-mono text-slate-700">{e.ip}</span> ({e.country}) → {e.target}:{e.port} · <span className="font-mono">{e.mitre}</span>
                </p>
                {e.status === "New" && (
                  <div className="mt-2 flex gap-2">
                    <Btn variant="danger" className="!px-2.5 !py-1 !text-xs" onClick={() => block(e)}><Ban className="h-3.5 w-3.5" /> Block IP</Btn>
                    <Btn variant="outline" className="!px-2.5 !py-1 !text-xs" onClick={() => setEvents((evs) => evs.map((x) => (x.id === e.id ? { ...x, status: "Dismissed" } : x)))}><X className="h-3.5 w-3.5" /> Dismiss</Btn>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="mb-4 font-semibold text-slate-800">Top attack types</h3>
            <div className="space-y-3">
              {by.map((b) => (
                <div key={b.n}><div className="mb-1 flex justify-between text-xs"><span className="truncate text-slate-600">{b.n}</span><span className="font-medium text-slate-800">{b.c}</span></div>
                  <div className="h-2 rounded-full bg-slate-100"><div className="h-full rounded-full bg-gradient-to-r from-az to-violet-500 transition-all" style={{ width: `${(b.c / maxc) * 100}%` }} /></div></div>
              ))}
            </div>
          </Card>
          <Card className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white">
            <ShieldAlert className="h-6 w-6 text-amber-300" />
            <h4 className="mt-2 font-semibold">How a SOC works</h4>
            <p className="mt-1 text-sm text-slate-300">Sentinel ingests logs, correlates them with threat intelligence, and raises incidents. Analysts triage — or a playbook (SOAR) responds automatically. Toggle the playbook to auto-block High-severity attackers.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ================= NETWORK ================= */
export function Network() {
  const { state, set, log, toast } = useStore();
  const [f, setF] = useState({ name: "", port: "443", protocol: "TCP", source: "*", action: "Allow", priority: "200" });
  const risky = (r: { action: string; source: string; port: string }) => r.action === "Allow" && r.source === "*" && ["22", "3389", "*"].includes(r.port);
  const items = [
    { k: "firewall" as const, n: "Firewall", icon: "Flame", d: "Stateful L3–L7 filtering with threat-intelligence based deny lists and FQDN rules." },
    { k: "waf" as const, n: "Web Application Firewall", icon: "Layers", d: "Blocks SQL injection, XSS and OWASP Top 10 using managed rule sets." },
    { k: "ddos" as const, n: "DDoS Protection", icon: "ShieldAlert", d: "Always-on traffic monitoring with adaptive tuning against volumetric floods." },
  ];
  const add = () => {
    if (!f.name.trim()) return toast("Give the rule a name", "error");
    set((s) => ({ ...s, nsg: [...s.nsg, { id: uid(), priority: Number(f.priority) || 200, name: f.name.trim(), port: f.port, protocol: f.protocol, source: f.source, action: f.action as "Allow" | "Deny" }].sort((a, b) => a.priority - b.priority) }));
    log(`Added NSG rule ${f.name} (${f.action} ${f.port})`, "security");
    setF({ ...f, name: "" });
  };
  const inp = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-az";
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-3">
        {items.map((i) => (
          <Card key={i.k} className={cn("p-5", state.net[i.k] && "ring-2 ring-emerald-400/50")}>
            <div className="flex items-start justify-between">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-lg text-white", state.net[i.k] ? "bg-emerald-600" : "bg-slate-400")}><Icon name={i.icon} className="h-5 w-5" /></span>
              <Toggle checked={state.net[i.k]} onChange={(v) => { set((s) => ({ ...s, net: { ...s.net, [i.k]: v } })); log(`${v ? "Enabled" : "Disabled"} ${i.n}`, "security"); }} />
            </div>
            <h4 className="mt-3 font-semibold text-slate-800">{i.n}</h4>
            <p className="mt-1 text-sm text-slate-500">{i.d}</p>
          </Card>
        ))}
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div><h3 className="font-semibold text-slate-800">Network security group · inbound rules</h3><p className="text-xs text-slate-400">Lowest priority number is evaluated first</p></div>
          {state.nsg.some(risky) && <Badge tone="red"><ShieldAlert className="h-3 w-3" /> Risky rules detected</Badge>}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-slate-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
              {["Priority", "Name", "Port", "Protocol", "Source", "Action", ""].map((h) => <th key={h} className="px-4 py-2.5 font-medium">{h}</th>)}
            </tr></thead>
            <tbody>
              {state.nsg.map((r) => (
                <tr key={r.id} className={cn("border-t border-slate-100", risky(r) && "bg-red-50/60")}>
                  <td className="px-4 py-2.5 font-mono text-slate-600">{r.priority}</td>
                  <td className="px-4 py-2.5 font-medium text-slate-800">{r.name}{risky(r) && <ShieldAlert className="ml-1.5 inline h-3.5 w-3.5 text-red-500" />}</td>
                  <td className="px-4 py-2.5 font-mono">{r.port}</td><td className="px-4 py-2.5">{r.protocol}</td>
                  <td className="px-4 py-2.5 font-mono text-xs">{r.source === "*" ? "Any (Internet)" : r.source}</td>
                  <td className="px-4 py-2.5"><Badge tone={r.action === "Allow" ? "green" : "red"}>{r.action}</Badge></td>
                  <td className="px-4 py-2.5 text-right">
                    {r.priority !== 65000 && <>
                      {risky(r) && <button onClick={() => { set((s) => ({ ...s, nsg: s.nsg.map((x) => (x.id === r.id ? { ...x, source: "VirtualNetwork" } : x)) })); log(`Restricted ${r.name} to VirtualNetwork`, "security"); }} className="mr-2 text-xs font-semibold text-az hover:underline">Restrict</button>}
                      <button onClick={() => { set((s) => ({ ...s, nsg: s.nsg.filter((x) => x.id !== r.id) })); log(`Deleted NSG rule ${r.name}`, "security"); }} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex flex-wrap items-end gap-2 border-t border-slate-100 bg-slate-50/60 p-4">
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="Rule name" className={cn(inp, "w-36")} />
          <input value={f.port} onChange={(e) => setF({ ...f, port: e.target.value })} placeholder="Port" className={cn(inp, "w-20")} />
          <select value={f.protocol} onChange={(e) => setF({ ...f, protocol: e.target.value })} className={inp}><option>TCP</option><option>UDP</option><option>*</option></select>
          <select value={f.source} onChange={(e) => setF({ ...f, source: e.target.value })} className={inp}><option value="*">Any (Internet)</option><option>VirtualNetwork</option><option>10.0.0.0/24</option></select>
          <select value={f.action} onChange={(e) => setF({ ...f, action: e.target.value })} className={inp}><option>Allow</option><option>Deny</option></select>
          <input value={f.priority} onChange={(e) => setF({ ...f, priority: e.target.value })} placeholder="Priority" className={cn(inp, "w-24")} />
          <Btn onClick={add}><Plus className="h-4 w-4" /> Add rule</Btn>
        </div>
      </Card>
    </div>
  );
}

/* ================= KEY VAULT ================= */
export function KeyVault() {
  const { state, set, log, toast } = useStore();
  const [name, setName] = useState("");
  const [val, setVal] = useState("");
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const add = () => {
    if (!/^[a-zA-Z0-9-]{1,40}$/.test(name)) return toast("Secret names: letters, numbers and dashes only", "error");
    set((s) => ({ ...s, secrets: [{ id: uid(), name, value: val || genSecret(), createdAt: Date.now() }, ...s.secrets] }));
    log(`Created secret ${name} in kv-ramzure-prod`, "security"); setName(""); setVal("");
  };
  const copy = async (v: string) => { try { await navigator.clipboard.writeText(v); toast("Secret copied to clipboard (clears in your imagination 😉)", "info"); } catch { toast("Copy not available", "error"); } };
  const settings = [
    { k: "softDelete" as const, n: "Soft-delete", d: "Deleted items are recoverable for 90 days.", locked: true },
    { k: "purge" as const, n: "Purge protection", d: "Blocks permanent deletion until retention ends — defeats insider & ransomware deletion.", locked: false },
    { k: "rbac" as const, n: "RBAC permission model", d: "Use Entra ID roles rather than legacy access policies.", locked: false },
  ];
  return (
    <div className="grid gap-5 lg:grid-cols-5">
      <Card className="lg:col-span-3">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <h3 className="flex items-center gap-2 font-semibold text-slate-800"><Icon name="KeyRound" className="h-4 w-4 text-amber-600" />kv-ramzure-prod · Secrets</h3><Badge>{state.secrets.length} secrets</Badge>
        </div>
        <ul className="divide-y divide-slate-100">
          {state.secrets.length === 0 && <li className="p-8 text-center text-sm text-slate-400">No secrets yet.</li>}
          {state.secrets.map((s) => (
            <li key={s.id} className="px-5 py-3">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0"><p className="truncate text-sm font-medium text-slate-800">{s.name}</p><p className="text-xs text-slate-400">created {timeAgo(s.createdAt)}</p></div>
                <div className="flex shrink-0 gap-0.5">
                  <button title={shown[s.id] ? "Hide" : "Reveal"} onClick={() => { setShown({ ...shown, [s.id]: !shown[s.id] }); if (!shown[s.id]) log(`Secret ${s.name} was viewed`, "security"); }} className="rounded p-1.5 text-slate-500 hover:bg-slate-100">{shown[s.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                  <button title="Copy" onClick={() => copy(s.value)} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><Copy className="h-4 w-4" /></button>
                  <button title="Rotate" onClick={() => { set((st) => ({ ...st, secrets: st.secrets.map((x) => (x.id === s.id ? { ...x, value: genSecret(), createdAt: Date.now() } : x)) })); log(`Rotated secret ${s.name}`, "security"); toast("New secret version created", "security"); }} className="rounded p-1.5 text-slate-500 hover:bg-slate-100"><RefreshCw className="h-4 w-4" /></button>
                  <button title="Delete" onClick={() => { set((st) => ({ ...st, secrets: st.secrets.filter((x) => x.id !== s.id) })); log(`Deleted secret ${s.name}${state.kv.purge ? " (purge-protected, recoverable)" : ""}`, "security"); }} className="rounded p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-1.5 truncate rounded-md bg-slate-900 px-3 py-1.5 font-mono text-xs text-emerald-300">{shown[s.id] ? s.value : "•".repeat(28)}</p>
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-2 border-t border-slate-100 bg-slate-50/60 p-4">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="secret-name" className="min-w-[130px] flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-az" />
          <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="value (blank = auto-generate)" className="min-w-[160px] flex-[2] rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-az" />
          <Btn onClick={add}><Plus className="h-4 w-4" /> Add</Btn>
        </div>
      </Card>
      <div className="space-y-5 lg:col-span-2">
        <Card className="p-5">
          <h3 className="mb-3 font-semibold text-slate-800">Vault protection</h3>
          <div className="space-y-3">
            {settings.map((s) => (
              <div key={s.k} className="flex items-start justify-between gap-3 rounded-lg border border-slate-200 p-3">
                <div><p className="flex items-center gap-1.5 text-sm font-medium text-slate-800">{s.n}{s.locked && <Lock className="h-3 w-3 text-slate-400" />}</p><p className="text-xs text-slate-500">{s.d}</p></div>
                <Toggle checked={state.kv[s.k]} disabled={s.locked} onChange={(v) => { set((st) => ({ ...st, kv: { ...st.kv, [s.k]: v } })); log(`${v ? "Enabled" : "Disabled"} ${s.n} on kv-ramzure-prod`, "security"); }} />
              </div>
            ))}
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 p-5">
          <ShieldCheck className="h-6 w-6 text-amber-600" />
          <h4 className="mt-2 font-semibold text-slate-800">Never hard-code secrets</h4>
          <p className="mt-1 text-sm text-slate-600">Apps fetch secrets at runtime using a managed identity — no passwords in code or config. Rotate regularly and audit every access.</p>
        </Card>
      </div>
    </div>
  );
}
