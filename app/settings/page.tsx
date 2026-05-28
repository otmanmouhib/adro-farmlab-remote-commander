import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={session.user} title="Settings">
      <main className="container page-section">
        <section className="page-header">
          <span className="eyebrow">Settings</span>
          <h1>Account and preferences</h1>
          <p>Review your account details and session preferences for the Remote Commander dashboard.</p>
        </section>

        <div className="grid responsive-grid">
          <div className="card summary-card">
            <h2>Account</h2>
            <p className="meta-text">Your signed-in account details.</p>
            <ul className="info-list">
              <li>
                <strong>Email</strong>
                <div>{session.user.email ?? 'Not provided'}</div>
              </li>
              <li>
                <strong>Name</strong>
                <div>{session.user.name ?? 'Operator'}</div>
              </li>
            </ul>
          </div>

          <div className="card summary-card">
            <h2>Dashboard preferences</h2>
            <p className="meta-text">Current interface and workflow settings are managed here.</p>
            <ul className="info-list">
              <li>Sidebar navigation is always visible on desktop.</li>
              <li>Contact and report submissions are saved to your support queue.</li>
              <li>Sign out from the sidebar when you finish working.</li>
            </ul>
          </div>
        </div>
      </main>
    </DashboardShell>
  );
}
