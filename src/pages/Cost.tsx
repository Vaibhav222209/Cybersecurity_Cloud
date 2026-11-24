import { useState } from "react";
import { AlertTriangle, TrendingDown } from "lucide-react";
import { RES_DEFS } from "../data";
import { Badge, Card, Icon, PageHeader } from "../ui";
import { FREE_CREDIT, monthlyCost, useNav, useStore } from "../store";
import { cn } from "../utils/cn";

export default function Cost() {
  const { state, set, log } = useStore();
  const { go } = useNav();
  const [budget, setBudget] = useState(150);
  const total = state.resources.reduce((a, r) => a + monthlyCost(r), 0);
  const used = Math.min(100, (total / FREE_CREDIT) * 100);
  const byType = Object.values(RES_DEFS)
    .map((d) => ({ d, v: state.resources.filter((r) => r.type === d.type).reduce((a, r) => a + monthlyCost(r), 0) }))
    .filter((x) => x.v > 0).sort((a, b) => b.v - a.v);
  const max = Math.max(1, ...byType.map((b) => b.v));
  const over = total > budget;
  const top = [...state.resources].sort((a, b) => monthlyCost(b) - monthlyCost(a));
  const idle = state.resources.filter((r) => r.status === "Running" && r.costHr > 0.05);

  return (
    <div>
      <PageHeader icon="DollarSign" color="#d97706" title="Cost Management" subtitle="Simulated spend against your free sandbox credit — no real money involved" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div><p className="text-sm text-slate-500">Estimated monthly cost</p><p className="text-4xl font-semibold tracking-tight text-slate-900">${total.toFixed(2)}</p></div>
            <div className="text-right"><p className="text-sm text-slate-500">Free credit remaining</p><p className="text-2xl font-semibold text-emerald-600">${Math.max(0, FREE_CREDIT - total).toFixed(2)}</p></div>
          </div>
          <div className="mt-5 h-4 overflow-hidden rounded-full bg-slate-100">
            <div className={cn("h-full rounded-full transition-all duration-700", used > 80 ? "bg-red-500" : used > 50 ? "bg-amber-500" : "bg-gradient-to-r from-emerald-400 to-az")} style={{ width: `${used}%` }} />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-slate-400"><span>$0</span><span>${FREE_CREDIT} credit</span></div>

          <h4 className="mb-3 mt-8 font-semibold text-slate-800">Cost by service</h4>
          <div className="space-y-3">
            {byType.length === 0 && <p className="text-sm text-slate-400">No billable resources.</p>}
            {byType.map(({ d, v }) => (
              <div key={d.type} className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-md text-white" style={{ background: d.color }}><Icon name={d.icon} className="h-3.5 w-3.5" /></span>
                <span className="w-32 shrink-0 truncate text-sm text-slate-600">{d.short}</span>
                <div className="h-3 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full transition-all duration-700" style={{ width: `${(v / max) * 100}%`, background: d.color }} /></div>
                <span className="w-16 text-right text-sm font-medium text-slate-800">${v.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="p-5">
            <h4 className="font-semibold text-slate-800">Budget alert</h4>
            <p className="text-xs text-slate-400">Get notified when spend crosses your limit</p>
            <p className="mt-3 text-3xl font-semibold text-slate-900">${budget}</p>
            <input type="range" min={10} max={200} value={budget} onChange={(e) => setBudget(Number(e.target.value))} onMouseUp={() => log(`Budget alert set to $${budget}`, "info")} className="mt-2 w-full accent-[#0078d4]" />
            <div className={cn("mt-3 flex items-center gap-2 rounded-lg p-2.5 text-sm", over ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700")}>
              {over ? <AlertTriangle className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {over ? "Forecast exceeds your budget!" : "Within budget"}
            </div>
          </Card>
          <Card className="p-5">
            <h4 className="font-semibold text-slate-800">Savings advisor</h4>
            {idle.length === 0 && <p className="mt-2 text-sm text-slate-500">No expensive running resources. Nice and lean! 🌱</p>}
            {idle.map((r) => (
              <div key={r.id} className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <b>{r.name}</b> costs ${monthlyCost(r).toFixed(2)}/mo.
                <button onClick={() => { set((s) => ({ ...s, resources: s.resources.map((x) => (x.id === r.id ? { ...x, status: "Stopped" } : x)) })); log(`Stopped ${r.name} to save cost`, "info"); }} className="ml-1 font-semibold underline">Stop it</button>
              </div>
            ))}
            <button onClick={() => go("create")} className="mt-4 text-xs font-semibold text-az hover:underline">Tip: choose the smallest SKU when creating →</button>
          </Card>
        </div>
      </div>

      <Card className="mt-5">
        <div className="border-b border-slate-100 px-5 py-3.5"><h3 className="font-semibold text-slate-800">Resource costs</h3></div>
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50/60 text-left text-xs uppercase tracking-wide text-slate-500"><th className="px-5 py-2.5 font-medium">Resource</th><th className="hidden px-5 py-2.5 font-medium sm:table-cell">SKU</th><th className="px-5 py-2.5 font-medium">Status</th><th className="px-5 py-2.5 text-right font-medium">Monthly</th></tr></thead>
          <tbody>
            {top.map((r) => (
              <tr key={r.id} className="border-t border-slate-100">
                <td className="px-5 py-2.5 font-medium text-slate-800">{r.name}</td>
                <td className="hidden px-5 py-2.5 text-slate-500 sm:table-cell">{r.sku}</td>
                <td className="px-5 py-2.5"><Badge tone={r.status === "Stopped" ? "slate" : "green"}>{r.status}</Badge></td>
                <td className="px-5 py-2.5 text-right font-mono">${monthlyCost(r).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
