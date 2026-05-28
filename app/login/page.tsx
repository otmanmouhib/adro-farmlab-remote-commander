'use client';

import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    setIsLoading(false);

    if (result?.error) {
      setError('Invalid credentials. Please check your email and password.');
      return;
    }

    router.push('/dashboard');
  };

  return (
    <main className="container">
      <section className="hero">
        <div className="eyebrow">Adro FarmLab</div>
        <div>
          <h1>Sign in to your farm dashboard</h1>
          <p>Simple, clear access to live device status, alerts, and remote controls.</p>
        </div>
      </section>

      <div className="card centered-card">
        {error ? <div className="alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="form-grid" aria-label="Login form">
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
              autoComplete="current-password"
              placeholder="Enter your password"
            />
          </label>

          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="meta-text form-footer">
          New here? <Link className="link-primary" href="/register">Create an account</Link>.
        </p>
      </div>
    </main>
  );
}
