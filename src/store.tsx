import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { CheckCircle2, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { RECS, RES_DEFS, type ResType } from "./data";

/* ---------- Types ---------- */
export type Page =
  | "home" | "services" | "resources" | "create" | "security"
  | "discover" | "cost" | "shell" | "about";

export interface NavOpts { tab?: string; create?: ResType; focus?: string }
export interface NavState extends NavOpts { page: Page }

export type Status = "Running" | "Stopped" | "Available";
export interface Resource {
  id: string; name: string; type: ResType; group: string; region: string;
  status: Status; sku: string; costHr: number; createdAt: number;
  publicAccess: boolean; encrypted: boolean; httpsOnly?: boolean; auth?: string;
}
export interface NsgRule {
  id: string; priority: number; name: string; port: string;
  protocol: string; source: string; action: "Allow" | "Deny";
}
export interface UserAcct { id: string; name: string; email: string; role: string; mfa: boolean; last: string }
export interface Secret { id: string; name: string; value: string; createdAt: number }
export interface Activity { id: string; text: string; time: number; kind: "info" | "success" | "warn" | "security" }
export interface Session { name: string; email: string; guest: boolean }

export interface State {
  session: Session | null;
  resources: Resource[];
  groups: string[];
  manualFixed: Record<string, boolean>;
  defender: Record<string, boolean>;
  nsg: NsgRule[];
  users: UserAcct[];
  policies: Record<string, boolean>;
  secrets: Secret[];
  net: { firewall: boolean; ddos: boolean; waf: boolean };
  kv: { purge: boolean; softDelete: boolean; rbac: boolean };
  activity: Activity[];
  learned: Record<string, boolean>;
  quizBest: number;
  blocked: number;
}

/* ---------- Helpers ---------- */
export const uid = () => Math.random().toString(36).slice(2, 9);
export function genSecret(len = 28) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, (n) => chars[n % chars.length]).join("");
}
export function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const now = Date.now();
const DAY = 86400000;

function initial(): State {
  const mk = (
    name: string, type: ResType, group: string, region: string, sku: string,
    status: Status, ageDays: number, extra: Partial<Resource> = {},
  ): Resource => ({
    id: uid(), name, type, group, region, sku, status, createdAt: now - ageDays * DAY,
    costHr: RES_DEFS[type].skus.find((s) => s.name === sku)?.costHr ?? 0,
    publicAccess: false, encrypted: true, ...extra,
  });
  return {
    session: null,
    groups: ["rg-ramzure-prod", "rg-ramzure-dev"],
    resources: [
      mk("vm-web-01", "vm", "rg-ramzure-prod", "Central India", "B2s", "Running", 12, { publicAccess: true, auth: "Password" }),
      mk("stramzuredata01", "storage", "rg-ramzure-prod", "Central India", "Standard LRS", "Available", 30),
      mk("kv-ramzure-prod", "keyvault", "rg-ramzure-prod", "Central India", "Standard", "Available", 30),
      mk("app-ramzure-portal", "webapp", "rg-ramzure-prod", "Southeast Asia", "Basic B1", "Running", 8, { publicAccess: true, httpsOnly: false }),
      mk("sql-orders-db", "sql", "rg-ramzure-dev", "West Europe", "Basic", "Available", 4),
    ],
    manualFixed: { "https-only": false, backup: true, diag: true },
    defender: { servers: false, appservice: true, storage: true, sql: false, keyvault: false, containers: false, dns: false, arm: false, apis: false },
    nsg: [
      { id: uid(), priority: 100, name: "Allow-HTTPS", port: "443", protocol: "TCP", source: "*", action: "Allow" },
      { id: uid(), priority: 110, name: "Allow-HTTP", port: "80", protocol: "TCP", source: "*", action: "Allow" },
      { id: uid(), priority: 120, name: "Allow-SSH", port: "22", protocol: "TCP", source: "*", action: "Allow" },
      { id: uid(), priority: 130, name: "Allow-RDP", port: "3389", protocol: "TCP", source: "*", action: "Allow" },
      { id: uid(), priority: 65000, name: "DenyAllInbound", port: "*", protocol: "*", source: "*", action: "Deny" },
    ],
    users: [
      { id: uid(), name: "Vaibhav Thakur", email: "vaibhav@ramzure.dev", role: "Global Administrator", mfa: true, last: "2 min ago" },
      { id: uid(), name: "Aarav Mehta", email: "aarav@ramzure.dev", role: "Developer", mfa: false, last: "1 h ago" },
      { id: uid(), name: "Priya Sharma", email: "priya@ramzure.dev", role: "Security Reader", mfa: false, last: "Yesterday" },
      { id: uid(), name: "Rohan Das", email: "rohan@ramzure.dev", role: "Contributor", mfa: false, last: "3 days ago" },
      { id: uid(), name: "partner@contoso.com", email: "partner@contoso.com", role: "Guest", mfa: false, last: "6 days ago" },
    ],
    policies: { "admin-mfa": false, "block-legacy": true, "risky-signin": false, "compliant-device": false, geo: false },
    secrets: [
      { id: uid(), name: "sql-connection-string", value: "Server=tcp:sql-orders-db;Password=" + genSecret(14), createdAt: now - 9 * DAY },
      { id: uid(), name: "storage-access-key", value: genSecret(32), createdAt: now - 20 * DAY },
    ],
    net: { firewall: true, ddos: false, waf: true },
    kv: { purge: false, softDelete: true, rbac: true },
    activity: [
      { id: uid(), text: "Defender for Cloud assessed 5 resources", time: now - 12 * 60000, kind: "security" },
      { id: uid(), text: "Created vm-web-01 in Central India", time: now - 2 * 3600000, kind: "success" },
      { id: uid(), text: "Sign-in from new device flagged for review", time: now - 5 * 3600000, kind: "warn" },
    ],
    learned: {},
    quizBest: 0,
    blocked: 1284,
  };
}

const KEY = "ramzure.state.v1";
function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...initial(), ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return initial();
}

/* ---------- Security score ---------- */
export function recFixed(s: State, id: string): boolean {
  switch (id) {
    case "mfa": return s.users.every((u) => u.mfa);
    case "mgmt-ports":
      return !s.nsg.some((r) => r.action === "Allow" && r.source === "*" && ["22", "3389", "*"].includes(r.port));
    case "defender-servers": return !!s.defender.servers;
    case "ca-admin": return !!s.policies["admin-mfa"];
    case "waf": return s.net.waf;
    case "ddos": return s.net.ddos;
    case "kv-purge": return s.kv.purge;
    default: return !!s.manualFixed[id];
  }
}
export function secureScore(s: State) {
  const total = RECS.reduce((a, r) => a + r.weight, 0);
  const got = RECS.reduce((a, r) => a + (recFixed(s, r.id) ? r.weight : 0), 0);
  return { got, total, pct: Math.round((got / total) * 100) };
}
export function scoreLabel(p: number) {
  return p < 40 ? "At risk" : p < 70 ? "Fair" : p < 90 ? "Good" : "Excellent";
}
export function scoreColor(p: number) {
  return p < 40 ? "#d13438" : p < 70 ? "#f7a800" : p < 90 ? "#2ea043" : "#0e9f6e";
}
export function monthlyCost(r: Resource) {
  return r.status === "Stopped" ? r.costHr * 730 * 0.1 : r.costHr * 730;
}
export const FREE_CREDIT = 200;

/* ---------- Contexts ---------- */
type Toast = { id: string; msg: string; kind: "success" | "error" | "info" | "security" };
interface Store {
  state: State;
  set: (fn: (s: State) => State) => void;
  log: (text: string, kind?: Activity["kind"]) => void;
  toast: (msg: string, kind?: Toast["kind"]) => void;
  fixRec: (id: string) => void;
  addResource: (r: Omit<Resource, "id" | "createdAt">) => Resource;
  reset: () => void;
}
const StoreCtx = createContext<Store>(null!);
export const useStore = () => useContext(StoreCtx);

interface NavCtxT { nav: NavState; go: (p: Page, o?: NavOpts) => void }
export const NavCtx = createContext<NavCtxT>(null!);
export const useNav = () => useContext(NavCtx);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  const set = useCallback((fn: (s: State) => State) => setState((s) => fn(s)), []);

  const log = useCallback((text: string, kind: Activity["kind"] = "info") => {
    setState((s) => ({ ...s, activity: [{ id: uid(), text, time: Date.now(), kind }, ...s.activity].slice(0, 40) }));
  }, []);

  const toast = useCallback((msg: string, kind: Toast["kind"] = "success") => {
    const id = uid();
    setToasts((t) => [...t, { id, msg, kind }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  const fixRec = useCallback((id: string) => {
    setState((s) => {
      const n = { ...s };
      switch (id) {
        case "mfa": n.users = s.users.map((u) => ({ ...u, mfa: true })); break;
        case "mgmt-ports":
          n.nsg = s.nsg.map((r) =>
            r.action === "Allow" && r.source === "*" && ["22", "3389"].includes(r.port)
              ? { ...r, source: "VirtualNetwork" } : r);
          break;
        case "defender-servers": n.defender = { ...s.defender, servers: true }; break;
        case "ca-admin": n.policies = { ...s.policies, "admin-mfa": true }; break;
        case "waf": n.net = { ...s.net, waf: true }; break;
        case "ddos": n.net = { ...s.net, ddos: true }; break;
        case "kv-purge": n.kv = { ...s.kv, purge: true }; break;
        case "https-only": n.resources = s.resources.map((r) => (r.type === "webapp" ? { ...r, httpsOnly: true } : r)); n.manualFixed = { ...s.manualFixed, [id]: true }; break;
        default: n.manualFixed = { ...s.manualFixed, [id]: true };
      }
      const rec = RECS.find((r) => r.id === id);
      n.activity = [{ id: uid(), text: `Remediated: ${rec?.title ?? id}`, time: Date.now(), kind: "security" as const }, ...s.activity].slice(0, 40);
      return n;
    });
    toast("Recommendation remediated — secure score updated", "security");
  }, [toast]);

  const addResource = useCallback((r: Omit<Resource, "id" | "createdAt">) => {
    const res: Resource = { ...r, id: uid(), createdAt: Date.now() };
    setState((s) => ({
      ...s,
      resources: [res, ...s.resources],
      groups: s.groups.includes(r.group) ? s.groups : [...s.groups, r.group],
      activity: [{ id: uid(), text: `Created ${r.name} in ${r.region}`, time: Date.now(), kind: "success" as const }, ...s.activity].slice(0, 40),
    }));
    return res;
  }, []);

  const reset = useCallback(() => {
    const keep = stateRef.current.session;
    setState({ ...initial(), session: keep });
  }, []);

  const value = useMemo(
    () => ({ state, set, log, toast, fixRec, addResource, reset }),
    [state, set, log, toast, fixRec, addResource, reset],
  );

  const toastIcon = { success: CheckCircle2, error: AlertTriangle, info: Info, security: ShieldAlert };
  const toastColor = { success: "text-emerald-500", error: "text-red-500", info: "text-az", security: "text-violet-500" };

  return (
    <StoreCtx.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2">
        {toasts.map((t) => {
          const I = toastIcon[t.kind];
          return (
            <div key={t.id} className="animate-slide-in flex max-w-sm items-start gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-xl">
              <I className={`mt-0.5 h-5 w-5 shrink-0 ${toastColor[t.kind]}`} />
              <span className="text-slate-700">{t.msg}</span>
            </div>
          );
        })}
      </div>
    </StoreCtx.Provider>
  );
}
