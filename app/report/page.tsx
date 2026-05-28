import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';

export default async function ReportPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={session.user} title="Report">
      <main className="container page-section">
        <section className="hero">
          <div>
            <span className="eyebrow">Report issue</span>
            <h1>Something not working?</h1>
            <p>Tell us about the problem and we’ll investigate it for you.</p>
          </div>
        </section>

        <div className="card centered-card">
          <h2>Report an issue</h2>
          <p className="meta-text">Use this form to share a bug, broken device, or connection issue.</p>

          <div className="form-grid">
            <label className="form-label">
              <span>Your name</span>
              <input className="input" type="text" placeholder="Your name" />
            </label>

            <label className="form-label">
              <span>Email</span>
              <input className="input" type="email" placeholder="you@example.com" />
            </label>

            <label className="form-label">
              <span>Station or device</span>
              <input className="input" type="text" placeholder="e.g. sensorstation01" />
            </label>

            <label className="form-label">
              <span>Issue description</span>
              <textarea className="textarea" rows={6} placeholder="Describe what happened" />
            </label>

            <button className="button">Send report</button>
          </div>

          <p className="meta-text form-footer">
            Need assistance? <Link className="link-primary" href="/contact">Contact us</Link> directly.
          </p>
        </div>
      </main>
    </DashboardShell>
  );
}
