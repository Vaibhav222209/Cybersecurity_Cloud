import { useEffect, useMemo, useState } from "react";
import { Play, Plus, Search, Square, Trash2, ShieldAlert, ShieldCheck, Lock, Unlock } from "lucide-react";
import { RES_DEFS, type ResType } from "../data";
import { Badge, Btn, Card, Icon, Modal, PageHeader } from "../ui";
import { monthlyCost, timeAgo, useNav, useStore, type Resource } from "../store";
import { cn } from "../utils/cn";

function posture(r: Resource) {
  const issues: string[] = [];
  if (r.publicAccess) issues.push("Public network access is enabled");
  if (!r.encrypted) issues.push("Encryption at rest is disabled");
  if (r.type === "webapp" && r.httpsOnly === false) issues.push("HTTPS-only is not enforced");
  if (r.type === "vm" && r.auth === "Password") issues.push("Password authentication enabled (prefer SSH keys)");
  return issues;
}

export default function Resources() {
  const { state, set, log, toast } = useStore();
  const { nav, go } = useNav();
  const [q, setQ] = useState("");
  const [type, setType] = useState<"all" | ResType>("all");
  const [status, setStatus] = useState("all");
  const [group, setGroup] = useState("all");
  const [sel, setSel] = useState<string | null>(null);

  useEffect(() => { if (nav.focus) setSel(nav.focus); }, [nav.focus]);

  const list = useMemo(() => state.resources.filter((r) =>
    (type === "all" || r.type === type) &&
    (status === "all" || r.status === status) &&
    (group === "all" || r.group === group) &&
    r.name.toLowerCase().includes(q.toLowerCase())), [state.resources, q, type, status, group]);

  const selected = state.resources.find((r) => r.id === sel) ?? null;

  const setStat = (r: Resource, s: Resource["status"]) => {
    set((st) => ({ ...st, resources: st.resources.map((x) => (x.id === r.id ? { ...x, status: s } : x)) }));
    log(`${s === "Running" ? "Started" : "Stopped (deallocated)"} ${r.name}`, "info");
    toast(`${r.name} ${s === "Running" ? "started" : "stopped"}`, "info");
  };
  const del = (r: Resource) => {
    set((st) => ({ ...st, resources: st.resources.filter((x) => x.id !== r.id) }));
    log(`Deleted ${r.name}`, "warn");
    toast(`${r.name} deleted`, "info");
    setSel(null);
  };
  const togglePublic = (r: Resource) => {
    set((st) => ({ ...st, resources: st.resources.map((x) => (x.id === r.id ? { ...x, publicAccess: !x.publicAccess } : x)) }));
    log(`${r.publicAccess ? "Disabled" : "Enabled"} public access on ${r.name}`, "security");
  };

  const sel2 = "rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-az";

  return (
    <div>
      <PageHeader icon="Boxes" title="All resources" subtitle={`${state.resources.length} resources across ${state.groups.length} resource groups`}
        actions={<Btn onClick={() => go("create")}><Plus className="h-4 w-4" /> Create</Btn>} />

      <Card>
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter by name…" className={cn(sel2, "w-full pl-9")} />
          </div>
          <select value={type} onChange={(e) => setType(e.target.value as "all" | ResType)} className={sel2}>
            <option value="all">All types</option>
            {Object.values(RES_DEFS).map((d) => <option key={d.type} value={d.type}>{d.label}</option>)}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel2}>
            <option value="all">All statuses</option><option>Running</option><option>Stopped</option><option>Available</option>
          </select>
          <select value={group} onChange={(e) => setGroup(e.target.value)} className={sel2}>
            <option value="all">All resource groups</option>
            {state.groups.map((g) => <option key={g}>{g}</option>)}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/60 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-2.5 font-medium">Name</th><th className="px-4 py-2.5 font-medium">Type</th>
                <th className="hidden px-4 py-2.5 font-medium md:table-cell">Resource group</th>
                <th className="hidden px-4 py-2.5 font-medium lg:table-cell">Location</th>
                <th className="px-4 py-2.5 font-medium">Status</th><th className="px-4 py-2.5 font-medium">Security</th>
                <th className="px-4 py-2.5 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const d = RES_DEFS[r.type];
                const iss = posture(r);
                return (
                  <tr key={r.id} className="border-b border-slate-100 last:border-0 hover:bg-sky-50/40">
                    <td className="px-4 py-3">
                      <button onClick={() => setSel(r.id)} className="flex items-center gap-3 text-left">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg text-white" style={{ background: d.color }}><Icon name={d.icon} className="h-4 w-4" /></span>
                        <span className="font-medium text-az hover:underline">{r.name}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{d.label}</td>
                    <td className="hidden px-4 py-3 text-slate-500 md:table-cell">{r.group}</td>
                    <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">{r.region}</td>
                    <td className="px-4 py-3">
                      <Badge tone={r.status === "Stopped" ? "slate" : "green"}>
                        <i className={cn("h-1.5 w-1.5 rounded-full", r.status === "Stopped" ? "bg-slate-400" : "bg-emerald-500")} />{r.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {iss.length === 0
                        ? <Badge tone="green"><ShieldCheck className="h-3 w-3" /> Healthy</Badge>
                        : <Badge tone="amber"><ShieldAlert className="h-3 w-3" /> {iss.length} issue{iss.length > 1 ? "s" : ""}</Badge>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        {(r.type === "vm" || r.type === "webapp" || r.type === "function" || r.type === "aks") && (
                          r.status === "Running"
                            ? <button title="Stop" onClick={() => setStat(r, "Stopped")} className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"><Square className="h-4 w-4" /></button>
                            : <button title="Start" onClick={() => setStat(r, "Running")} className="rounded-md p-1.5 text-emerald-600 hover:bg-emerald-50"><Play className="h-4 w-4" /></button>
                        )}
                        <button title="Delete" onClick={() => del(r)} className="rounded-md p-1.5 text-red-500 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {list.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-slate-500">No resources match your filters.</p>
              <Btn className="mt-4" onClick={() => go("create")}><Plus className="h-4 w-4" /> Create a resource</Btn>
            </div>
          )}
        </div>
      </Card>

      <Modal open={!!selected} onClose={() => setSel(null)} wide
        title={selected && <span className="flex items-center gap-2"><Icon name={RES_DEFS[selected.type].icon} className="h-5 w-5" style={{ color: RES_DEFS[selected.type].color }} />{selected.name}</span>}
        footer={selected && <>
          {(selected.type === "vm" || selected.type === "webapp") && (selected.status === "Running"
            ? <Btn variant="outline" onClick={() => setStat(selected, "Stopped")}><Square className="h-4 w-4" /> Stop</Btn>
            : <Btn variant="outline" onClick={() => setStat(selected, "Running")}><Play className="h-4 w-4" /> Start</Btn>)}
          <Btn variant="danger" onClick={() => del(selected)}><Trash2 className="h-4 w-4" /> Delete</Btn>
        </>}>
        {selected && (
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-800">Essentials</h4>
              <dl className="space-y-2 text-sm">
                {[
                  ["Type", RES_DEFS[selected.type].label], ["Resource group", selected.group], ["Location", selected.region],
                  ["Pricing tier", selected.sku], ["Status", selected.status], ["Created", timeAgo(selected.createdAt)],
                  ["Est. monthly cost", `$${monthlyCost(selected).toFixed(2)}`], ["Resource ID", `/subscriptions/ramzure/${selected.group}/${selected.name}`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 border-b border-slate-100 pb-2"><dt className="text-slate-500">{k}</dt><dd className="break-all text-right font-medium text-slate-800">{v}</dd></div>
                ))}
              </dl>
            </div>
            <div>
              <h4 className="mb-3 text-sm font-semibold text-slate-800">Security posture</h4>
              {posture(selected).length === 0
                ? <div className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700"><ShieldCheck className="mb-1 h-5 w-5" />No issues found. This resource follows the security baseline.</div>
                : <ul className="space-y-2">{posture(selected).map((i) => <li key={i} className="flex gap-2 rounded-lg bg-amber-50 p-2.5 text-sm text-amber-800"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />{i}</li>)}</ul>}
              <div className="mt-4 flex items-center justify-between rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2 text-sm">{selected.publicAccess ? <Unlock className="h-4 w-4 text-amber-600" /> : <Lock className="h-4 w-4 text-emerald-600" />}
                  Public network access: <b>{selected.publicAccess ? "Enabled" : "Disabled"}</b></div>
                <Btn variant="outline" className="!py-1 !text-xs" onClick={() => togglePublic(selected)}>{selected.publicAccess ? "Disable" : "Enable"}</Btn>
              </div>
              <p className="mt-3 text-xs text-slate-400">Encryption at rest: {selected.encrypted ? "AES-256 (platform-managed keys)" : "Off"}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
