import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { SignOutButton } from "@/components/AuthButtons";
import { RowMenu } from "@/components/RowMenu";
import { authOptions } from "@/lib/auth";

const stats = [
  { label: "Directories", value: "8" },
  { label: "Products", value: "3" },
  { label: "Submissions", value: "24" },
  { label: "Traffic", value: "14.2K", delta: "+18%", neg: false },
];

const directories = [
  { name: "Product Hunt", count: 8, live: 5, pending: 2, rejected: 1 },
  { name: "TechCrunch", count: 4, live: 2, pending: 1, rejected: 1 },
  { name: "Hacker News", count: 6, live: 4, pending: 2, rejected: 0 },
  { name: "Indie Hackers", count: 3, live: 2, pending: 1, rejected: 0 },
  { name: "BetaList", count: 3, live: 1, pending: 1, rejected: 1 },
];

const products = ["Zeduchat", "Telex"];

const submissions = [
  { id: "SUB-024", product: "Zeduchat", directory: "Product Hunt",  status: "live",     date: "Oct 12", traffic: "4.2K" },
  { id: "SUB-023", product: "Telex",    directory: "TechCrunch",   status: "pending",  date: "Oct 10", traffic: null },
  { id: "SUB-022", product: "Zeduchat", directory: "Hacker News",  status: "live",     date: "Oct 8",  traffic: "2.8K" },
  { id: "SUB-021", product: "Telex",    directory: "Product Hunt", status: "live",     date: "Oct 5",  traffic: "3.1K" },
  { id: "SUB-020", product: "Zeduchat", directory: "Indie Hackers",status: "live",     date: "Oct 3",  traffic: "1.4K" },
  { id: "SUB-019", product: "Telex",    directory: "Hacker News",  status: "live",     date: "Sep 28", traffic: "2.1K" },
  { id: "SUB-018", product: "Zeduchat", directory: "BetaList",     status: "rejected", date: "Sep 25", traffic: null },
  { id: "SUB-017", product: "Telex",    directory: "Indie Hackers",status: "pending",  date: "Sep 20", traffic: null },
];

const statusLabel: Record<string, string> = {
  live: "Live",
  pending: "Pending",
  review: "In review",
  rejected: "Rejected",
};

function IconGrid() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="1" y="1" width="5" height="5" rx="1.5" />
      <rect x="8" y="1" width="5" height="5" rx="1.5" />
      <rect x="1" y="8" width="5" height="5" rx="1.5" />
      <rect x="8" y="8" width="5" height="5" rx="1.5" />
    </svg>
  );
}

function IconList() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="1" y1="3.5" x2="13" y2="3.5" />
      <line x1="1" y1="7" x2="13" y2="7" />
      <line x1="1" y1="10.5" x2="13" y2="10.5" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M1 4a1 1 0 0 1 1-1h3l1.5 2H12a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4z" />
    </svg>
  );
}

function IconBox() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden="true">
      <path d="M1.5 3.5 7 1.5l5.5 2v7L7 12.5l-5.5-2v-7z" />
      <line x1="7" y1="1.5" x2="7" y2="12.5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <line x1="6" y1="1" x2="6" y2="11" />
      <line x1="1" y1="6" x2="11" y2="6" />
    </svg>
  );
}

function IconFilter() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="1" y1="3" x2="12" y2="3" />
      <line x1="3" y1="6.5" x2="10" y2="6.5" />
      <line x1="5" y1="10" x2="8" y2="10" />
    </svg>
  );
}


export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/");

  return (
    <main className="dash-page">

      {/* ── SIDEBAR ── */}
      <aside className="dash-sidebar">
        <div className="dash-sidebar-logo">
          <a className="wordmark" href="/dashboard">
            <span className="wordmark-mark" aria-hidden="true">
              <i /><i /><i />
            </span>
            Metric Tracker
          </a>
        </div>

        <nav aria-label="Main navigation">
          <a className="dash-nav-link" aria-current="page" href="/dashboard">
            <IconGrid />
            <span className="dash-nav-link-text">Overview</span>
          </a>
          <a className="dash-nav-link" href="/dashboard/submissions">
            <IconList />
            <span className="dash-nav-link-text">Submissions</span>
          </a>
        </nav>

        <div className="dash-nav-section-label" aria-hidden="true">Directories</div>
        <nav aria-label="Directories">
          {directories.map((dir) => (
            <a className="dash-nav-link" href={`/dashboard/directories/${dir.name.toLowerCase().replace(/ /g, "-")}`} key={dir.name}>
              <IconFolder />
              <span className="dash-nav-link-text">{dir.name}</span>
              <span className="dash-nav-badge">{dir.count}</span>
            </a>
          ))}
          <button className="dash-nav-add" type="button">
            <IconPlus />
            Add directory
          </button>
        </nav>

        <div className="dash-nav-section-label" aria-hidden="true">Products</div>
        <nav aria-label="Products">
          {products.map((p) => (
            <a className="dash-nav-link" href={`/dashboard/products/${p.toLowerCase()}`} key={p}>
              <IconBox />
              <span className="dash-nav-link-text">{p}</span>
            </a>
          ))}
          <button className="dash-nav-add" type="button">
            <IconPlus />
            Add product
          </button>
        </nav>

        <div className="dash-account">
          <span className="dash-account-email" title={session.user.email ?? undefined}>
            {session.user.email}
          </span>
          <SignOutButton />
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className="dash-main">

        {/* HEADER */}
        <header className="dash-header">
          <div className="dash-header-left">
            <h1 className="dash-page-title">Submissions</h1>
            <span className="dash-page-label">Illustrative data · Oct 2026</span>
          </div>
          <div className="dash-header-actions">
            <button className="btn-ghost" type="button">
              <IconFilter />
              Filter
            </button>
            <button className="btn-primary" type="button">
              <IconPlus />
              New submission
            </button>
          </div>
        </header>

        {/* STATS STRIP */}
        <div className="dash-stats" role="region" aria-label="Key metrics">
          {stats.map((s) => (
            <div className="dash-stat" key={s.label}>
              <p className="dash-stat-label">{s.label}</p>
              <div className="dash-stat-row">
                <span className="dash-stat-value">{s.value}</span>
                {s.delta && (
                  <span className={`dash-stat-delta${s.neg ? " neg" : ""}`}>
                    {s.delta}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* BODY */}
        <div className="dash-body">

          {/* SUBMISSIONS TABLE */}
          <section className="dash-section" aria-label="Recent submissions">
            <div className="dash-section-header">
              <h2 className="dash-section-title">Recent submissions</h2>
              <span className="dash-section-meta">24 total</span>
            </div>
            <table className="sub-table">
              <thead>
                <tr>
                  <th scope="col">Product</th>
                  <th scope="col">Directory</th>
                  <th scope="col">Status</th>
                  <th scope="col">Submitted</th>
                  <th scope="col" className="col-r">Traffic</th>
                  <th scope="col" className="col-actions"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((sub) => (
                  <tr key={sub.id}>
                    <td className="td-product">{sub.product}</td>
                    <td className="td-dir">{sub.directory}</td>
                    <td>
                      <span className={`status-badge s-${sub.status}`}>
                        {statusLabel[sub.status]}
                      </span>
                    </td>
                    <td className="td-date">{sub.date}</td>
                    <td className={`td-traffic${!sub.traffic ? " td-traffic-em" : ""}`}>
                      {sub.traffic ?? "—"}
                    </td>
                    <td className="td-actions">
                      <RowMenu label={`More options for ${sub.product} on ${sub.directory}`} submission={{ id: sub.id, product: sub.product, directory: sub.directory, status: sub.status as "live" | "pending" | "review" | "rejected" }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          {/* DIRECTORIES PANEL */}
          <section className="dash-section" aria-label="Directory breakdown">
            <div className="dash-section-header">
              <h2 className="dash-section-title">By directory</h2>
              <span className="dash-section-meta">{directories.length} dirs</span>
            </div>
            <div className="dir-list">
              {directories.map((dir) => (
                <div className="dir-row" key={dir.name}>
                  <span className="dir-row-name">{dir.name}</span>
                  <div className="dir-row-dots" aria-label={`${dir.live} live, ${dir.pending} pending, ${dir.rejected} rejected`}>
                    {Array.from({ length: dir.live }).map((_, i) => (
                      <span key={`l${i}`} className="d-dot d-live" />
                    ))}
                    {Array.from({ length: dir.pending }).map((_, i) => (
                      <span key={`p${i}`} className="d-dot d-pending" />
                    ))}
                    {Array.from({ length: dir.rejected }).map((_, i) => (
                      <span key={`r${i}`} className="d-dot d-rejected" />
                    ))}
                  </div>
                  <span className="dir-row-count">{dir.count}</span>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
