import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import authOptions from '@/lib/auth';
import DashboardShell from '@/components/DashboardShell';
import ContactForm from '@/components/ContactForm';

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

        <ContactForm initialEmail={session.user.email ?? ''} />

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
