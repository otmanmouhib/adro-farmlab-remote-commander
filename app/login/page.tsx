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
      <div className="card" style={{ maxWidth: 520, margin: '2rem auto' }}>
        <div className="header">
          <div>
            <h1>Remote Commander Login</h1>
            <p>Secure access to the FarmLab dashboard.</p>
          </div>
        </div>

        {error ? <div className="alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <label>
            Email
            <input
              className="input"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
            />
          </label>

          <label>
            Password
            <input
              className="input"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="current-password"
            />
          </label>

          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p style={{ marginTop: '1.5rem', color: '#cbd5e1' }}>
          Need an account? <Link href="/register">Register here</Link>.
        </p>
      </div>
    </main>
  );
}
