import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Bell, Compass, DollarSign, Home, LayoutGrid, LogOut, Menu, Plus, Search, ShieldCheck,
  Terminal, Boxes, Info, RotateCcw, X, ChevronRight,
} from "lucide-react";
import { EXTRA_SERVICES, RES_DEFS } from "./data";
import { Icon, Logo, CreditBar } from "./ui";
import { timeAgo, useNav, useStore, type Page, type NavOpts } from "./store";
import { cn } from "./utils/cn";

const NAV: { id: Page; label: string; icon: typeof Home }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "create", label: "Create a resource", icon: Plus },
  { id: "resources", label: "All resources", icon: Boxes },
  { id: "services", label: "All services", icon: LayoutGrid },
  { id: "security", label: "Security Center", icon: ShieldCheck },
  { id: "discover", label: "Discover", icon: Compass },
  { id: "cost", label: "Cost Management", icon: DollarSign },
  { id: "shell", label: "Cloud Shell", icon: Terminal },
  { id: "about", label: "About & GitHub", icon: Info },
];

export default function Shell({ children, onSignOut }: { children: ReactNode; onSignOut: () => void }) {
  const { nav, go } = useNav();
  const { state, reset, toast } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [menu, setMenu] = useState<"" | "bell" | "user">("");
  const mainRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => { mainRef.current?.scrollTo({ top: 0 }); }, [nav.page, nav.tab]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "/") { e.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return [];
    const out: { label: string; sub: string; icon: string; to: Page; opts?: NavOpts }[] = [];
    NAV.forEach((n) => n.label.toLowerCase().includes(t) && out.push({ label: n.label, sub: "Page", icon: "Cloud", to: n.id }));
    state.resources.forEach((r) => r.name.toLowerCase().includes(t) &&
      out.push({ label: r.name, sub: RES_DEFS[r.type].label, icon: RES_DEFS[r.type].icon, to: "resources", opts: { focus: r.id } }));
    Object.values(RES_DEFS).forEach((d) => (d.label + d.cat).toLowerCase().includes(t) &&
      out.push({ label: `Create ${d.label}`, sub: "Marketplace", icon: d.icon, to: "create", opts: { create: d.type } }));
    EXTRA_SERVICES.forEach((s) => (s.name + s.cat).toLowerCase().includes(t) &&
      out.push({ label: s.name, sub: s.cat, icon: s.icon, to: s.cat === "Security" || s.cat === "Identity" ? "security" : "services" }));
    return out.slice(0, 8);
  }, [q, state.resources]);

  const pick = (to: Page, o?: NavOpts) => { go(to, o); setQ(""); setFocus(false); setMobile(false); };

  return (
    <div className="flex h-full flex-col">
      {/* TOPBAR */}
      <header className="relative z-40 flex h-14 shrink-0 items-center gap-3 bg-gradient-to-r from-[#0a1226] via-[#0c1a3a] to-[#11183f] px-3 text-white shadow-md">
        <button onClick={() => (window.innerWidth < 1024 ? setMobile(!mobile) : setCollapsed(!collapsed))} className="rounded-md p-2 hover:bg-white/10" aria-label="Toggle navigation">
          <Menu className="h-5 w-5" />
        </button>
        <button onClick={() => go("home")} className="hidden sm:block"><Logo size={28} /></button>

        <div className="relative mx-auto w-full max-w-xl flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            ref={searchRef} value={q} onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocus(true)} onBlur={() => setTimeout(() => setFocus(false), 150)}
            placeholder="Search resources, services and docs (Ctrl+/)"
            className="h-9 w-full rounded-md border border-white/10 bg-white/10 pl-9 pr-3 text-sm text-white placeholder-slate-400 outline-none transition focus:bg-white focus:text-slate-900 focus:placeholder-slate-500"
          />
          {focus && q && (
            <div className="animate-pop absolute left-0 right-0 top-11 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xl">
              {results.length === 0 && <p className="px-4 py-3 text-sm text-slate-500">No results for “{q}”</p>}
              {results.map((r, i) => (
                <button key={i} onMouseDown={() => pick(r.to, r.opts)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-slate-50">
                  <Icon name={r.icon} className="h-4 w-4 text-az" />
                  <span className="flex-1 truncate text-sm">{r.label}</span>
                  <span className="text-xs text-slate-400">{r.sub}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button onClick={() => go("shell")} className="rounded-md p-2 hover:bg-white/10" title="Cloud Shell"><Terminal className="h-5 w-5" /></button>
          <div className="relative">
            <button onClick={() => setMenu(menu === "bell" ? "" : "bell")} className="relative rounded-md p-2 hover:bg-white/10" title="Notifications">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#0c1a3a]" />
            </button>
            {menu === "bell" && (
              <div className="animate-pop absolute right-0 top-11 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xl">
                <div className="flex items-center justify-between border-b px-4 py-2.5"><b className="text-sm">Notifications</b><button onClick={() => setMenu("")}><X className="h-4 w-4 text-slate-400" /></button></div>
                <div className="max-h-80 overflow-y-auto">
                  {state.activity.slice(0, 8).map((a) => (
                    <div key={a.id} className="flex gap-3 border-b border-slate-100 px-4 py-2.5 text-sm last:border-0">
                      <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", a.kind === "warn" ? "bg-amber-500" : a.kind === "security" ? "bg-violet-500" : a.kind === "success" ? "bg-emerald-500" : "bg-sky-500")} />
                      <div><p className="leading-snug">{a.text}</p><p className="text-xs text-slate-400">{timeAgo(a.time)}</p></div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <button onClick={() => setMenu(menu === "user" ? "" : "user")} className="ml-1 flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-white/10">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-az-light to-violet-500 text-sm font-semibold text-slate-900">
                {state.session?.name.charAt(0).toUpperCase()}
              </span>
              <span className="hidden text-left text-xs leading-tight md:block">
                <span className="block max-w-[110px] truncate font-medium">{state.session?.name}</span>
                <span className="block text-slate-400">{state.session?.guest ? "Guest" : "MFA verified"}</span>
              </span>
            </button>
            {menu === "user" && (
              <div className="animate-pop absolute right-0 top-12 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xl">
                <div className="border-b px-4 py-3"><p className="font-medium">{state.session?.name}</p><p className="truncate text-xs text-slate-500">{state.session?.email}</p></div>
                <button onClick={() => { go("about"); setMenu(""); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"><Info className="h-4 w-4" /> About Ramzure</button>
                <button onClick={() => { reset(); toast("Sandbox reset to defaults", "info"); setMenu(""); }} className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-slate-50"><RotateCcw className="h-4 w-4" /> Reset sandbox</button>
                <button onClick={onSignOut} className="flex w-full items-center gap-2 border-t px-4 py-2.5 text-sm text-red-600 hover:bg-red-50"><LogOut className="h-4 w-4" /> Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex min-h-0 flex-1" onClick={() => menu && setMenu("")}>
        {/* SIDEBAR */}
        {mobile && <div className="fixed inset-0 top-14 z-30 bg-black/40 lg:hidden" onClick={() => setMobile(false)} />}
        <aside
          className={cn(
            "z-30 flex shrink-0 flex-col border-r border-slate-200 bg-white transition-all duration-200",
            "max-lg:fixed max-lg:bottom-0 max-lg:top-14 max-lg:w-64",
            mobile ? "max-lg:translate-x-0" : "max-lg:-translate-x-full",
            collapsed ? "lg:w-[60px]" : "lg:w-60",
          )}
        >
          <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
            {NAV.map((n) => {
              const active = nav.page === n.id;
              return (
                <button
                  key={n.id} onClick={() => pick(n.id)} title={n.label}
                  className={cn(
                    "group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    active ? "bg-sky-50 text-az" : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                  )}
                >
                  {active && <span className="absolute inset-y-1.5 left-0 w-1 rounded-r-full bg-az" />}
                  <n.icon className="h-[18px] w-[18px] shrink-0" />
                  <span className={cn("truncate", collapsed && "lg:hidden")}>{n.label}</span>
                  {n.id === "security" && !collapsed && <span className="ml-auto rounded-full bg-violet-100 px-1.5 text-[10px] font-semibold text-violet-700">NEW</span>}
                  {n.id === "discover" && !collapsed && <ChevronRight className="ml-auto h-4 w-4 text-slate-300" />}
                </button>
              );
            })}
          </nav>
          <div className={cn("border-t border-slate-200 p-3 text-center text-[11px] text-slate-400", collapsed && "lg:hidden")}>
            Ramzure v1.0 · by <a className="font-medium text-slate-600 hover:underline" href="https://github.com/Vaibhav222209" target="_blank" rel="noreferrer">Vaibhav Thakur</a>
          </div>
        </aside>

        {/* MAIN */}
        <main ref={mainRef} className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 sm:p-6">{children}</div>
          <footer className="border-t border-slate-200 bg-white py-5"><CreditBar /></footer>
        </main>
      </div>
    </div>
  );
}
