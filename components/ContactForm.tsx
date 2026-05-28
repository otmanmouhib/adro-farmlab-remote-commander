'use client';

import { FormEvent, useState } from 'react';

type ContactFormProps = {
  initialEmail?: string;
};

export default function ContactForm({ initialEmail = '' }: ContactFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const response = await fetch('/api/support/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, message }),
    });

    setIsLoading(false);

    if (!response.ok) {
      const body = await response.json();
      setError(body?.error || 'Unable to send message.');
      return;
    }

    setSuccess('Your message has been received. We will respond shortly.');
    setName('');
    setMessage('');
  };

  return (
    <div className="card centered-card">
      {success ? <div className="status-pill online">{success}</div> : null}
      {error ? <div className="alert">{error}</div> : null}

      <form onSubmit={handleSubmit} className="form-grid" aria-label="Contact support form">
        <label className="form-label">
          <span>Name</span>
          <input
            className="input"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Your name"
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
          <span>Message</span>
          <textarea
            className="textarea"
            rows={6}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            required
            placeholder="Describe your question or issue"
          />
        </label>

        <button className="button" type="submit" disabled={isLoading}>
          {isLoading ? 'Sending…' : 'Send message'}
        </button>
      </form>
    </div>
  );
}
