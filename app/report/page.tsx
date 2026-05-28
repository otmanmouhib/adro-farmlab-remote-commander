import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ReportForm from '@/components/ReportForm';

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

        <ReportForm initialEmail={session.user.email ?? ''} />

        <p className="meta-text form-footer">
          Need assistance? <Link className="link-primary" href="/contact">Contact us</Link> directly.
        </p>
      </main>
    </DashboardShell>
  );
}
