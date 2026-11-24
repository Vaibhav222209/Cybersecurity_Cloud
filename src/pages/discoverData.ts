export interface Module { id: string; title: string; mins: number; body: string; try?: { label: string; page: "create" | "security" | "shell" | "cost"; tab?: string; create?: string } }
export interface Path { id: string; title: string; level: string; icon: string; color: string; blurb: string; modules: Module[] }

export const PATHS: Path[] = [
  {
    id: "fundamentals", title: "Cloud Fundamentals", level: "Beginner", icon: "Cloud", color: "#0078d4",
    blurb: "What the cloud actually is, and why every company uses it.",
    modules: [
      { id: "f1", title: "What is cloud computing?", mins: 6, body: "Cloud computing means renting computing power, storage and software over the Internet instead of buying and maintaining your own hardware. You pay only for what you use (pay-as-you-go), and you can scale up or down in minutes. Think of it like electricity: you don't own a power plant, you just plug in." },
      { id: "f2", title: "Regions, zones & the global network", mins: 7, body: "A region is a geographic area containing one or more datacenters (e.g. Central India, West Europe). Each region has Availability Zones — physically separate buildings with independent power, cooling and networking. Deploying across zones keeps your app alive if a whole building fails." },
      { id: "f3", title: "Create your first virtual machine", mins: 8, body: "A virtual machine (VM) is a software-defined computer. You choose the OS, CPU and RAM — and it boots in under a minute. Try it in Ramzure: pick a size, choose SSH key authentication and keep public access disabled.", try: { label: "Create a VM", page: "create", create: "vm" } },
      { id: "f4", title: "Storage: blobs, files, disks", mins: 6, body: "Object storage (blobs) holds unstructured data like images and backups. File shares behave like network drives. Disks attach to VMs. Redundancy options (LRS, ZRS, GRS) decide how many copies are kept and where." },
      { id: "f5", title: "Pricing & staying free", mins: 5, body: "Costs depend on size, runtime and data transfer. Stop (deallocate) VMs you aren't using, pick the smallest SKU that works, and set budget alerts. In Cost Management you can practice all of this against a $200 sandbox credit.", try: { label: "Open Cost Management", page: "cost" } },
    ],
  },
  {
    id: "security", title: "Cloud Security Essentials", level: "Beginner → Intermediate", icon: "ShieldCheck", color: "#6d28d9",
    blurb: "Protect identities, data, networks and workloads.",
    modules: [
      { id: "s1", title: "The shared responsibility model", mins: 6, body: "The cloud provider secures the cloud (datacenters, hardware, hypervisor). You secure what you put in the cloud (identities, data, configuration, and — for VMs — the OS). Most breaches come from customer misconfiguration, not provider failures." },
      { id: "s2", title: "Identity is the new perimeter", mins: 8, body: "Attackers log in rather than break in. Protect identities with MFA, least-privilege roles, Conditional Access and Privileged Identity Management (just-in-time admin rights). Turn on MFA for every user in Ramzure's Identity tab.", try: { label: "Enforce MFA", page: "security", tab: "identity" } },
      { id: "s3", title: "Network security: NSGs, firewalls & WAF", mins: 9, body: "Network Security Groups are allow/deny rules per subnet or NIC. Never expose SSH (22) or RDP (3389) to the whole Internet — attackers scan for them constantly. A WAF adds layer-7 protection against SQL injection and XSS; DDoS protection absorbs floods.", try: { label: "Review NSG rules", page: "security", tab: "network" } },
      { id: "s4", title: "Secrets & encryption", mins: 7, body: "Encrypt data at rest (AES-256) and in transit (TLS 1.2+). Store passwords, API keys and certificates in a vault — never in source code. Use managed identities so apps authenticate without any stored credential.", try: { label: "Open Key Vault", page: "security", tab: "keyvault" } },
      { id: "s5", title: "Detect & respond with SIEM/SOAR", mins: 10, body: "A SIEM (like Sentinel) collects logs from everywhere, correlates them and raises incidents. A SOAR playbook automates the response — block an IP, disable a user, isolate a VM. Watch the live feed and enable the playbook.", try: { label: "Watch the live feed", page: "security", tab: "sentinel" } },
      { id: "s6", title: "Posture management & compliance", mins: 6, body: "Defender for Cloud continuously scans resources against best practice and produces a secure score. Frameworks like ISO 27001, SOC 2 and PCI DSS map to these controls. Aim to turn every recommendation green.", try: { label: "Raise your score", page: "security", tab: "overview" } },
    ],
  },
  {
    id: "networking", title: "Networking & Apps", level: "Intermediate", icon: "Network", color: "#0e9f6e",
    blurb: "Connect, publish and scale applications safely.",
    modules: [
      { id: "n1", title: "Virtual networks & subnets", mins: 8, body: "A virtual network (VNet) is your private address space, e.g. 10.0.0.0/16. Subnets slice it into segments (web, app, database) so you can apply different security rules to each tier." },
      { id: "n2", title: "Publish a web app", mins: 7, body: "App Service/Web Apps run your code without managing servers. Always enforce HTTPS-only and keep secrets in Key Vault. Deploy one and review its security posture.", try: { label: "Create a Web App", page: "create", create: "webapp" } },
      { id: "n3", title: "Load balancing & high availability", mins: 7, body: "A load balancer spreads traffic across several healthy instances. Combined with zones and health probes, a single failure never becomes an outage." },
      { id: "n4", title: "Serverless with Functions", mins: 6, body: "Functions run small pieces of code in response to events (HTTP call, queue message, timer). You pay per execution, and scaling to zero means idle costs nothing.", try: { label: "Create a Function App", page: "create", create: "function" } },
    ],
  },
  {
    id: "automation", title: "Automation & CLI", level: "Intermediate", icon: "Terminal", color: "#d97706",
    blurb: "Stop clicking — script your infrastructure.",
    modules: [
      { id: "a1", title: "Why Infrastructure as Code?", mins: 5, body: "Scripts and templates make deployments repeatable, reviewable and auditable. Click-ops is slow and error-prone; code can be versioned in Git and reviewed in pull requests." },
      { id: "a2", title: "Your first CLI commands", mins: 8, body: "Open Cloud Shell and run `rz help`. Try `rz vm list`, `rz vm create --name demo01`, and `rz security score`.", try: { label: "Open Cloud Shell", page: "shell" } },
      { id: "a3", title: "Policy as code & least privilege", mins: 6, body: "Policies can deny non-compliant deployments before they happen (e.g. 'no public storage'). Combine with role-based access control so each identity gets only what it needs." },
    ],
  },
];

export const LAYERS = [
  { name: "Physical", text: "Datacenter access control, cameras, biometric entry, hardware tamper protection." },
  { name: "Identity & access", text: "MFA, Conditional Access, least privilege and just-in-time elevation." },
  { name: "Perimeter", text: "DDoS protection and edge filtering stop volumetric attacks before they reach you." },
  { name: "Network", text: "Segmentation, NSGs and firewalls limit lateral movement between workloads." },
  { name: "Compute", text: "Patch VMs, harden images, endpoint detection and just-in-time access." },
  { name: "Application", text: "Secure code, WAF, dependency scanning and secrets kept out of source control." },
  { name: "Data", text: "Encryption at rest and in transit, key management, classification and backups." },
];

// rows: layer, then who manages for [On-prem, IaaS, PaaS, SaaS]  (0 = you, 1 = provider)
export const RESP_LAYERS = [
  { layer: "Data & content", v: [0, 0, 0, 0] },
  { layer: "Identities & access", v: [0, 0, 0, 0] },
  { layer: "Applications", v: [0, 0, 0, 1] },
  { layer: "Runtime & middleware", v: [0, 0, 1, 1] },
  { layer: "Operating system", v: [0, 0, 1, 1] },
  { layer: "Virtualisation", v: [0, 1, 1, 1] },
  { layer: "Servers & storage", v: [0, 1, 1, 1] },
  { layer: "Network & datacenter", v: [0, 1, 1, 1] },
];
export const MODELS = [
  { name: "On-premises", ex: "Your own server room" },
  { name: "IaaS", ex: "Virtual Machines, VNets" },
  { name: "PaaS", ex: "Web Apps, SQL Database, Functions" },
  { name: "SaaS", ex: "Email, Office apps, CRM" },
];

export interface Q { q: string; o: string[]; a: number; why: string }
export const QUIZ: Q[] = [
  { q: "Which is MOST effective at stopping automated credential-stuffing attacks?", o: ["Longer usernames", "Multi-factor authentication", "Changing the region", "Hiding the login page"], a: 1, why: "MFA means a stolen password alone is not enough to sign in." },
  { q: "In the shared responsibility model for IaaS (VMs), who patches the guest operating system?", o: ["The cloud provider", "You, the customer", "Your ISP", "Nobody — it patches itself"], a: 1, why: "With IaaS you manage the OS, apps and data. The provider manages hardware and the hypervisor." },
  { q: "Which NSG rule is the riskiest?", o: ["Allow 443 from Internet", "Allow 22 from VirtualNetwork", "Allow 3389 from Any", "Deny all inbound"], a: 2, why: "RDP open to the whole Internet is constantly brute-forced and exploited." },
  { q: "What does a Web Application Firewall primarily protect against?", o: ["Hardware failure", "SQL injection and XSS", "Power outages", "Slow disks"], a: 1, why: "A WAF inspects HTTP traffic (layer 7) and blocks OWASP Top 10 attacks." },
  { q: "Where should an application's database password be stored?", o: ["In the Git repository", "In a config file on the VM", "In a vault, accessed with a managed identity", "In the app's README"], a: 2, why: "Vaults centralise, audit and rotate secrets; managed identities remove stored credentials." },
  { q: "'Assume breach' is a principle of which security model?", o: ["Zero Trust", "Perimeter-only", "Security through obscurity", "Open access"], a: 0, why: "Zero Trust: verify explicitly, use least privilege, and assume breach." },
];

export const FREE = [
  { name: "Microsoft Learn", url: "https://learn.microsoft.com/training/", text: "Thousands of free, hands-on cloud & security modules — plus free sandboxes that need no credit card.", tag: "100% free" },
  { name: "Azure for Students", url: "https://azure.microsoft.com/free/students", text: "$100 credit and free services for verified students, without a credit card.", tag: "Students" },
  { name: "Azure Free Account", url: "https://azure.microsoft.com/free", text: "12 months of popular services free and 55+ always-free services.", tag: "Card required" },
  { name: "GitHub Codespaces", url: "https://github.com/features/codespaces", text: "Free monthly hours of cloud dev environments for your repos.", tag: "Free tier" },
  { name: "AZ-900 / SC-900 study guides", url: "https://learn.microsoft.com/credentials/certifications/azure-fundamentals/", text: "Free official study guides for the Azure Fundamentals and Security Fundamentals exams.", tag: "Certification" },
  { name: "TryHackMe / HackTheBox", url: "https://tryhackme.com", text: "Gamified cybersecurity labs with free beginner rooms.", tag: "Security labs" },
];

export const CONCEPT_CARDS = [
  { t: "Confidentiality", d: "Only authorised people can read the data — encryption, access control." , c: "from-sky-500 to-blue-600"},
  { t: "Integrity", d: "Data can't be tampered with unnoticed — hashing, signing, immutable logs.", c: "from-emerald-500 to-teal-600" },
  { t: "Availability", d: "Systems stay up when needed — redundancy, backups, DDoS protection.", c: "from-violet-500 to-fuchsia-600" },
];

export const ZERO_TRUST = [
  { t: "Verify explicitly", d: "Always authenticate and authorise using every available signal: identity, device health, location, risk." },
  { t: "Use least privilege", d: "Give just-enough, just-in-time access. Limit blast radius with segmentation and role scoping." },
  { t: "Assume breach", d: "Design as if attackers are already inside. Encrypt everywhere, monitor continuously, automate response." },
];
