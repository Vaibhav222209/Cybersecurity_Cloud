import { useMemo, useState } from "react";
import {
  ArrowRight, Check, CheckCircle2, ChevronDown, Clock, ExternalLink, Search, Sparkles, Trophy, XCircle,
} from "lucide-react";
import { EXTRA_SERVICES, RES_DEFS } from "../data";
import { Badge, Btn, Card, Icon, PageHeader, Tabs } from "../ui";
import { useNav, useStore } from "../store";
import { cn } from "../utils/cn";
import {
  CONCEPT_CARDS, FREE, LAYERS, MODELS, PATHS, QUIZ, RESP_LAYERS, ZERO_TRUST, type Module,
} from "./discoverData";

const TABS = [
  { id: "explore", label: "Explore", icon: "Cloud" },
  { id: "paths", label: "Learning paths", icon: "GitBranch" },
  { id: "concepts", label: "Concepts", icon: "Layers" },
  { id: "quiz", label: "Security quiz", icon: "FileCheck" },
  { id: "free", label: "Learn for free", icon: "DollarSign" },
];

/* ---------- Explore ---------- */
function Explore({ goTab }: { goTab: (t: string) => void }) {
  const { go } = useNav();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const all = useMemo(() => [
    ...Object.values(RES_DEFS).map((d) => ({ name: d.short, cat: d.cat, icon: d.icon, desc: d.desc, color: d.color, create: d.type as string | undefined })),
    ...EXTRA_SERVICES.map((s) => ({ name: s.name, cat: s.cat, icon: s.icon, desc: s.desc, color: s.secure ? "#6d28d9" : "#475569", create: undefined as string | undefined })),
  ], []);
  const cats = ["All", ...Array.from(new Set(all.map((s) => s.cat)))];
  const list = all.filter((s) => (cat === "All" || s.cat === cat) && (s.name + s.desc).toLowerCase().includes(q.toLowerCase()));

  const feat = [
    { t: "Start with the cloud", d: "Five short lessons from zero to your first VM.", c: "from-sky-500 to-blue-700", i: "Cloud", a: () => goTab("paths") },
    { t: "Think like a defender", d: "Fix real-looking vulnerabilities and watch your secure score climb.", c: "from-violet-600 to-fuchsia-600", i: "ShieldCheck", a: () => go("security") },
    { t: "Test your knowledge", d: "A six-question cybersecurity quiz with instant explanations.", c: "from-amber-500 to-rose-500", i: "FileCheck", a: () => goTab("quiz") },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-3">
        {feat.map((f) => (
          <button key={f.t} onClick={f.a} className={cn("group relative overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-left text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl", f.c)}>
            <div className="bg-grid absolute inset-0 opacity-50" />
            <Icon name={f.i} className="relative h-8 w-8 text-white/90" />
            <h3 className="relative mt-5 text-xl font-semibold">{f.t}</h3>
            <p className="relative mt-1 text-sm text-white/80">{f.d}</p>
            <span className="relative mt-4 inline-flex items-center gap-1 text-sm font-medium">Go <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
          </button>
        ))}
      </div>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div><h2 className="text-xl font-semibold text-slate-900">Explore services</h2><p className="text-sm text-slate-500">Everything in the Ramzure catalog, explained in one line.</p></div>
          <div className="relative w-full max-w-xs"><Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search services…" className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-az" /></div>
        </div>
        <div className="mb-4 flex flex-wrap gap-2">
          {cats.map((c) => <button key={c} onClick={() => setCat(c)} className={cn("rounded-full px-3.5 py-1 text-xs font-medium transition", cat === c ? "bg-slate-900 text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}>{c}</button>)}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((s) => (
            <Card key={s.name} className="flex flex-col p-4 transition hover:shadow-md">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg text-white" style={{ background: s.color }}><Icon name={s.icon} className="h-5 w-5" /></span>
              <h4 className="mt-3 text-sm font-semibold text-slate-800">{s.name}</h4>
              <p className="mt-1 flex-1 text-xs text-slate-500">{s.desc}</p>
              {s.create
                ? <button onClick={() => go("create", { create: s.create as never })} className="mt-3 text-left text-xs font-semibold text-az hover:underline">Try it →</button>
                : <Badge className="mt-3 self-start">{s.cat}</Badge>}
            </Card>
          ))}
          {list.length === 0 && <p className="col-span-full py-8 text-center text-slate-400">Nothing found.</p>}
        </div>
      </section>
    </div>
  );
}

/* ---------- Paths ---------- */
function Paths() {
  const { state, set, toast } = useStore();
  const { go } = useNav();
  const [openPath, setOpenPath] = useState<string>(PATHS[1].id);
  const [openMod, setOpenMod] = useState<string | null>(null);
  const toggle = (m: Module) => {
    const was = state.learned[m.id];
    set((s) => ({ ...s, learned: { ...s.learned, [m.id]: !was } }));
    if (!was) toast(`Completed: ${m.title}`, "success");
  };
  return (
    <div className="space-y-4">
      {PATHS.map((p) => {
        const done = p.modules.filter((m) => state.learned[m.id]).length;
        const pct = Math.round((done / p.modules.length) * 100);
        const open = openPath === p.id;
        return (
          <Card key={p.id} className="overflow-hidden">
            <button onClick={() => setOpenPath(open ? "" : p.id)} className="flex w-full items-center gap-4 p-5 text-left">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow" style={{ background: p.color }}><Icon name={p.icon} className="h-6 w-6" /></span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-slate-900">{p.title}</h3><Badge>{p.level}</Badge>{pct === 100 && <Badge tone="green"><Trophy className="h-3 w-3" /> Complete</Badge>}</div>
                <p className="text-sm text-slate-500">{p.blurb}</p>
                <div className="mt-2 flex items-center gap-3"><div className="h-1.5 max-w-[220px] flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: p.color }} /></div><span className="text-xs text-slate-400">{done}/{p.modules.length} · {p.modules.reduce((a, m) => a + m.mins, 0)} min</span></div>
              </div>
              <ChevronDown className={cn("h-5 w-5 shrink-0 text-slate-400 transition", open && "rotate-180")} />
            </button>
            {open && (
              <ol className="border-t border-slate-100">
                {p.modules.map((m, i) => (
                  <li key={m.id} className="border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-3 px-5 py-3">
                      <button onClick={() => toggle(m)} aria-label="Toggle complete" className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition", state.learned[m.id] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 hover:border-az")}>{state.learned[m.id] && <Check className="h-3.5 w-3.5" />}</button>
                      <button onClick={() => setOpenMod(openMod === m.id ? null : m.id)} className="flex flex-1 items-center justify-between text-left">
                        <span className={cn("text-sm font-medium", state.learned[m.id] ? "text-slate-400 line-through" : "text-slate-800")}>{i + 1}. {m.title}</span>
                        <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" />{m.mins} min</span>
                      </button>
                    </div>
                    {openMod === m.id && (
                      <div className="animate-pop mx-5 mb-4 ml-14 rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-600">
                        <p>{m.body}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {m.try && <Btn className="!py-1.5 !text-xs" onClick={() => go(m.try!.page, { tab: m.try!.tab, create: m.try!.create as never })}>{m.try.label} <ArrowRight className="h-3.5 w-3.5" /></Btn>}
                          {!state.learned[m.id] && <Btn variant="outline" className="!py-1.5 !text-xs" onClick={() => toggle(m)}><CheckCircle2 className="h-3.5 w-3.5" /> Mark complete</Btn>}
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        );
      })}
    </div>
  );
}

/* ---------- Concepts ---------- */
function Concepts() {
  const [m, setM] = useState(1);
  const [layer, setLayer] = useState(1);
  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-1 text-xl font-semibold text-slate-900">The CIA triad</h2>
        <p className="mb-4 text-sm text-slate-500">The three goals behind every security decision.</p>
        <div className="grid gap-4 md:grid-cols-3">
          {CONCEPT_CARDS.map((c) => (
            <div key={c.t} className={cn("rounded-2xl bg-gradient-to-br p-6 text-white shadow-md", c.c)}><h3 className="text-lg font-semibold">{c.t}</h3><p className="mt-2 text-sm text-white/85">{c.d}</p></div>
          ))}
        </div>
      </section>

      <Card className="p-6">
        <h2 className="text-xl font-semibold text-slate-900">Shared responsibility</h2>
        <p className="mb-5 text-sm text-slate-500">Choose a model and see who secures each layer.</p>
        <div className="mb-5 flex flex-wrap gap-2">
          {MODELS.map((x, i) => <button key={x.name} onClick={() => setM(i)} className={cn("rounded-lg px-4 py-2 text-sm font-medium transition", m === i ? "bg-az text-white shadow" : "bg-slate-100 text-slate-600 hover:bg-slate-200")}>{x.name}</button>)}
        </div>
        <p className="mb-3 text-xs text-slate-400">Examples: {MODELS[m].ex}</p>
        <div className="space-y-1.5">
          {RESP_LAYERS.map((r) => (
            <div key={r.layer} className="flex items-center gap-3">
              <span className="w-44 shrink-0 text-sm text-slate-600">{r.layer}</span>
              <div className={cn("flex h-9 flex-1 items-center rounded-lg px-3 text-xs font-semibold transition-all duration-500", r.v[m] ? "bg-sky-100 text-sky-800" : "bg-amber-100 text-amber-800")}>
                {r.v[m] ? "☁ Provider secures" : "🧑 You secure"}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="grid gap-6 p-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Defence in depth</h2>
          <p className="mb-5 text-sm text-slate-500">Seven layers — an attacker must beat them all. Tap a layer.</p>
          <div className="space-y-1.5">
            {LAYERS.map((l, i) => (
              <button key={l.name} onClick={() => setLayer(i)} className={cn("block w-full rounded-lg px-4 py-2.5 text-left text-sm font-medium transition", layer === i ? "bg-violet-600 text-white shadow-lg" : "bg-violet-50 text-violet-800 hover:bg-violet-100")} style={{ width: `${100 - i * 5}%`, marginLeft: `${i * 2.5}%` }}>
                {i + 1}. {l.name}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center rounded-2xl bg-gradient-to-br from-slate-900 to-violet-950 p-6 text-white">
          <div><Badge tone="violet">Layer {layer + 1}</Badge><h3 className="mt-3 text-2xl font-semibold">{LAYERS[layer].name}</h3><p className="mt-2 text-slate-300">{LAYERS[layer].text}</p></div>
        </div>
      </Card>

      <section>
        <h2 className="mb-4 text-xl font-semibold text-slate-900">Zero Trust</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ZERO_TRUST.map((z, i) => (
            <Card key={z.t} className="p-5"><span className="flex h-9 w-9 items-center justify-center rounded-full bg-az text-sm font-bold text-white">{i + 1}</span><h3 className="mt-3 font-semibold text-slate-900">{z.t}</h3><p className="mt-1 text-sm text-slate-500">{z.d}</p></Card>
          ))}
        </div>
      </section>
    </div>
  );
}

/* ---------- Quiz ---------- */
function Quiz() {
  const { state, set, toast } = useStore();
  const [i, setI] = useState(0);
  const [sel, setSel] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [fin, setFin] = useState(false);
  const q = QUIZ[i];
  const next = () => {
    if (i + 1 >= QUIZ.length) {
      setFin(true);
      if (score > state.quizBest) { set((s) => ({ ...s, quizBest: score })); toast("New personal best!", "success"); }
    } else { setI(i + 1); setSel(null); }
  };
  const restart = () => { setI(0); setSel(null); setScore(0); setFin(false); };

  if (fin) {
    const pct = Math.round((score / QUIZ.length) * 100);
    return (
      <Card className="mx-auto max-w-xl p-10 text-center">
        <Trophy className={cn("mx-auto h-14 w-14", pct >= 80 ? "text-amber-500" : "text-slate-400")} />
        <h2 className="mt-4 text-3xl font-semibold text-slate-900">{score} / {QUIZ.length}</h2>
        <p className="mt-1 text-slate-500">{pct >= 80 ? "Outstanding — you think like a cloud defender!" : pct >= 50 ? "Solid start. Review the learning paths and retry." : "Keep going — the Security Essentials path will help."}</p>
        <p className="mt-2 text-xs text-slate-400">Personal best: {Math.max(state.quizBest, score)} / {QUIZ.length}</p>
        <Btn className="mt-6" onClick={restart}>Try again</Btn>
      </Card>
    );
  }
  return (
    <Card className="mx-auto max-w-2xl p-6 sm:p-8">
      <div className="mb-5 flex items-center justify-between text-sm text-slate-400"><span>Question {i + 1} of {QUIZ.length}</span><span>Score {score}</span></div>
      <div className="mb-6 h-1.5 rounded-full bg-slate-100"><div className="h-full rounded-full bg-az transition-all" style={{ width: `${(i / QUIZ.length) * 100}%` }} /></div>
      <h3 className="text-lg font-semibold leading-snug text-slate-900">{q.q}</h3>
      <div className="mt-5 space-y-2.5">
        {q.o.map((o, k) => {
          const answered = sel !== null;
          const good = answered && k === q.a, bad = answered && k === sel && k !== q.a;
          return (
            <button key={o} disabled={answered} onClick={() => { setSel(k); if (k === q.a) setScore(score + 1); }}
              className={cn("flex w-full items-center justify-between rounded-xl border-2 px-4 py-3 text-left text-sm transition", good ? "border-emerald-500 bg-emerald-50 text-emerald-800" : bad ? "border-red-400 bg-red-50 text-red-800" : "border-slate-200 hover:border-az hover:bg-sky-50/50 disabled:hover:border-slate-200 disabled:hover:bg-transparent")}>
              {o}{good && <CheckCircle2 className="h-5 w-5" />}{bad && <XCircle className="h-5 w-5" />}
            </button>
          );
        })}
      </div>
      {sel !== null && (
        <div className="animate-pop mt-5 rounded-xl bg-slate-50 p-4 text-sm text-slate-600"><b className="text-slate-800">{sel === q.a ? "Correct! " : "Not quite. "}</b>{q.why}</div>
      )}
      {sel !== null && <Btn className="mt-5" onClick={next}>{i + 1 >= QUIZ.length ? "See results" : "Next question"} <ArrowRight className="h-4 w-4" /></Btn>}
    </Card>
  );
}

/* ---------- Free ---------- */
function Free() {
  return (
    <div>
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg">
        <h2 className="text-xl font-semibold">No budget? No problem.</h2>
        <p className="mt-1 max-w-2xl text-sm text-emerald-50">You don't need money to learn cloud. Use Ramzure to practise the interface and concepts, then graduate to these genuinely free official resources for real-cloud experience.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {FREE.map((f) => (
          <a key={f.name} href={f.url} target="_blank" rel="noreferrer" className="group block">
            <Card className="h-full p-5 transition group-hover:-translate-y-0.5 group-hover:shadow-lg">
              <div className="flex items-start justify-between"><Sparkles className="h-6 w-6 text-az" /><Badge tone="green">{f.tag}</Badge></div>
              <h3 className="mt-3 flex items-center gap-1.5 font-semibold text-slate-900">{f.name}<ExternalLink className="h-3.5 w-3.5 text-slate-400" /></h3>
              <p className="mt-1 text-sm text-slate-500">{f.text}</p>
            </Card>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function Discover() {
  const { state } = useStore();
  const [tab, setTab] = useState("explore");
  const total = PATHS.reduce((a, p) => a + p.modules.length, 0);
  const done = Object.values(state.learned).filter(Boolean).length;
  return (
    <div>
      <PageHeader icon="Compass" color="#db2777" title="Discover" subtitle="Learn cloud and cybersecurity — by doing"
        actions={<Badge tone="violet" className="!px-3 !py-1 !text-sm"><Trophy className="h-3.5 w-3.5" /> {done}/{total} lessons complete</Badge>} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "explore" && <Explore goTab={setTab} />}
      {tab === "paths" && <Paths />}
      {tab === "concepts" && <Concepts />}
      {tab === "quiz" && <Quiz />}
      {tab === "free" && <Free />}
    </div>
  );
}
