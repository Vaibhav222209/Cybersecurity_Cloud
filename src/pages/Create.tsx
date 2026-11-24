import { useEffect, useMemo, useState } from "react";
import { Check, CheckCircle2, ChevronLeft, Loader2, ShieldAlert, ShieldCheck } from "lucide-react";
import { REGIONS, RES_DEFS, type ResType } from "../data";
import { Badge, Btn, Card, Icon, Modal, PageHeader, Toggle } from "../ui";
import { useNav, useStore } from "../store";
import { cn } from "../utils/cn";

const STEPS = ["Basics", "Security", "Review + create"];
const DEPLOY = ["Validating configuration", "Provisioning resource group & network", "Applying security baseline", "Starting resource", "Deployment complete"];

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">{label}</label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
const input = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-az focus:ring-2 focus:ring-az/20";

function Wizard({ type, onClose }: { type: ResType; onClose: () => void }) {
  const d = RES_DEFS[type];
  const { state, addResource, set, toast } = useStore();
  const { go } = useNav();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [group, setGroup] = useState(state.groups[0]);
  const [newGroup, setNewGroup] = useState("");
  const [region, setRegion] = useState(REGIONS[0]);
  const [sku, setSku] = useState(d.skus[0].name);
  const [pub, setPub] = useState(type === "webapp");
  const [enc, setEnc] = useState(true);
  const [https, setHttps] = useState(true);
  const [auth, setAuth] = useState("SSH key");
  const [defender, setDefender] = useState(true);
  const [deploying, setDeploying] = useState(false);
  const [prog, setProg] = useState(0);
  const [done, setDone] = useState<string | null>(null);

  const finalGroup = group === "__new" ? newGroup.trim() : group;
  const nameRe = type === "storage" ? /^[a-z0-9]{3,24}$/ : /^[a-z0-9][a-z0-9-]{2,40}$/;
  const nameErr = name && !nameRe.test(name)
    ? type === "storage" ? "3–24 lowercase letters and numbers only." : "3–41 chars: lowercase letters, numbers, hyphens."
    : state.resources.some((r) => r.name === name) ? "That name is already taken." : "";
  const basicsOk = !!name && !nameErr && !!finalGroup;
  const skuObj = d.skus.find((s) => s.name === sku)!;

  const issues = useMemo(() => {
    const i: string[] = [];
    if (pub) i.push("Public network access allows connections from the Internet");
    if (!enc) i.push("Data will not be encrypted at rest");
    if (type === "webapp" && !https) i.push("HTTP traffic will not be redirected to HTTPS");
    if (type === "vm" && auth === "Password") i.push("Password login is vulnerable to brute-force attacks");
    return i;
  }, [pub, enc, https, auth, type]);

  const deploy = () => {
    setDeploying(true);
    let p = 0;
    const t = setInterval(() => {
      p++;
      setProg(p);
      if (p >= DEPLOY.length - 1) {
        clearInterval(t);
        const r = addResource({
          name, type, group: finalGroup, region, sku,
          status: type === "vm" || type === "webapp" || type === "function" || type === "aks" ? "Running" : "Available",
          costHr: skuObj.costHr, publicAccess: pub, encrypted: enc,
          httpsOnly: type === "webapp" ? https : undefined, auth: type === "vm" ? auth : undefined,
        });
        if (defender && type === "vm") set((s) => ({ ...s, defender: { ...s.defender, servers: true } }));
        if (type === "vm" && pub && auth === "Password") {
          set((s) => ({ ...s, activity: [{ id: r.id, text: `Defender: ${name} exposes password auth to the Internet`, time: Date.now(), kind: "warn" as const }, ...s.activity] }));
        }
        setProg(DEPLOY.length);
        setDone(r.id);
        toast(`${name} deployed successfully`, "success");
      }
    }, 750);
  };

  return (
    <Modal open onClose={deploying && !done ? () => {} : onClose} wide
      title={<span className="flex items-center gap-2"><Icon name={d.icon} className="h-5 w-5" style={{ color: d.color }} /> Create {d.label}</span>}
      footer={!deploying && (
        <>
          {step > 0 && <Btn variant="outline" onClick={() => setStep(step - 1)}><ChevronLeft className="h-4 w-4" /> Previous</Btn>}
          {step < 2 && <Btn onClick={() => setStep(step + 1)} disabled={step === 0 && !basicsOk}>Next</Btn>}
          {step === 2 && <Btn onClick={deploy}>Create</Btn>}
        </>
      )}
    >
      {deploying ? (
        <div className="py-4">
          <h4 className="text-lg font-semibold text-slate-900">{done ? "Your deployment is complete" : "Deployment in progress…"}</h4>
          <p className="text-sm text-slate-500">{name} · {finalGroup} · {region}</p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-gradient-to-r from-az to-violet-500 transition-all duration-700" style={{ width: `${(prog / DEPLOY.length) * 100}%` }} />
          </div>
          <ul className="mt-5 space-y-3">
            {DEPLOY.map((s, i) => (
              <li key={s} className={cn("flex items-center gap-3 text-sm", i > prog ? "text-slate-300" : "text-slate-700")}>
                {i < prog ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : i === prog ? <Loader2 className="h-5 w-5 animate-spin text-az" /> : <span className="h-5 w-5 rounded-full border-2 border-slate-200" />}
                {s}
              </li>
            ))}
          </ul>
          {done && (
            <div className="mt-6 flex gap-2">
              <Btn onClick={() => { onClose(); go("resources", { focus: done }); }}>Go to resource</Btn>
              <Btn variant="outline" onClick={onClose}>Close</Btn>
            </div>
          )}
        </div>
      ) : (
        <>
          <ol className="mb-6 flex items-center gap-2">
            {STEPS.map((s, i) => (
              <li key={s} className="flex flex-1 items-center gap-2">
                <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold", i < step ? "bg-emerald-500 text-white" : i === step ? "bg-az text-white" : "bg-slate-100 text-slate-400")}>
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className={cn("hidden text-sm sm:block", i === step ? "font-medium text-slate-900" : "text-slate-400")}>{s}</span>
                {i < 2 && <span className="h-px flex-1 bg-slate-200" />}
              </li>
            ))}
          </ol>

          {step === 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2"><Field label="Name" hint={nameErr || undefined}>
                <input value={name} onChange={(e) => setName(e.target.value.toLowerCase())} placeholder={`${d.prefix}-myproject-01`} autoFocus className={cn(input, nameErr && "border-red-400")} />
                {nameErr && <p className="mt-1 text-xs text-red-500">{nameErr}</p>}
              </Field></div>
              <Field label="Resource group">
                <select value={group} onChange={(e) => setGroup(e.target.value)} className={input}>
                  {state.groups.map((g) => <option key={g}>{g}</option>)}<option value="__new">+ Create new…</option>
                </select>
                {group === "__new" && <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="rg-my-group" className={cn(input, "mt-2")} />}
              </Field>
              <Field label="Region"><select value={region} onChange={(e) => setRegion(e.target.value)} className={input}>{REGIONS.map((r) => <option key={r}>{r}</option>)}</select></Field>
              <div className="sm:col-span-2">
                <Field label="Size / pricing tier">
                  <div className="grid gap-2 sm:grid-cols-2">
                    {d.skus.map((s) => (
                      <button key={s.name} type="button" onClick={() => setSku(s.name)}
                        className={cn("rounded-lg border p-3 text-left transition", sku === s.name ? "border-az bg-sky-50 ring-2 ring-az/20" : "border-slate-200 hover:border-slate-300")}>
                        <p className="text-sm font-semibold text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.spec}</p>
                        <p className="mt-1 text-xs font-medium text-az">{s.costHr === 0 ? "Free" : `$${(s.costHr * 730).toFixed(2)}/mo`}</p>
                      </button>
                    ))}
                  </div>
                </Field>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3">
              {type === "vm" && (
                <Field label="Authentication type">
                  <div className="grid grid-cols-2 gap-2">
                    {["SSH key", "Password"].map((a) => (
                      <button key={a} onClick={() => setAuth(a)} className={cn("rounded-lg border p-3 text-sm", auth === a ? "border-az bg-sky-50 font-medium" : "border-slate-200")}>
                        {a} {a === "SSH key" && <Badge tone="green" className="ml-1">Recommended</Badge>}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
              {[
                { l: "Allow public network access", s: "Expose this resource to the Internet. Prefer private endpoints.", v: pub, f: setPub, bad: pub },
                { l: "Encryption at rest (AES-256)", s: "Encrypt data using platform-managed keys.", v: enc, f: setEnc, bad: !enc },
                ...(type === "webapp" ? [{ l: "HTTPS only", s: "Redirect HTTP → HTTPS and enforce TLS 1.2+.", v: https, f: setHttps, bad: !https }] : []),
                ...(type === "vm" ? [{ l: "Enable Defender for Servers", s: "Endpoint detection, vulnerability scanning and JIT access.", v: defender, f: setDefender, bad: false }] : []),
              ].map((o) => (
                <div key={o.l} className={cn("flex items-center justify-between gap-4 rounded-xl border p-4", o.bad ? "border-amber-200 bg-amber-50/50" : "border-slate-200")}>
                  <div><p className="text-sm font-medium text-slate-800">{o.l}</p><p className="text-xs text-slate-500">{o.s}</p></div>
                  <Toggle checked={o.v} onChange={o.f} />
                </div>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className={cn("flex gap-3 rounded-xl p-4 text-sm", issues.length ? "bg-amber-50 text-amber-800" : "bg-emerald-50 text-emerald-800")}>
                {issues.length ? <ShieldAlert className="h-5 w-5 shrink-0" /> : <ShieldCheck className="h-5 w-5 shrink-0" />}
                <div>
                  <p className="font-semibold">{issues.length ? "Security review: attention needed" : "Security review passed"}</p>
                  {issues.length === 0 && <p>This configuration follows the secure-by-default baseline.</p>}
                  <ul className="list-disc pl-4">{issues.map((i) => <li key={i}>{i}</li>)}</ul>
                </div>
              </div>
              <dl className="divide-y divide-slate-100 rounded-xl border border-slate-200 text-sm">
                {[["Name", name], ["Type", d.label], ["Resource group", finalGroup], ["Region", region], ["Size", `${sku} (${skuObj.spec})`],
                  ["Public access", pub ? "Enabled" : "Disabled"], ["Encryption", enc ? "AES-256" : "Off"],
                  ["Estimated cost", skuObj.costHr === 0 ? "Free" : `$${(skuObj.costHr * 730).toFixed(2)} / month`]].map(([k, v]) => (
                  <div key={k} className="flex justify-between px-4 py-2.5"><dt className="text-slate-500">{k}</dt><dd className="font-medium text-slate-800">{v}</dd></div>
                ))}
              </dl>
              <p className="text-xs text-slate-400">Billed against your free sandbox credit — no real charges.</p>
            </div>
          )}
        </>
      )}
    </Modal>
  );
}

export default function Create() {
  const { nav } = useNav();
  const [type, setType] = useState<ResType | null>(nav.create ?? null);
  const [cat, setCat] = useState("All");
  useEffect(() => { if (nav.create) setType(nav.create); }, [nav.create]);
  const cats = ["All", ...Array.from(new Set(Object.values(RES_DEFS).map((d) => d.cat)))];

  return (
    <div>
      <PageHeader icon="Cloud" title="Create a resource" subtitle="Pick a service from the Ramzure marketplace to get started" />
      <div className="mb-5 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} onClick={() => setCat(c)} className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition", cat === c ? "bg-az text-white shadow" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50")}>{c}</button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(RES_DEFS).filter((d) => cat === "All" || d.cat === cat).map((d) => (
          <Card key={d.type} className="group flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="flex items-start justify-between">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-md" style={{ background: `linear-gradient(135deg, ${d.color}, ${d.color}99)` }}><Icon name={d.icon} className="h-6 w-6" /></span>
              <Badge>{d.cat}</Badge>
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">{d.label}</h3>
            <p className="mt-1 flex-1 text-sm text-slate-500">{d.desc}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-xs text-slate-400">from {d.skus[0].costHr === 0 ? "Free" : `$${(d.skus[0].costHr * 730).toFixed(2)}/mo`}</span>
              <Btn onClick={() => setType(d.type)} className="!py-1.5">Create</Btn>
            </div>
          </Card>
        ))}
      </div>
      {type && <Wizard key={type} type={type} onClose={() => setType(null)} />}
    </div>
  );
}
