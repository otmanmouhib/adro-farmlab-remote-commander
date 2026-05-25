import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardClient from '@/components/DashboardClient';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  return (
    <main className="container">
      <div className="header">
        <div>
          <h1>FarmLab Remote Commander</h1>
          <p>Authenticated dashboard for MQTT-connected sensor and pump stations.</p>
        </div>
      </div>

      <DashboardClient user={session.user!} />
    </main>
  );
}
