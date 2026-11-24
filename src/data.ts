export type ResType =
  | "vm" | "storage" | "sql" | "webapp" | "keyvault"
  | "function" | "vnet" | "aks" | "cosmos";

export interface Sku { name: string; costHr: number; spec: string }
export interface ResDef {
  type: ResType;
  label: string;
  short: string;
  cat: string;
  icon: string;
  color: string;
  desc: string;
  skus: Sku[];
  prefix: string;
}

export const RES_DEFS: Record<ResType, ResDef> = {
  vm: {
    type: "vm", label: "Virtual Machine", short: "Virtual Machines", cat: "Compute", icon: "Server", color: "#0078d4", prefix: "vm",
    desc: "Provision Linux or Windows servers in seconds. Full control of the OS, networking and disks.",
    skus: [
      { name: "B1s", costHr: 0.0104, spec: "1 vCPU · 1 GiB RAM" },
      { name: "B2s", costHr: 0.0416, spec: "2 vCPU · 4 GiB RAM" },
      { name: "D2s v5", costHr: 0.096, spec: "2 vCPU · 8 GiB RAM" },
      { name: "D4s v5", costHr: 0.192, spec: "4 vCPU · 16 GiB RAM" },
    ],
  },
  storage: {
    type: "storage", label: "Storage Account", short: "Storage Accounts", cat: "Storage", icon: "HardDrive", color: "#00a4a6", prefix: "st",
    desc: "Durable, highly available object, file, queue and table storage with encryption at rest.",
    skus: [
      { name: "Standard LRS", costHr: 0.0007, spec: "Locally redundant" },
      { name: "Standard GRS", costHr: 0.0014, spec: "Geo redundant" },
      { name: "Premium LRS", costHr: 0.0032, spec: "SSD-backed" },
    ],
  },
  sql: {
    type: "sql", label: "SQL Database", short: "SQL Databases", cat: "Databases", icon: "Database", color: "#e8590c", prefix: "sql",
    desc: "Managed relational database with automatic backups, tuning and threat detection.",
    skus: [
      { name: "Basic", costHr: 0.0068, spec: "5 DTU · 2 GB" },
      { name: "Standard S1", costHr: 0.0201, spec: "20 DTU · 250 GB" },
      { name: "Premium P1", costHr: 0.625, spec: "125 DTU · 500 GB" },
    ],
  },
  webapp: {
    type: "webapp", label: "Web App", short: "Web Apps", cat: "Web", icon: "Globe", color: "#7a4dff", prefix: "app",
    desc: "Host websites and APIs without managing servers. Autoscale, custom domains and TLS included.",
    skus: [
      { name: "Free F1", costHr: 0, spec: "1 GB · shared CPU" },
      { name: "Basic B1", costHr: 0.018, spec: "1.75 GB · 1 core" },
      { name: "Premium P1v3", costHr: 0.15, spec: "8 GB · 2 cores" },
    ],
  },
  keyvault: {
    type: "keyvault", label: "Key Vault", short: "Key Vaults", cat: "Security", icon: "KeyRound", color: "#d29200", prefix: "kv",
    desc: "Safeguard secrets, keys and certificates in FIPS 140-validated hardware security modules.",
    skus: [
      { name: "Standard", costHr: 0.0003, spec: "Software-protected keys" },
      { name: "Premium (HSM)", costHr: 0.0013, spec: "HSM-protected keys" },
    ],
  },
  function: {
    type: "function", label: "Function App", short: "Function Apps", cat: "Compute", icon: "Zap", color: "#f7b500", prefix: "func",
    desc: "Event-driven serverless code. Pay only for the milliseconds your code actually runs.",
    skus: [
      { name: "Consumption", costHr: 0, spec: "Pay per execution" },
      { name: "Premium EP1", costHr: 0.173, spec: "Pre-warmed instances" },
    ],
  },
  vnet: {
    type: "vnet", label: "Virtual Network", short: "Virtual Networks", cat: "Networking", icon: "Network", color: "#2bb0ed", prefix: "vnet",
    desc: "Your private network in the cloud. Subnets, routing, peering and network security groups.",
    skus: [{ name: "Standard", costHr: 0, spec: "Free · pay for peering" }],
  },
  aks: {
    type: "aks", label: "Kubernetes Cluster", short: "Kubernetes", cat: "Containers", icon: "Boxes", color: "#3a5bd9", prefix: "aks",
    desc: "Managed Kubernetes with built-in CI/CD, monitoring and secure container supply chain.",
    skus: [
      { name: "Free tier · 2 nodes", costHr: 0.083, spec: "2 × B2s nodes" },
      { name: "Standard · 3 nodes", costHr: 0.219, spec: "3 × D2s nodes + SLA" },
    ],
  },
  cosmos: {
    type: "cosmos", label: "Cosmos DB", short: "Cosmos DB", cat: "Databases", icon: "Orbit", color: "#1f8f5f", prefix: "cosmos",
    desc: "Globally distributed NoSQL database with single-digit-millisecond latency.",
    skus: [
      { name: "Serverless", costHr: 0.004, spec: "Pay per request" },
      { name: "Provisioned 400 RU/s", costHr: 0.008, spec: "Autoscale ready" },
    ],
  },
};

export const REGIONS = [
  "Central India", "South India", "East US", "West Europe", "UK South",
  "Southeast Asia", "Japan East", "Australia East", "Canada Central",
];

export interface ExtraService { name: string; cat: string; icon: string; desc: string; secure?: boolean }
export const EXTRA_SERVICES: ExtraService[] = [
  { name: "Entra ID", cat: "Identity", icon: "Fingerprint", desc: "Cloud identity & access management with SSO and MFA.", secure: true },
  { name: "Defender for Cloud", cat: "Security", icon: "ShieldCheck", desc: "Posture management and threat protection.", secure: true },
  { name: "Sentinel", cat: "Security", icon: "Radar", desc: "Cloud-native SIEM and SOAR.", secure: true },
  { name: "Azure Firewall", cat: "Networking", icon: "Flame", desc: "Managed, stateful network firewall.", secure: true },
  { name: "DDoS Protection", cat: "Networking", icon: "ShieldAlert", desc: "Always-on mitigation of volumetric attacks.", secure: true },
  { name: "Application Gateway + WAF", cat: "Networking", icon: "Layers", desc: "L7 load balancer with web application firewall.", secure: true },
  { name: "Load Balancer", cat: "Networking", icon: "Share2", desc: "Distribute traffic across healthy instances." },
  { name: "Monitor", cat: "Management", icon: "Activity", desc: "Metrics, logs and alerts for everything you run." },
  { name: "Cost Management", cat: "Management", icon: "DollarSign", desc: "Track and optimise cloud spend." },
  { name: "Policy", cat: "Management", icon: "FileCheck", desc: "Enforce organisational standards at scale.", secure: true },
  { name: "Container Registry", cat: "Containers", icon: "Container", desc: "Private registry for container images." },
  { name: "DevOps", cat: "DevOps", icon: "GitBranch", desc: "Repos, pipelines and boards in one place." },
  { name: "AI Studio", cat: "AI + ML", icon: "Brain", desc: "Build, train and deploy intelligent apps." },
  { name: "Service Bus", cat: "Integration", icon: "MessageSquare", desc: "Reliable enterprise messaging." },
  { name: "Backup", cat: "Management", icon: "Archive", desc: "Protect data from loss and ransomware.", secure: true },
  { name: "Bastion", cat: "Networking", icon: "Lock", desc: "Secure RDP/SSH without public IPs.", secure: true },
];

/* ---------- Security recommendations ---------- */
export interface Rec {
  id: string;
  title: string;
  desc: string;
  severity: "High" | "Medium" | "Low";
  weight: number;
  tab: string;
  mitre?: string;
}
export const RECS: Rec[] = [
  { id: "mfa", title: "Enable multi-factor authentication for all users", desc: "Accounts without MFA are the #1 entry point for attackers. MFA blocks 99% of automated credential attacks.", severity: "High", weight: 10, tab: "identity", mitre: "T1078 Valid Accounts" },
  { id: "mgmt-ports", title: "Close management ports (SSH 22 / RDP 3389) to the Internet", desc: "Exposed management ports are constantly scanned and brute-forced. Restrict to a VNet or use Bastion.", severity: "High", weight: 10, tab: "network", mitre: "T1021 Remote Services" },
  { id: "defender-servers", title: "Enable Defender for Servers", desc: "Adds endpoint detection & response, vulnerability assessment and adaptive hardening for VMs.", severity: "High", weight: 8, tab: "defender", mitre: "T1059 Command Execution" },
  { id: "ca-admin", title: "Require MFA for administrators via Conditional Access", desc: "Privileged roles must always prove identity with a second factor — on every sign-in.", severity: "High", weight: 8, tab: "identity", mitre: "T1098 Account Manipulation" },
  { id: "jit", title: "Turn on just-in-time (JIT) VM access", desc: "Ports stay closed until an approved request opens them for a limited time window.", severity: "High", weight: 8, tab: "overview" },
  { id: "waf", title: "Enable Web Application Firewall", desc: "Blocks OWASP Top 10 attacks such as SQL injection and cross-site scripting.", severity: "Medium", weight: 6, tab: "network", mitre: "T1190 Exploit Public App" },
  { id: "https-only", title: "Enforce HTTPS-only on web apps", desc: "Redirects all HTTP traffic to HTTPS and enforces TLS 1.2+.", severity: "Medium", weight: 6, tab: "overview" },
  { id: "patch", title: "Apply system updates to virtual machines", desc: "Unpatched OS vulnerabilities are exploited within hours of disclosure.", severity: "Medium", weight: 6, tab: "overview", mitre: "T1203 Exploitation" },
  { id: "ddos", title: "Enable DDoS Protection on virtual networks", desc: "Adaptive tuning and always-on traffic monitoring to absorb volumetric attacks.", severity: "Medium", weight: 5, tab: "network", mitre: "T1498 Network DoS" },
  { id: "kv-purge", title: "Enable purge protection on Key Vaults", desc: "Prevents permanent deletion of keys and secrets during the retention window.", severity: "Medium", weight: 5, tab: "keyvault" },
  { id: "backup", title: "Enable backup for virtual machines", desc: "Immutable backups are your best defence against ransomware.", severity: "Medium", weight: 4, tab: "overview", mitre: "T1486 Data Encrypted for Impact" },
  { id: "encrypt-cmk", title: "Use customer-managed keys for storage encryption", desc: "Bring your own key from Key Vault for full control of data-at-rest encryption.", severity: "Low", weight: 4, tab: "keyvault" },
  { id: "diag", title: "Enable diagnostic logs on all resources", desc: "Logs feed Sentinel so incidents can be detected and investigated.", severity: "Low", weight: 4, tab: "overview" },
];

export const DEFENDER_PLANS = [
  { id: "servers", name: "Defender for Servers", icon: "Server", price: 15, desc: "EDR, vulnerability scanning, JIT access, file integrity monitoring." },
  { id: "appservice", name: "Defender for App Service", icon: "Globe", price: 15, desc: "Detects attacks targeting web apps, dangling DNS and webshells." },
  { id: "storage", name: "Defender for Storage", icon: "HardDrive", price: 10, desc: "Malware scanning and sensitive-data threat detection on blobs." },
  { id: "sql", name: "Defender for SQL", icon: "Database", price: 15, desc: "Finds vulnerabilities, detects SQL injection & anomalous access." },
  { id: "keyvault", name: "Defender for Key Vault", icon: "KeyRound", price: 2, desc: "Alerts on unusual and potentially harmful vault access." },
  { id: "containers", name: "Defender for Containers", icon: "Boxes", price: 7, desc: "Image scanning, runtime protection and Kubernetes hardening." },
  { id: "dns", name: "Defender for DNS", icon: "Network", price: 1, desc: "Detects data exfiltration and communication with malicious domains." },
  { id: "arm", name: "Defender for Resource Manager", icon: "Settings", price: 5, desc: "Monitors management operations for suspicious activity." },
  { id: "apis", name: "Defender for APIs", icon: "Share2", price: 5, desc: "Discovers unprotected APIs and detects abuse in real time." },
];

export const POLICIES = [
  { id: "admin-mfa", name: "Require MFA for administrators", desc: "Applies to all directory roles including Global Administrator." },
  { id: "block-legacy", name: "Block legacy authentication", desc: "Legacy protocols (POP, IMAP, SMTP) cannot enforce MFA." },
  { id: "risky-signin", name: "Block high-risk sign-ins", desc: "Uses ML risk signals: anonymous IPs, leaked credentials, atypical travel." },
  { id: "compliant-device", name: "Require compliant device", desc: "Only managed, patched and encrypted devices can access apps." },
  { id: "geo", name: "Block sign-ins from untrusted countries", desc: "Named-location based geo-fencing of access." },
];

export const FRAMEWORKS = [
  { name: "ISO 27001:2022", base: 18, controls: 93 },
  { name: "SOC 2 Type II", base: 22, controls: 64 },
  { name: "NIST SP 800-53 r5", base: 12, controls: 110 },
  { name: "PCI DSS v4.0", base: 8, controls: 78 },
  { name: "CIS Benchmark 2.0", base: 20, controls: 52 },
  { name: "GDPR", base: 25, controls: 40 },
];

export const THREAT_TYPES = [
  { name: "SSH brute-force attempt", sev: "High", mitre: "T1110 Brute Force", port: "22" },
  { name: "RDP password spray", sev: "High", mitre: "T1110.003 Password Spraying", port: "3389" },
  { name: "SQL injection probe", sev: "High", mitre: "T1190 Exploit Public-Facing App", port: "443" },
  { name: "Port scan detected", sev: "Low", mitre: "T1046 Network Service Discovery", port: "*" },
  { name: "Impossible travel sign-in", sev: "Medium", mitre: "T1078 Valid Accounts", port: "443" },
  { name: "Malware C2 beacon", sev: "High", mitre: "T1071 Application Layer Protocol", port: "8080" },
  { name: "Credential stuffing", sev: "Medium", mitre: "T1110.004 Credential Stuffing", port: "443" },
  { name: "Volumetric DDoS (UDP flood)", sev: "High", mitre: "T1498 Network DoS", port: "*" },
  { name: "Suspicious PowerShell", sev: "Medium", mitre: "T1059.001 PowerShell", port: "5985" },
] as const;

export const COUNTRIES = ["Russia", "China", "Brazil", "Iran", "Vietnam", "Romania", "Nigeria", "North Korea", "Unknown (Tor)", "Ukraine"];
