'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn } from 'lucide-react';
import { auth } from '@/lib/auth';
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const logged = await auth.isLoggedIn();
      if (logged) {
        router.push('/admin');
      } else {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const res = await auth.login(email, password);
      if (res.success) {
        router.push('/admin');
      } else {
        setError(res.error || 'Login failed.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('An error occurred during login. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAuth) {
    return (
      <section className={styles.loginSection}>
        <div style={{ color: 'var(--text-muted)' }}>Checking session details...</div>
      </section>
    );
  }

  return (
    <section className={styles.loginSection}>
      <div className={`${styles.loginCard} glass-card`}>
        <div className={styles.iconWrapper}>
          <Lock size={30} />
        </div>
        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>Olive Prayer House Dashboard Access</p>

        {error && <div className={styles.errorMessage}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className={styles.input}
              placeholder="admin@oliveprayerhouse.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              className={styles.input}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn-gold"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', marginTop: '10px' }}
            disabled={submitting}
          >
            {submitting ? 'Authenticating...' : 'Sign In'}
            <LogIn size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}
