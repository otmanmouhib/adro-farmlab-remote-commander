'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body?.error || 'Unable to create account.');
      return;
    }

    setSuccess('Account created. You can now sign in.');
    setName('');
    setEmail('');
    setPassword('');

    setTimeout(() => router.push('/login'), 1200);
  };

  return (
    <main className="container">
      <section className="hero">
        <div className="eyebrow">Adro FarmLab</div>
        <div>
          <h1>Create your account</h1>
          <p>Set up secure access to the FarmLab dashboard with a simple registration flow.</p>
        </div>
      </section>

      <div className="card centered-card">
        {success ? <div className="status-pill online">{success}</div> : null}
        {error ? <div className="alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="form-grid" aria-label="Registration form">
          <label className="form-label">
            <span>Name</span>
            <input
              className="input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional display name"
            />
          </label>

          <label className="form-label">
            <span>Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label className="form-label">
            <span>Password</span>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
            />
          </label>

          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Register'}
          </button>
        </form>

        <p className="meta-text form-footer">
          Already have an account? <Link className="link-primary" href="/login">Sign in</Link>.
        </p>
      </div>
    </main>
  );
}
