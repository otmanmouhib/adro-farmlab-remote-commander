import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';

export default async function ContactPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={session.user} title="Contact">
      <main className="container page-content">
        <section className="page-header">
          <span className="eyebrow">Contact Us</span>
          <h1>Need help with a device or connection?</h1>
          <p>Send us a message and the support team will get back to you quickly.</p>
        </section>

        <div className="card centered-card">
          <h2>Contact support</h2>
          <p className="meta-text">Send a message and our team will get back to you as soon as possible.</p>

          <div className="form-grid">
            <label className="form-label">
              <span>Name</span>
              <input className="input" type="text" placeholder="Your name" />
            </label>

            <label className="form-label">
              <span>Email</span>
              <input className="input" type="email" placeholder="you@example.com" />
            </label>

            <label className="form-label">
              <span>Message</span>
              <textarea className="textarea" rows={6} placeholder="Describe your issue or question" />
            </label>

            <button className="button">Send message</button>
          </div>

          <p className="meta-text form-footer">
            Prefer a quick link? <Link className="link-primary" href="/report">Report an issue</Link> instead.
          </p>
        </div>

        <div className="support-info">
          <h2>Other ways to reach us</h2>
          <p>Email: <a className="link-primary" href="mailto:support@adrofarmlab.com">support@adrofarmlab.com</a></p>
          <p>Phone: +1 (555) 123-4567</p>
          <p>
            Prefer not to send a message? <Link className="link-primary" href="/report">Report an issue</Link> instead.
          </p>
        </div>
      </main>
    </DashboardShell>
  );
}
