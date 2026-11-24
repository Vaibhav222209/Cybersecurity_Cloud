import { useEffect, useRef, useState } from "react";
import { RECS, RES_DEFS, REGIONS, type ResType } from "../data";
import { PageHeader } from "../ui";
import { genSecret, monthlyCost, recFixed, secureScore, uid, useStore } from "../store";
import { cn } from "../utils/cn";

interface Line { kind: "in" | "out" | "err" | "ok" | "dim"; text: string }

const HELP = `Ramzure CLI (rz) — commands

  rz account show                         Show the signed-in account
  rz group list                           List resource groups
  rz resource list                        List all resources
  rz <type> create --name N [--sku S] [--region R] [--group G]
        types: vm storage sql webapp keyvault function vnet aks cosmos
  rz vm start|stop N                      Start or stop a resource
  rz resource delete N                    Delete a resource
  rz keyvault secret set --name N [--value V]
  rz keyvault secret list
  rz security score                       Show secure score
  rz security recs                        List open recommendations
  rz security fix ID                      Remediate a recommendation
  rz security nsg list                    List network security rules
  rz security nsg deny --port P [--source IP]
  rz cost show                            Show estimated monthly cost

  clear · help · whoami · date · neofetch`;

const LOGO = `   ____
  |  _ \\ __ _ _ __ ___  ____   _ _ __ ___
  | |_) / _\` | '_ \` _ \\|_  / | | | '__/ _ \\
  |  _ < (_| | | | | | |/ /| |_| | | |  __/
  |_| \\_\\__,_|_| |_| |_/___|\\__,_|_|  \\___|`;

function parse(input: string) {
  const parts = input.trim().match(/"[^"]*"|\S+/g)?.map((p) => p.replace(/^"|"$/g, "")) ?? [];
  const pos: string[] = []; const flags: Record<string, string> = {};
  for (let i = 0; i < parts.length; i++) {
    if (parts[i].startsWith("--")) { flags[parts[i].slice(2)] = parts[i + 1] && !parts[i + 1].startsWith("--") ? parts[++i] : "true"; }
    else pos.push(parts[i]);
  }
  return { pos, flags };
}

export default function CloudShell() {
  const { state, set, log, addResource, fixRec } = useStore();
  const user = (state.session?.name ?? "guest").split(" ")[0].toLowerCase();
  const [lines, setLines] = useState<Line[]>([
    { kind: "dim", text: LOGO }, { kind: "ok", text: "Welcome to Ramzure Cloud Shell. Type `help` to see commands." },
  ]);
  const [val, setVal] = useState("");
  const [hist, setHist] = useState<string[]>([]);
  const [hi, setHi] = useState(-1);
  const end = useRef<HTMLDivElement>(null);
  const inp = useRef<HTMLInputElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: "end" }); }, [lines]);

  const run = (raw: string): Line[] => {
    const { pos, flags } = parse(raw);
    const out = (text: string, kind: Line["kind"] = "out"): Line[] => [{ kind, text }];
    const [a, b, c, d] = pos;
    if (!a) return [];
    if (a === "help") return out(HELP);
    if (a === "whoami") return out(`${user}@ramzure`);
    if (a === "date") return out(new Date().toString());
    if (a === "echo") return out(pos.slice(1).join(" "));
    if (a === "neofetch") {
      const sc = secureScore(state);
      return out(`${LOGO}\n\n  user:       ${user}@ramzure\n  resources:  ${state.resources.length}\n  secure:     ${sc.pct}%\n  shell:      rz-shell 1.0\n  author:     Vaibhav Thakur (github.com/Vaibhav222209)`, "dim");
    }
    if (a !== "rz") return out(`${a}: command not found. Try \`help\`.`, "err");

    if (b === "account" && c === "show") return out(JSON.stringify({ name: state.session?.name, email: state.session?.email, subscription: "Ramzure Free Sandbox", tenant: "ramzure.dev", mfa: !state.session?.guest }, null, 2));
    if (b === "group" && c === "list") return out(state.groups.map((g) => `${g}  (${state.resources.filter((r) => r.group === g).length} resources)`).join("\n"));
    if (b === "resource" && c === "list") {
      if (!state.resources.length) return out("No resources.", "dim");
      return out(["NAME                    TYPE              REGION           STATUS", ...state.resources.map((r) => `${r.name.padEnd(24)}${RES_DEFS[r.type].label.padEnd(18)}${r.region.padEnd(17)}${r.status}`)].join("\n"));
    }
    if (b === "vm" && c === "list") return run("rz resource list");
    if ((b === "vm" || b === "resource") && (c === "start" || c === "stop")) {
      const r = state.resources.find((x) => x.name === d);
      if (!r) return out(`Resource '${d}' not found.`, "err");
      const s = c === "start" ? "Running" : "Stopped";
      set((st) => ({ ...st, resources: st.resources.map((x) => (x.id === r.id ? { ...x, status: s } : x)) }));
      log(`${c === "start" ? "Started" : "Stopped"} ${r.name} (CLI)`, "info");
      return out(`✔ ${r.name} is now ${s}.`, "ok");
    }
    if ((b === "resource" || b === "vm") && c === "delete") {
      const r = state.resources.find((x) => x.name === d);
      if (!r) return out(`Resource '${d}' not found.`, "err");
      set((st) => ({ ...st, resources: st.resources.filter((x) => x.id !== r.id) }));
      log(`Deleted ${r.name} (CLI)`, "warn");
      return out(`✔ Deleted ${r.name}.`, "ok");
    }
    if (b && b in RES_DEFS && c === "create") {
      const type = b as ResType; const def = RES_DEFS[type];
      const name = flags.name;
      if (!name) return out("Missing --name.", "err");
      if (state.resources.some((r) => r.name === name)) return out(`'${name}' already exists.`, "err");
      const sku = def.skus.find((s) => s.name.toLowerCase() === (flags.sku ?? "").toLowerCase()) ?? def.skus[0];
      const region = REGIONS.find((r) => r.toLowerCase().replace(/\s/g, "") === (flags.region ?? "").toLowerCase().replace(/\s/g, "")) ?? REGIONS[0];
      const group = flags.group ?? state.groups[0];
      addResource({ name, type, group, region, sku: sku.name, costHr: sku.costHr, status: ["vm", "webapp", "function", "aks"].includes(type) ? "Running" : "Available", publicAccess: false, encrypted: true, httpsOnly: type === "webapp" ? true : undefined, auth: type === "vm" ? "SSH key" : undefined });
      return out(`✔ Created ${def.label} '${name}' in ${region} (${sku.name}), group ${group}.\n  Secure defaults applied: public access OFF, encryption ON.`, "ok");
    }
    if (b === "keyvault" && c === "secret") {
      if (d === "list") return out(state.secrets.map((s) => s.name).join("\n") || "No secrets.");
      if (d === "set") {
        if (!flags.name) return out("Missing --name.", "err");
        set((s) => ({ ...s, secrets: [{ id: uid(), name: flags.name, value: flags.value ?? genSecret(), createdAt: Date.now() }, ...s.secrets] }));
        log(`Created secret ${flags.name} (CLI)`, "security");
        return out(`✔ Secret '${flags.name}' stored in kv-ramzure-prod.`, "ok");
      }
    }
    if (b === "security") {
      if (c === "score") { const s = secureScore(state); return out(`Secure score: ${s.pct}% (${s.got}/${s.total} points)`, s.pct >= 70 ? "ok" : "err"); }
      if (c === "recs") {
        const open = RECS.filter((r) => !recFixed(state, r.id));
        return out(open.length ? open.map((r) => `[${r.severity.padEnd(6)}] ${r.id.padEnd(17)} ${r.title}`).join("\n") : "All recommendations resolved 🎉", open.length ? "out" : "ok");
      }
      if (c === "fix") {
        const r = RECS.find((x) => x.id === d);
        if (!r) return out(`Unknown recommendation '${d ?? ""}'. Run \`rz security recs\`.`, "err");
        fixRec(r.id);
        return out(`✔ Remediated: ${r.title}`, "ok");
      }
      if (c === "nsg" && d === "list") return out(["PRI    NAME               PORT   SOURCE            ACTION", ...state.nsg.map((r) => `${String(r.priority).padEnd(7)}${r.name.padEnd(19)}${r.port.padEnd(7)}${(r.source === "*" ? "Any" : r.source).padEnd(18)}${r.action}`)].join("\n"));
      if (c === "nsg" && d === "deny") {
        if (!flags.port) return out("Missing --port.", "err");
        set((s) => ({ ...s, nsg: [{ id: uid(), priority: 80, name: `Deny-${flags.port}`, port: flags.port, protocol: "*", source: flags.source ?? "*", action: "Deny" as const }, ...s.nsg] }));
        log(`NSG rule Deny-${flags.port} created (CLI)`, "security");
        return out(`✔ Deny rule created for port ${flags.port}.`, "ok");
      }
    }
    if (b === "cost" && c === "show") return out(`Estimated monthly cost: $${state.resources.reduce((x, r) => x + monthlyCost(r), 0).toFixed(2)} of $200.00 free credit`);
    return out(`Unrecognised command. Try \`help\`.`, "err");
  };

  const submit = (cmd: string) => {
    const prompt: Line = { kind: "in", text: cmd };
    if (cmd.trim() === "clear") { setLines([]); setVal(""); return; }
    setLines((l) => [...l, prompt, ...run(cmd)]);
    if (cmd.trim()) setHist((h) => [cmd, ...h]);
    setHi(-1); setVal("");
  };

  const key = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") submit(val);
    else if (e.key === "ArrowUp") { e.preventDefault(); const n = Math.min(hi + 1, hist.length - 1); if (hist[n] !== undefined) { setHi(n); setVal(hist[n]); } }
    else if (e.key === "ArrowDown") { e.preventDefault(); const n = hi - 1; setHi(n); setVal(n >= 0 ? hist[n] : ""); }
  };

  const chips = ["help", "rz resource list", "rz security score", "rz security recs", "rz security nsg list", "rz vm create --name vm-cli-01"];

  return (
    <div>
      <PageHeader icon="Terminal" color="#059669" title="Cloud Shell" subtitle="A browser-based terminal to manage your sandbox with the rz CLI" />
      <div className="overflow-hidden rounded-xl border border-slate-800 bg-[#0b1020] shadow-2xl" onClick={() => inp.current?.focus()}>
        <div className="flex items-center gap-2 border-b border-white/10 bg-[#111833] px-4 py-2.5">
          <span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-amber-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" />
          <span className="ml-3 font-mono text-xs text-slate-400">bash — {user}@ramzure</span>
        </div>
        <div className="h-[460px] overflow-y-auto p-4 font-mono text-[13px] leading-relaxed">
          {lines.map((l, i) => (
            <pre key={i} className={cn("whitespace-pre-wrap break-words",
              l.kind === "in" && "text-slate-100", l.kind === "out" && "text-slate-300", l.kind === "err" && "text-rose-400",
              l.kind === "ok" && "text-emerald-400", l.kind === "dim" && "text-sky-300")}>
              {l.kind === "in" ? <><span className="text-emerald-400">{user}@ramzure</span><span className="text-slate-500">:</span><span className="text-sky-400">~</span><span className="text-slate-500">$ </span>{l.text}</> : l.text}
            </pre>
          ))}
          <div className="flex items-center">
            <span className="text-emerald-400">{user}@ramzure</span><span className="text-slate-500">:</span><span className="text-sky-400">~</span><span className="mr-2 text-slate-500">$</span>
            <input ref={inp} value={val} onChange={(e) => setVal(e.target.value)} onKeyDown={key} autoFocus spellCheck={false} autoCapitalize="off" autoComplete="off"
              className="flex-1 bg-transparent text-slate-100 caret-emerald-400 outline-none" aria-label="Terminal input" />
          </div>
          <div ref={end} />
        </div>
        <div className="flex flex-wrap gap-2 border-t border-white/10 bg-[#0e1530] px-4 py-3">
          <span className="text-xs text-slate-500">Try:</span>
          {chips.map((c) => <button key={c} onClick={(e) => { e.stopPropagation(); submit(c); }} className="rounded-md bg-white/5 px-2 py-1 font-mono text-[11px] text-slate-300 hover:bg-white/10">{c}</button>)}
        </div>
      </div>
    </div>
  );
}
