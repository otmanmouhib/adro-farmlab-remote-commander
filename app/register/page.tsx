'use client';

import { FormEvent, useState } from 'react';
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
      <div className="card" style={{ maxWidth: 520, margin: '2rem auto' }}>
        <div className="header">
          <div>
            <h1>Create an Account</h1>
            <p>Register for secure access to the IoT dashboard.</p>
          </div>
        </div>

        {success ? <div className="status-pill online">{success}</div> : null}
        {error ? <div className="alert">{error}</div> : null}

        <form onSubmit={handleSubmit} className="grid" style={{ gap: '1rem' }}>
          <label>
            Name
            <input
              className="input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Optional display name"
            />
          </label>

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
              minLength={8}
              autoComplete="new-password"
            />
          </label>

          <button className="button" type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Register'}
          </button>
        </form>
      </div>
    </main>
  );
}
