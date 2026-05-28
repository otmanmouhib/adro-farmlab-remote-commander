'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

type User = {
  name?: string | null;
  email?: string | null;
};

type DashboardShellProps = {
  user: User;
  title?: string;
  children: React.ReactNode;
};

const navItems = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/stations', label: 'Stations' },
  { href: '/settings', label: 'Settings' },
  { href: '/contact', label: 'Contact' },
  { href: '/report', label: 'Report' },
];

export default function DashboardShell({ user, title, children }: DashboardShellProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className={`dashboard-shell ${isOpen ? 'sidebar-open' : ''}`}>
      <aside className="dashboard-sidebar">
        <div className="sidebar-brand">
          <span className="eyebrow">Adro FarmLab</span>
          <h2>Commander</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <p className="sidebar-label">Signed in as</p>
          <p>{user.email ?? user.name ?? 'Operator'}</p>
          <button type="button" className="button secondary signout-button" onClick={() => signOut({ callbackUrl: '/login' })}>
            Sign out
          </button>
        </div>
      </aside>

      <div className="dashboard-main">
        <div className="dashboard-topbar">
          <button type="button" className="sidebar-toggle" onClick={() => setIsOpen((value) => !value)}>
            <span className="hamburger" />
            <span className="visually-hidden">Toggle menu</span>
          </button>
          <div className="topbar-title">
            <span className="topbar-label">Current section</span>
            <h1>{title ?? 'Dashboard'}</h1>
          </div>
        </div>

        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
}
