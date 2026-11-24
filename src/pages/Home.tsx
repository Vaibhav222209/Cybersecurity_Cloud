import { useMemo } from "react";
import { ArrowRight, Compass, Plus, ShieldAlert, Terminal, DollarSign, BookOpen, Sparkles } from "lucide-react";
import { RECS, RES_DEFS, type ResType } from "../data";
import { AreaChart, Badge, Btn, Card, Icon, ScoreRing, sevTone } from "../ui";
import { FREE_CREDIT, monthlyCost, recFixed, scoreColor, scoreLabel, secureScore, timeAgo, useNav, useStore } from "../store";
import { cn } from "../utils/cn";

function series(seed: number, n = 24, base = 50, amp = 30) {
  let x = seed;
  return Array.from({ length: n }, (_, i) => {
    x = (x * 9301 + 49297) % 233280;
    return base + Math.sin(i / 3 + seed) * amp * 0.6 + (x / 233280) * amp * 0.5;
  });
}

export default function Home() {
  const { state, fixRec } = useStore();
  const { go } = useNav();
  const score = secureScore(state);
  const running = state.resources.filter((r) => r.status === "Running").length;
  const cost = state.resources.reduce((a, r) => a + monthlyCost(r), 0);
  const open = RECS.filter((r) => !recFixed(state, r.id)).sort((a, b) => b.weight - a.weight).slice(0, 4);
  const traffic = useMemo(() => series(3, 24, 60, 40), []);
  const threats = useMemo(() => series(8, 24, 8, 10).map((v) => Math.max(1, v / 3)), []);

  const quick: { label: string; icon: string; color: string; onClick: () => void }[] = [
    { label: "Create a resource", icon: "Plus", color: "#0078d4", onClick: () => go("create") },
    ...(["vm", "storage", "webapp", "sql", "keyvault"] as ResType[]).map((t) => ({
      label: RES_DEFS[t].short, icon: RES_DEFS[t].icon, color: RES_DEFS[t].color, onClick: () => go("create", { create: t }),
    })),
    { label: "Defender for Cloud", icon: "ShieldCheck", color: "#6d28d9", onClick: () => go("security") },
    { label: "All services", icon: "LayoutGrid", color: "#475569", onClick: () => go("services") },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a1a3f] via-[#0b3a7a] to-[#5b3df5] p-6 text-white shadow-lg sm:p-8">
        <div className="bg-grid absolute inset-0 opacity-60" />
        <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-az-light/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-sm text-sky-200"><Sparkles className="h-4 w-4" /> Welcome back</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Hello, {state.session?.name.split(" ")[0]} 👋</h1>
            <p className="mt-2 max-w-lg text-sm text-blue-100">
              Your sandbox has {state.resources.length} resources and {open.length} open security recommendation{open.length === 1 ? "" : "s"}.
              Everything here is free to experiment with.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <Btn variant="outline" className="!border-0 !text-blue-800" onClick={() => go("create")}><Plus className="h-4 w-4" /> Create resource</Btn>
              <Btn variant="ghost" className="!bg-white/15 !text-white hover:!bg-white/25" onClick={() => go("discover")}><Compass className="h-4 w-4" /> Discover</Btn>
              <Btn variant="ghost" className="!bg-white/15 !text-white hover:!bg-white/25" onClick={() => go("shell")}><Terminal className="h-4 w-4" /> Cloud Shell</Btn>
            </div>
          </div>
          <div className="glass flex items-center gap-4 rounded-2xl p-4">
            <div className="rounded-xl bg-white p-1"><ScoreRing value={score.pct} size={96} color={scoreColor(score.pct)} /></div>
            <div>
              <p className="text-xs uppercase tracking-wider text-blue-200">Secure score</p>
              <p className="text-lg font-semibold">{scoreLabel(score.pct)}</p>
              <button onClick={() => go("security")} className="mt-1 inline-flex items-center gap-1 text-xs text-sky-200 hover:underline">Improve <ArrowRight className="h-3 w-3" /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Services */}
      <section>
        <h2 className="mb-3 text-lg font-semibold text-slate-800">Ramzure services</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-8">
          {quick.map((q) => (
            <button key={q.label} onClick={q.onClick}
              className="group flex flex-col items-center gap-2.5 rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow transition group-hover:scale-110" style={{ background: `linear-gradient(135deg, ${q.color}, ${q.color}aa)` }}>
                <Icon name={q.icon === "Plus" ? "Cloud" : q.icon} className="h-5 w-5" />
              </span>
              <span className="text-xs font-medium leading-tight text-slate-700">{q.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { l: "Resources", v: state.resources.length, s: `${state.groups.length} resource groups`, i: "Boxes", c: "#0078d4" },
          { l: "Running now", v: running, s: `${state.resources.length - running} idle / stopped`, i: "Activity", c: "#0e9f6e" },
          { l: "Est. monthly cost", v: `$${cost.toFixed(2)}`, s: `of $${FREE_CREDIT} free sandbox credit`, i: "DollarSign", c: "#d97706" },
          { l: "Threats blocked", v: state.blocked.toLocaleString(), s: "last 30 days", i: "ShieldAlert", c: "#7c3aed" },
        ].map((s) => (
          <Card key={s.l} className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-500">{s.l}</p>
              <span className="rounded-lg p-2" style={{ background: s.c + "18", color: s.c }}><Icon name={s.i} className="h-4 w-4" /></span>
            </div>
            <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">{s.v}</p>
            <p className="mt-1 text-xs text-slate-400">{s.s}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Traffic */}
        <Card className="p-5 lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <div><h3 className="font-semibold text-slate-800">Network traffic vs. threats</h3><p className="text-xs text-slate-400">Last 24 hours · simulated telemetry</p></div>
            <div className="flex gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-az" />Requests</span>
              <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-red-500" />Blocked</span>
            </div>
          </div>
          <AreaChart data={traffic} data2={threats} height={170} />
          <div className="mt-1 flex justify-between text-[11px] text-slate-400"><span>24h ago</span><span>12h</span><span>now</span></div>
        </Card>

        {/* Security */}
        <Card className="p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold text-slate-800"><ShieldAlert className="h-4 w-4 text-violet-600" /> Top recommendations</h3>
            <button onClick={() => go("security")} className="text-xs font-medium text-az hover:underline">View all</button>
          </div>
          <div className="space-y-2.5">
            {open.length === 0 && <p className="py-6 text-center text-sm text-emerald-600">🎉 All recommendations resolved!</p>}
            {open.map((r) => (
              <div key={r.id} className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-[13px] font-medium leading-snug text-slate-800">{r.title}</p>
                  <Badge tone={sevTone(r.severity)}>{r.severity}</Badge>
                </div>
                <button onClick={() => fixRec(r.id)} className="mt-2 text-xs font-semibold text-az hover:underline">Quick fix →</button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent resources */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
            <h3 className="font-semibold text-slate-800">Recent resources</h3>
            <button onClick={() => go("resources")} className="text-xs font-medium text-az hover:underline">See all</button>
          </div>
          {state.resources.length === 0 && <p className="p-8 text-center text-sm text-slate-400">No resources yet. Create your first one!</p>}
          <ul className="divide-y divide-slate-100">
            {state.resources.slice(0, 6).map((r) => {
              const d = RES_DEFS[r.type];
              return (
                <li key={r.id}>
                  <button onClick={() => go("resources", { focus: r.id })} className="flex w-full items-center gap-3 px-5 py-3 text-left transition hover:bg-slate-50">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg text-white" style={{ background: d.color }}><Icon name={d.icon} className="h-4 w-4" /></span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-slate-800">{r.name}</span>
                      <span className="block text-xs text-slate-400">{d.label} · {r.region}</span>
                    </span>
                    <Badge tone={r.status === "Stopped" ? "slate" : "green"}>
                      <i className={cn("h-1.5 w-1.5 rounded-full", r.status === "Stopped" ? "bg-slate-400" : "bg-emerald-500")} />{r.status}
                    </Badge>
                    <span className="hidden w-20 text-right text-xs text-slate-400 sm:block">{timeAgo(r.createdAt)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Activity + tools */}
        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="mb-3 font-semibold text-slate-800">Activity log</h3>
            <ul className="space-y-3">
              {state.activity.slice(0, 5).map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", a.kind === "warn" ? "bg-amber-500" : a.kind === "security" ? "bg-violet-500" : a.kind === "success" ? "bg-emerald-500" : "bg-sky-500")} />
                  <div><p className="leading-snug text-slate-700">{a.text}</p><p className="text-xs text-slate-400">{timeAgo(a.time)}</p></div>
                </li>
              ))}
            </ul>
          </Card>
          <button onClick={() => go("discover")} className="group relative block w-full overflow-hidden rounded-xl bg-gradient-to-br from-fuchsia-600 to-indigo-600 p-5 text-left text-white shadow-md transition hover:shadow-xl">
            <BookOpen className="h-6 w-6 text-pink-200" />
            <p className="mt-3 font-semibold">New to the cloud?</p>
            <p className="mt-1 text-sm text-pink-100">Follow a guided learning path in Discover.</p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium">Start learning <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </button>
          <button onClick={() => go("cost")} className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:shadow-md">
            <span className="rounded-lg bg-amber-100 p-2.5 text-amber-700"><DollarSign className="h-5 w-5" /></span>
            <span><span className="block text-sm font-semibold text-slate-800">Cost Management</span><span className="text-xs text-slate-500">Budgets & spend analysis</span></span>
          </button>
        </div>
      </div>
    </div>
  );
}
