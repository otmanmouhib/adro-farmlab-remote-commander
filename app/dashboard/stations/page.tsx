import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import DashboardClient from '@/components/DashboardClient';

export default async function StationsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <DashboardShell user={session.user!} title="Stations">
      <main className="container page-section">
        <section className="hero">
          <div>
            <span className="eyebrow">Stations</span>
            <h1>Connected station details</h1>
            <p>Browse active sensors and view each station’s status, values, and history.</p>
          </div>
        </section>

        <DashboardClient user={session.user!} />
      </main>
    </DashboardShell>
  );
}
