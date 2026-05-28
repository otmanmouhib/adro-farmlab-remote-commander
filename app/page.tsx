import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="container landing-page">
      <section className="hero">
        <div>
          <span className="eyebrow">Adro FarmLab</span>
          <h1>Secure farm device controls for every team.</h1>
          <p>Manage sensors, pumps, and live telemetry with a clean, mobile-first dashboard built for operators and managers.</p>
          <div className="hero-actions">
            <Link href="/login" className="button">
              Get started
            </Link>
            <Link href="/register" className="button secondary">
              Create account
            </Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="card hero-card">
            <p className="eyebrow">Connected Stations</p>
            <h2>12 active devices</h2>
            <p className="meta-text">Live health, sensor analytics and remote control in one modern operations center.</p>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        <div className="card feature-card">
          <h3>Simple operations</h3>
          <p>Quickly check station health, view live readings, and open device details with a single tap.</p>
        </div>
        <div className="card feature-card">
          <h3>Modern dashboard</h3>
          <p>Classic sidebar layout with a mobile-friendly interface for field technicians and remote operators.</p>
        </div>
        <div className="card feature-card">
          <h3>Support built in</h3>
          <p>Contact support or report an issue directly from the dashboard.</p>
        </div>
      </section>

      <section className="page-section">
        <h2>Designed for teams</h2>
        <p>Operators, agronomists, and technicians can work from desktop or mobile without losing clarity.</p>
        <div className="page-links">
          <Link href="/dashboard" className="link-card">
            Dashboard overview
          </Link>
          <Link href="/contact" className="link-card">
            Contact support
          </Link>
          <Link href="/report" className="link-card">
            Report an issue
          </Link>
        </div>
      </section>
    </main>
  );
}
