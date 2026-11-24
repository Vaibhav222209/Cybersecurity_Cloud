import { useMemo, useState } from "react";
import { Search, ShieldCheck } from "lucide-react";
import { EXTRA_SERVICES, RES_DEFS } from "../data";
import { Badge, Card, Icon, PageHeader } from "../ui";
import { useNav, useStore } from "../store";

export default function Services() {
  const { go } = useNav();
  const { toast } = useStore();
  const [q, setQ] = useState("");

  const groups = useMemo(() => {
    const all = [
      ...Object.values(RES_DEFS).map((d) => ({ name: d.short, cat: d.cat, icon: d.icon, desc: d.desc, color: d.color, create: d.type, secure: d.type === "keyvault" })),
      ...EXTRA_SERVICES.map((s) => ({ name: s.name, cat: s.cat, icon: s.icon, desc: s.desc, color: s.secure ? "#6d28d9" : "#475569", create: undefined, secure: !!s.secure })),
    ].filter((s) => (s.name + s.cat + s.desc).toLowerCase().includes(q.toLowerCase()));
    const m = new Map<string, typeof all>();
    all.forEach((s) => m.set(s.cat, [...(m.get(s.cat) ?? []), s]));
    return Array.from(m.entries());
  }, [q]);

  const open = (s: { name: string; cat: string; create?: string; secure: boolean }) => {
    if (s.create) return go("create", { create: s.create as never });
    if (s.cat === "Security" || s.cat === "Identity" || s.secure) {
      const tab = /Entra/.test(s.name) ? "identity" : /Sentinel/.test(s.name) ? "sentinel" : /Firewall|DDoS|WAF|Gateway|Bastion/.test(s.name) ? "network" : /Policy/.test(s.name) ? "compliance" : "overview";
      return go("security", { tab });
    }
    if (s.name === "Cost Management") return go("cost");
    toast(`${s.name} is on the roadmap — contributions welcome on GitHub!`, "info");
  };

  return (
    <div>
      <PageHeader icon="LayoutGrid" title="All services" subtitle="Browse everything Ramzure offers, grouped by category" />
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter services…" className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-az focus:ring-2 focus:ring-az/20" />
      </div>
      <div className="space-y-8">
        {groups.map(([cat, items]) => (
          <section key={cat}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500">{cat}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((s) => (
                <Card key={s.name} className="transition hover:shadow-md">
                  <button onClick={() => open(s)} className="flex w-full items-start gap-3 p-4 text-left">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: s.color }}><Icon name={s.icon} className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">{s.name}{s.secure && <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />}</span>
                      <span className="mt-0.5 block text-xs text-slate-500">{s.desc}</span>
                      {s.create ? <Badge tone="blue" className="mt-2">Create</Badge> : s.secure ? <Badge tone="violet" className="mt-2">Open in Security Center</Badge> : <Badge className="mt-2">Preview</Badge>}
                    </span>
                  </button>
                </Card>
              ))}
            </div>
          </section>
        ))}
        {groups.length === 0 && <p className="py-10 text-center text-slate-500">No services match “{q}”.</p>}
      </div>
    </div>
  );
}
