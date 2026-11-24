import { useEffect, type ReactNode } from "react";
import * as L from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./utils/cn";

export const GITHUB_URL = "https://github.com/Vaibhav222209";
export const REPO_URL = "https://github.com/Vaibhav222209/ramzure";

/* ---------- Icons ---------- */
const ICONS: Record<string, LucideIcon> = {
  Server: L.Server, HardDrive: L.HardDrive, Database: L.Database, Globe: L.Globe, KeyRound: L.KeyRound,
  Zap: L.Zap, Network: L.Network, Boxes: L.Boxes, Orbit: L.Orbit, Fingerprint: L.Fingerprint,
  ShieldCheck: L.ShieldCheck, Radar: L.Radar, Flame: L.Flame, ShieldAlert: L.ShieldAlert, Layers: L.Layers,
  Share2: L.Share2, Activity: L.Activity, DollarSign: L.DollarSign, FileCheck: L.FileCheck,
  Container: L.Container, GitBranch: L.GitBranch, Brain: L.Brain, MessageSquare: L.MessageSquare,
  Archive: L.Archive, Lock: L.Lock, Settings: L.Settings, Cloud: L.Cloud, Shield: L.Shield,
};
export function Icon({ name, className, style }: { name: string; className?: string; style?: React.CSSProperties }) {
  const C = ICONS[name] ?? L.Cloud;
  return <C className={className} style={style} />;
}

export function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.62 1.58.23 2.75.11 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />
    </svg>
  );
}

/* ---------- Logo ---------- */
export function Logo({ size = 32, text = true, dark = true }: { size?: number; text?: boolean; dark?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden>
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#50e6ff" />
            <stop offset="0.55" stopColor="#0078d4" />
            <stop offset="1" stopColor="#5b3df5" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="15" fill="url(#lg1)" />
        <path d="M20 48V16h14a10 10 0 0 1 2 19.8L46 48h-8l-8-11h-4v11z M28 22v9h6a4.5 4.5 0 0 0 0-9z" fill="#fff" fillRule="evenodd" />
      </svg>
      {text && (
        <span className={cn("text-[1.35rem] font-semibold tracking-tight", dark ? "text-white" : "text-slate-900")}>
          Ramzure
        </span>
      )}
    </span>
  );
}

/* ---------- Primitives ---------- */
export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("rounded-xl border border-slate-200/80 bg-white shadow-sm", className)}>{children}</div>;
}

const tones = {
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
  blue: "bg-sky-50 text-sky-700 ring-sky-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  red: "bg-red-50 text-red-700 ring-red-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  violet: "bg-violet-50 text-violet-700 ring-violet-200",
};
export function Badge({ tone = "slate", children, className }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}
export const sevTone = (s: string) => (s === "High" ? "red" : s === "Medium" ? "amber" : "blue") as keyof typeof tones;

export function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button" role="switch" aria-checked={checked} disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-az focus-visible:ring-offset-2",
        checked ? "bg-az" : "bg-slate-300", disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <span className={cn("inline-block h-4.5 w-4.5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-[3px]")} style={{ width: 18, height: 18 }} />
    </button>
  );
}

export function Btn({
  children, onClick, variant = "primary", className, disabled, type = "button", title,
}: {
  children: ReactNode; onClick?: () => void; variant?: "primary" | "ghost" | "danger" | "outline" | "dark";
  className?: string; disabled?: boolean; type?: "button" | "submit"; title?: string;
}) {
  const v = {
    primary: "bg-az text-white hover:bg-az-dark shadow-sm shadow-sky-500/20",
    ghost: "text-slate-700 hover:bg-slate-100",
    outline: "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    dark: "bg-slate-900 text-white hover:bg-slate-800",
  }[variant];
  return (
    <button
      type={type} onClick={onClick} disabled={disabled} title={title}
      className={cn("inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50", v, className)}
    >
      {children}
    </button>
  );
}

export function Modal({
  open, onClose, title, children, wide, footer,
}: { open: boolean; onClose: () => void; title: ReactNode; children: ReactNode; wide?: boolean; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} />
      <div className={cn("animate-pop relative flex max-h-[90vh] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl", wide ? "max-w-3xl" : "max-w-lg")}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3.5">
          <h3 className="text-base font-semibold text-slate-900">{title}</h3>
          <button onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close">
            <L.X className="h-5 w-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

export function PageHeader({ icon, title, subtitle, actions, color = "#0078d4" }: {
  icon: string; title: string; subtitle?: string; actions?: ReactNode; color?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg" style={{ background: `linear-gradient(135deg, ${color}, ${color}bb)` }}>
          <Icon name={icon} className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange }: { tabs: { id: string; label: string; icon: string }[]; value: string; onChange: (id: string) => void }) {
  return (
    <div className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200">
      {tabs.map((t) => (
        <button
          key={t.id} onClick={() => onChange(t.id)}
          className={cn(
            "relative flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
            value === t.id ? "text-az" : "text-slate-500 hover:text-slate-800",
          )}
        >
          <Icon name={t.icon} className="h-4 w-4" />
          {t.label}
          {value === t.id && <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-az" />}
        </button>
      ))}
    </div>
  );
}

/* ---------- Charts ---------- */
export function ScoreRing({ value, size = 140, color, label }: { value: number; size?: number; color: string; label?: string }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#e5e7eb" strokeWidth="10" fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth="10" fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * value) / 100}
          style={{ transition: "stroke-dashoffset 0.9s ease, stroke 0.5s" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-semibold text-slate-900" style={{ fontSize: size / 3.4 }}>{value}%</span>
        {label && <span className="text-xs font-medium" style={{ color }}>{label}</span>}
      </div>
    </div>
  );
}

export function AreaChart({ data, data2, height = 120, color = "#0078d4", color2 = "#d13438" }: {
  data: number[]; data2?: number[]; height?: number; color?: string; color2?: string;
}) {
  const w = 600;
  const max = Math.max(...data, ...(data2 ?? [0])) * 1.1 || 1;
  const pts = (d: number[]) => d.map((v, i) => [(i / (d.length - 1)) * w, height - (v / max) * (height - 8) - 4] as const);
  const line = (d: number[]) => pts(d).map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id="ac1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1="0" x2={w} y1={height * f} y2={height * f} stroke="#e5e7eb" strokeDasharray="4 4" />
      ))}
      <path d={`${line(data)} L${w},${height} L0,${height} Z`} fill="url(#ac1)" />
      <path d={line(data)} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
      {data2 && <path d={line(data2)} fill="none" stroke={color2} strokeWidth="2" vectorEffect="non-scaling-stroke" strokeDasharray="5 4" />}
    </svg>
  );
}

/* ---------- Credit ---------- */
export function CreditBar({ dark }: { dark?: boolean }) {
  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm", dark ? "text-slate-400" : "text-slate-500")}>
      <span className="inline-flex items-center gap-1.5">
        Crafted with <L.Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> by
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={cn("font-semibold hover:underline", dark ? "text-white" : "text-slate-800")}>Vaibhav Thakur</a>
      </span>
      <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={cn("inline-flex items-center gap-1.5 hover:underline", dark ? "hover:text-white" : "hover:text-slate-800")}>
        <GithubIcon className="h-4 w-4" /> Vaibhav222209
      </a>
    </div>
  );
}
