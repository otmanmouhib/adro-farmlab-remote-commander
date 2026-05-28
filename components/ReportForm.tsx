'use client';

import { FormEvent, useState } from 'react';

type ReportFormProps = {
  initialEmail?: string;
};

export default function ReportForm({ initialEmail = '' }: ReportFormProps) {
  const [email, setEmail] = useState(initialEmail);
  const [station, setStation] = useState('');
  const [issue, setIssue] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const response = await fetch('/api/support/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, station, issue }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body?.error || 'Unable to submit report.');
      return;
    }

    setSuccess('Issue report submitted. Our team will follow up shortly.');
    setStation('');
    setIssue('');
  };

  return (
    <div className="card centered-card">
      {success ? <div className="status-pill online">{success}</div> : null}
      {error ? <div className="alert">{error}</div> : null}

      <form onSubmit={handleSubmit} className="form-grid" aria-label="Report issue form">
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
          <span>Station or device</span>
          <input
            className="input"
            type="text"
            value={station}
            onChange={(event) => setStation(event.target.value)}
            placeholder="e.g. sensorstation01"
          />
        </label>

        <label className="form-label">
          <span>Issue description</span>
          <textarea
            className="textarea"
            rows={6}
            value={issue}
            onChange={(event) => setIssue(event.target.value)}
            required
            placeholder="Describe what happened"
          />
        </label>

        <button className="button" type="submit" disabled={isLoading}>
          {isLoading ? 'Submitting…' : 'Send report'}
        </button>
      </form>
    </div>
  );
}
