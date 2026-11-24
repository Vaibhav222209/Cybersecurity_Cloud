import { useMemo, useState } from "react";
import {
  ArrowRight, Check, Compass, Cpu, Eye, EyeOff, Fingerprint, KeyRound, Lock, Radar,
  ShieldCheck, Smartphone, Flame, ShieldAlert, Layers, Terminal, Server, Database, Globe, Sparkles, DollarSign,
} from "lucide-react";
import { Btn, CreditBar, GithubIcon, GITHUB_URL, Logo, Modal, REPO_URL } from "./ui";
import type { Page, Session } from "./store";
import { cn } from "./utils/cn";

interface Props { onEnter: (s: Session, page?: Page) => void }

function strength(p: string) {
  let s = 0;
  if (p.length >= 8) s++;
  if (p.length >= 12) s++;
  if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s++;
  if (/\d/.test(p)) s++;
  if (/[^A-Za-z0-9]/.test(p)) s++;
  return Math.min(s, 4);
}

function SignIn({ open, onClose, onDone }: { open: boolean; onClose: () => void; onDone: (s: Session) => void }) {
  const [step, setStep] = useState<"creds" | "mfa">("creds");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [tries, setTries] = useState(0);
  const otp = useMemo(() => String(Math.floor(100000 + Math.random() * 900000)), [open]);
  const st = strength(pw);
  const labels = ["Too weak", "Weak", "Fair", "Strong", "Excellent"];
  const colors = ["bg-red-500", "bg-red-500", "bg-amber-500", "bg-emerald-500", "bg-emerald-600"];

  const nameFromEmail = () => {
    const base = email.split("@")[0].replace(/[._-]+/g, " ").trim();
    return base ? base.replace(/\b\w/g, (c) => c.toUpperCase()) : "Learner";
  };

  const next = () => {
    if (!/^\S+@\S+\.\S+$/.test(email)) return setErr("Enter a valid email address.");
    if (pw.length < 8) return setErr("Password must be at least 8 characters.");
    setErr(""); setStep("mfa");
  };
  const verify = () => {
    if (tries >= 4) return setErr("Too many attempts — account locked for this demo. Close and retry.");
    if (code === otp) onDone({ name: nameFromEmail(), email, guest: false });
    else { setTries(tries + 1); setErr(`Incorrect code. ${3 - tries > 0 ? 3 - tries : 0} attempts left before lockout.`); }
  };

  return (
    <Modal open={open} onClose={onClose} title={<span className="flex items-center gap-2"><Lock className="h-4 w-4 text-az" /> Sign in to Ramzure</span>}>
      {step === "creds" ? (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">This is a simulation — no data leaves your browser. Use any email and password.</p>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-az focus:ring-2 focus:ring-az/20" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input type={show ? "text" : "password"} value={pw} onChange={(e) => setPw(e.target.value)} onKeyDown={(e) => e.key === "Enter" && next()}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 pr-10 text-sm outline-none focus:border-az focus:ring-2 focus:ring-az/20" />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-2 top-2 text-slate-400 hover:text-slate-700">
                {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {pw && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((i) => <div key={i} className={cn("h-1.5 flex-1 rounded-full", i < st ? colors[st] : "bg-slate-200")} />)}
                </div>
                <p className="mt-1 text-xs text-slate-500">Password strength: <b>{labels[st]}</b></p>
              </div>
            )}
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Btn onClick={next} className="w-full">Continue <ArrowRight className="h-4 w-4" /></Btn>
          <div className="relative text-center text-xs text-slate-400"><span className="relative z-10 bg-white px-2">or</span><div className="absolute inset-x-0 top-1/2 h-px bg-slate-200" /></div>
          <Btn variant="outline" className="w-full" onClick={() => onDone({ name: "Guest Learner", email: "guest@ramzure.dev", guest: true })}>
            Continue as guest
          </Btn>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
            <Smartphone className="mt-0.5 h-8 w-8 shrink-0 text-az-light" />
            <div>
              <p className="text-xs uppercase tracking-wider text-slate-400">Ramzure Authenticator (simulated)</p>
              <p className="mt-1 font-mono text-3xl font-semibold tracking-[0.3em]">{otp}</p>
              <p className="mt-1 text-xs text-slate-400">Your one-time code. Type it below to finish signing in.</p>
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Verification code</label>
            <input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} onKeyDown={(e) => e.key === "Enter" && verify()}
              inputMode="numeric" placeholder="000000" autoFocus
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center font-mono text-xl tracking-[0.4em] outline-none focus:border-az focus:ring-2 focus:ring-az/20" />
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <Btn onClick={verify} className="w-full" disabled={code.length !== 6}>Verify & sign in</Btn>
          <button onClick={() => { setStep("creds"); setErr(""); setCode(""); }} className="w-full text-center text-sm text-az hover:underline">Back</button>
        </div>
      )}
    </Modal>
  );
}

const features = [
  { icon: Server, title: "Compute", text: "Spin up virtual machines, serverless functions and Kubernetes clusters in seconds.", color: "from-sky-500 to-blue-600" },
  { icon: Database, title: "Data", text: "Relational, NoSQL and object storage with simulated backups and geo-redundancy.", color: "from-orange-400 to-red-500" },
  { icon: Globe, title: "Web & Apps", text: "Deploy web apps and APIs, learn scaling, TLS, and custom domains hands-on.", color: "from-violet-500 to-fuchsia-500" },
  { icon: Terminal, title: "Cloud Shell", text: "A browser terminal with an `rz` CLI to automate everything, just like the real thing.", color: "from-emerald-400 to-teal-600" },
  { icon: DollarSign, title: "Cost Management", text: "Practice budgeting with $200 of free sandbox credit. Zero real money, ever.", color: "from-amber-400 to-orange-500" },
  { icon: Compass, title: "Discover", text: "Guided learning paths, concept explainers, and a security quiz to level you up.", color: "from-pink-500 to-rose-500" },
];

const security = [
  { icon: ShieldCheck, name: "Defender for Cloud", text: "Secure score, recommendations & 9 workload protection plans.", tag: "CSPM · CWPP" },
  { icon: Radar, name: "Sentinel SIEM", text: "Live threat feed, MITRE ATT&CK mapping and automated playbooks.", tag: "SIEM · SOAR" },
  { icon: Fingerprint, name: "Entra ID", text: "Users, MFA enforcement and Conditional Access policies.", tag: "IAM · Zero Trust" },
  { icon: KeyRound, name: "Key Vault", text: "Secrets with reveal, rotate and purge-protection controls.", tag: "Secrets · HSM" },
  { icon: Flame, name: "Firewall & NSG", text: "Network rules, WAF and DDoS protection you can configure.", tag: "Network" },
  { icon: Layers, name: "Compliance", text: "ISO 27001, SOC 2, NIST, PCI DSS & GDPR posture dashboards.", tag: "Governance" },
];

export default function Landing({ onEnter }: Props) {
  const [open, setOpen] = useState(false);
  const guest = (page: Page) => onEnter({ name: "Guest Learner", email: "guest@ramzure.dev", guest: true }, page);

  return (
    <div className="min-h-full bg-[#050b1a] text-white">
      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#050b1a]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Logo size={34} />
          <nav className="hidden items-center gap-7 text-sm text-slate-300 md:flex">
            <a href="#features" className="hover:text-white">Services</a>
            <a href="#security" className="hover:text-white">Security</a>
            <button onClick={() => guest("discover")} className="hover:text-white">Discover</button>
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-white"><GithubIcon className="h-4 w-4" /> GitHub</a>
          </nav>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" className="!text-slate-200 hover:!bg-white/10" onClick={() => setOpen(true)}>Sign in</Btn>
            <Btn onClick={() => guest("home")}>Start free</Btn>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]" />
        <div className="animate-glow absolute -left-32 top-10 h-96 w-96 rounded-full bg-sky-500/30 blur-[120px]" />
        <div className="animate-glow absolute -right-24 top-40 h-96 w-96 rounded-full bg-violet-600/30 blur-[120px]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-24 pt-20 lg:grid-cols-2 lg:pt-28">
          <div className="animate-fade-up">
            <span className="glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-xs font-medium text-sky-200">
              <Sparkles className="h-3.5 w-3.5" /> 100% free · open source · no credit card
            </span>
            <h1 className="mt-6 text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Learn the cloud.<br /><span className="text-gradient">Without the bill.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-slate-300">
              Ramzure is a full cloud-portal simulator — virtual machines, databases, networking and
              enterprise-grade cybersecurity tooling — that runs entirely in your browser. Practice real
              cloud skills with zero cost.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn onClick={() => guest("home")} className="!px-6 !py-3 !text-base">Launch portal <ArrowRight className="h-4 w-4" /></Btn>
              <Btn variant="ghost" onClick={() => guest("discover")} className="glass !px-6 !py-3 !text-base !text-white hover:!bg-white/15">
                <Compass className="h-4 w-4" /> Discover
              </Btn>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm text-slate-400">
              {["Secure score engine", "Live threat feed", "Cloud Shell CLI"].map((t) => (
                <span key={t} className="inline-flex items-center gap-2"><Check className="h-4 w-4 text-emerald-400" />{t}</span>
              ))}
            </div>
          </div>

          {/* Mock portal */}
          <div className="relative animate-fade-up [animation-delay:150ms]">
            <div className="glass overflow-hidden rounded-2xl shadow-2xl shadow-sky-900/40">
              <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
                <span className="h-3 w-3 rounded-full bg-red-400/80" /><span className="h-3 w-3 rounded-full bg-amber-400/80" /><span className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-3 rounded-md bg-white/10 px-3 py-0.5 text-xs text-slate-300">portal.ramzure.dev</span>
              </div>
              <div className="grid grid-cols-3 gap-3 p-4">
                {[["Resources", "12", Server], ["Running", "7", Cpu], ["Threats blocked", "1,284", ShieldCheck]].map(([l, v, I]) => {
                  const Ic = I as typeof Server;
                  return (
                    <div key={l as string} className="rounded-xl bg-white/5 p-3">
                      <Ic className="h-4 w-4 text-sky-300" />
                      <p className="mt-2 text-xl font-semibold">{v as string}</p>
                      <p className="text-[11px] text-slate-400">{l as string}</p>
                    </div>
                  );
                })}
                <div className="col-span-3 rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between text-xs text-slate-400"><span>Traffic vs. threats · 24h</span><span className="text-emerald-400">● live</span></div>
                  <svg viewBox="0 0 400 90" className="mt-2 w-full">
                    <defs><linearGradient id="hg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#50e6ff" stopOpacity=".5" /><stop offset="1" stopColor="#50e6ff" stopOpacity="0" /></linearGradient></defs>
                    <path d="M0,70 C40,60 60,30 100,40 S160,70 200,45 S280,10 320,30 S380,50 400,25 V90 H0Z" fill="url(#hg)" />
                    <path d="M0,70 C40,60 60,30 100,40 S160,70 200,45 S280,10 320,30 S380,50 400,25" fill="none" stroke="#50e6ff" strokeWidth="2" />
                    <path d="M0,82 C50,80 90,76 140,80 S230,60 270,74 S350,78 400,70" fill="none" stroke="#f87171" strokeWidth="1.5" strokeDasharray="4 3" />
                  </svg>
                </div>
              </div>
            </div>
            <div className="glass animate-float absolute -left-6 -top-6 hidden items-center gap-3 rounded-xl px-4 py-3 shadow-xl sm:flex">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-sm font-bold text-emerald-300">87</div>
              <div><p className="text-xs text-slate-400">Secure score</p><p className="text-sm font-medium">Good posture</p></div>
            </div>
            <div className="glass animate-float-slow absolute -bottom-6 -right-4 hidden items-center gap-3 rounded-xl px-4 py-3 shadow-xl sm:flex">
              <ShieldAlert className="h-8 w-8 text-rose-300" />
              <div><p className="text-xs text-slate-400">Just now</p><p className="text-sm font-medium">SSH brute-force blocked</p></div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-sky-400">Everything you need</p>
          <h2 className="mt-3 text-4xl font-semibold tracking-tight">A complete cloud portal. Nothing to pay.</h2>
          <p className="mt-4 text-slate-400">Create resources, manage them, and break things safely — all without a credit card.</p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="glass group rounded-2xl p-6 transition hover:-translate-y-1 hover:bg-white/10">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br shadow-lg", f.color)}><f.icon className="h-6 w-6 text-white" /></div>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECURITY */}
      <section id="security" className="relative overflow-hidden border-y border-white/10 bg-gradient-to-b from-[#07122b] to-[#050b1a] py-20">
        <div className="absolute right-0 top-0 h-80 w-80 rounded-full bg-violet-600/20 blur-[110px]" />
        <div className="relative mx-auto max-w-7xl px-5">
          <div className="grid items-end gap-6 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-violet-300">Cybersecurity built in</p>
              <h2 className="mt-3 text-4xl font-semibold tracking-tight">The same defences the big clouds use.</h2>
            </div>
            <p className="text-slate-400">Explore the security stack behind enterprise clouds — posture management, SIEM, identity protection, secrets, firewalls and compliance — and learn by fixing real-looking vulnerabilities.</p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {security.map((s) => (
              <button key={s.name} onClick={() => guest("security")} className="glass group relative overflow-hidden rounded-2xl p-6 text-left transition hover:border-sky-400/50">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-400/70 to-transparent opacity-0 transition group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <s.icon className="h-7 w-7 text-sky-300" />
                  <span className="rounded-full bg-sky-400/10 px-2.5 py-0.5 text-[11px] font-medium text-sky-300">{s.tag}</span>
                </div>
                <h3 className="mt-4 font-semibold">{s.name}</h3>
                <p className="mt-1.5 text-sm text-slate-400">{s.text}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 py-24 text-center">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-az via-blue-600 to-violet-700 p-12 shadow-2xl shadow-blue-900/40">
          <div className="bg-grid absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="text-4xl font-semibold tracking-tight">Your cloud journey starts here.</h2>
            <p className="mx-auto mt-4 max-w-xl text-blue-100">No billing. No limits. Just you, the portal and a safe place to learn how modern cloud infrastructure and security really work.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Btn variant="outline" className="!border-0 !px-7 !py-3 !text-base !text-blue-700" onClick={() => guest("home")}>Launch the portal</Btn>
              <Btn variant="ghost" className="!px-7 !py-3 !text-base !text-white hover:!bg-white/15" onClick={() => setOpen(true)}>Sign in with MFA</Btn>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-5 text-center">
          <Logo size={28} />
          <CreditBar dark />
          <p className="max-w-2xl text-xs text-slate-500">
            Ramzure is an independent educational project and is not affiliated with, endorsed by or sponsored by Microsoft. “Azure” and related marks belong to their respective owners.
            <a href={GITHUB_URL} className="ml-1 text-slate-400 underline" target="_blank" rel="noreferrer">MIT licensed</a>.
          </p>
        </div>
      </footer>

      <SignIn open={open} onClose={() => setOpen(false)} onDone={(s) => onEnter(s, "home")} />
    </div>
  );
}
