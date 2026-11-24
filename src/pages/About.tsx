import { Code2, ExternalLink, FileText, Heart, Star, Shield, GitFork, BookOpen } from "lucide-react";
import { Badge, Btn, Card, GithubIcon, GITHUB_URL, Logo, REPO_URL } from "../ui";

const stack = ["React 19", "TypeScript", "Vite", "Tailwind CSS 4", "Lucide Icons"];
const files = [
  ["README.md", "Project overview & quick start"],
  ["LICENSE", "MIT — free to use & modify"],
  ["SECURITY.md", "How to report vulnerabilities"],
  ["CONTRIBUTING.md", "How to contribute"],
  ["CODE_OF_CONDUCT.md", "Community standards"],
  [".github/workflows", "CI build + GitHub Pages deploy"],
  [".github/ISSUE_TEMPLATE", "Bug & feature templates"],
];

export default function About() {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#050b1a] via-[#0b2a5e] to-[#4c2fd1] p-8 text-white shadow-xl sm:p-12">
        <div className="bg-grid absolute inset-0 opacity-50" />
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full bg-az-light/20 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-8">
          <div className="animate-float"><Logo size={84} text={false} /></div>
          <div className="min-w-0 flex-1">
            <Badge tone="blue" className="!bg-white/10 !text-sky-200 !ring-white/20">v1.0 · MIT licensed</Badge>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">Ramzure</h1>
            <p className="mt-3 max-w-2xl text-blue-100">A free, open-source cloud portal simulator built so anyone can learn cloud computing and cybersecurity — no credit card, no bill, no limits.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={REPO_URL} target="_blank" rel="noreferrer"><Btn variant="outline" className="!border-0 !text-slate-900"><Star className="h-4 w-4" /> Star on GitHub</Btn></a>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer"><Btn variant="ghost" className="!bg-white/15 !text-white hover:!bg-white/25"><GithubIcon className="h-4 w-4" /> Vaibhav222209</Btn></a>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-1">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-az-light via-az to-violet-600 text-4xl font-semibold text-white shadow-lg ring-4 ring-sky-100">VT</div>
            <h2 className="mt-4 text-xl font-semibold text-slate-900">Vaibhav Thakur</h2>
            <p className="text-sm text-slate-500">Creator & maintainer</p>
            <p className="mt-3 text-sm text-slate-600">Built Ramzure to make cloud and cybersecurity learning accessible to everyone — especially people without the budget for real cloud bills.</p>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800">
              <GithubIcon className="h-4 w-4" /> github.com/Vaibhav222209 <ExternalLink className="h-3.5 w-3.5 opacity-60" />
            </a>
          </div>
        </Card>

        <Card className="p-6 lg:col-span-2">
          <h3 className="flex items-center gap-2 font-semibold text-slate-900"><GitFork className="h-4 w-4 text-az" /> GitHub repository files</h3>
          <p className="mb-4 mt-1 text-sm text-slate-500">This project ships with everything needed to publish it on your GitHub profile.</p>
          <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
            {files.map(([f, d]) => (
              <li key={f} className="flex items-center gap-3 px-4 py-2.5 text-sm"><FileText className="h-4 w-4 text-slate-400" /><code className="font-mono font-medium text-slate-800">{f}</code><span className="ml-auto hidden text-slate-400 sm:block">{d}</span></li>
            ))}
          </ul>
          <div className="mt-4 rounded-xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-emerald-300">
            <p className="text-slate-500"># publish to your profile</p>
            <p>git init && git add . && git commit -m "feat: Ramzure v1.0"</p>
            <p>git branch -M main</p>
            <p>git remote add origin https://github.com/Vaibhav222209/ramzure.git</p>
            <p>git push -u origin main</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6"><Code2 className="h-6 w-6 text-az" /><h3 className="mt-3 font-semibold text-slate-900">Built with</h3><div className="mt-3 flex flex-wrap gap-2">{stack.map((s) => <Badge key={s} tone="blue">{s}</Badge>)}</div></Card>
        <Card className="p-6"><Shield className="h-6 w-6 text-violet-600" /><h3 className="mt-3 font-semibold text-slate-900">Privacy first</h3><p className="mt-2 text-sm text-slate-500">Everything runs in your browser. State is stored only in localStorage — no servers, no tracking, no accounts.</p></Card>
        <Card className="p-6"><BookOpen className="h-6 w-6 text-emerald-600" /><h3 className="mt-3 font-semibold text-slate-900">Disclaimer</h3><p className="mt-2 text-sm text-slate-500">Ramzure is an independent educational project, not affiliated with or endorsed by Microsoft. Product names mentioned belong to their owners.</p></Card>
      </div>

      <p className="flex items-center justify-center gap-1.5 pb-2 text-sm text-slate-500">Made with <Heart className="h-4 w-4 fill-rose-500 text-rose-500" /> by <a className="font-semibold text-slate-800 hover:underline" href={GITHUB_URL} target="_blank" rel="noreferrer">Vaibhav Thakur</a></p>
    </div>
  );
}
