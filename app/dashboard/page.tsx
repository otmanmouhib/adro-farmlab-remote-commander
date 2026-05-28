import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={session.user!} title="Overview">
      <div className="container page-section">
        <section className="hero">
          <div>
            <span className="eyebrow">Dashboard overview</span>
            <h1>Command center for your farm network</h1>
            <p>Review live station summaries, alerts, and system health in one clean enterprise dashboard.</p>
            <div className="hero-actions">
              <Link href="/dashboard/stations" className="button">
                View stations
              </Link>
              <Link href="/contact" className="button secondary">
                Contact support
              </Link>
            </div>
          </div>
        </section>

        <section className="feature-grid">
          <div className="card feature-card">
            <h3>Overview at a glance</h3>
            <p>Quickly see overall status, active devices, and recent activity without digging through raw logs.</p>
          </div>
          <div className="card feature-card">
            <h3>Professional operations</h3>
            <p>Built for field teams and managers who need a simple, elegant view of farm infrastructure.</p>
          </div>
          <div className="card feature-card">
            <h3>Fast support paths</h3>
            <p>Contact support or report issues directly from the sidebar at any time.</p>
          </div>
        </section>
      </div>
    </DashboardShell>
  );
}
