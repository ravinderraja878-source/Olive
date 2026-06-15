'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, LogIn } from 'lucide-react';
import { auth } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
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

  const handleAutofillMock = () => {
    setEmail('admin@oliveprayerhouse.org');
    setPassword('adminpassword123');
    setError(null);
  };

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
        
        <div className={`${styles.statusBadge} ${isSupabaseConfigured ? styles.supabase : styles.demo}`}>
          <span className={styles.badgeDot}></span>
          {isSupabaseConfigured ? 'Supabase Auth Enabled' : 'Demo Offline Mode'}
        </div>

        <h1 className={styles.title}>Admin Login</h1>
        <p className={styles.subtitle}>Olive Prayer House Dashboard Access</p>

        {error && (
          <div style={{ marginBottom: '24px' }}>
            <div className={styles.errorMessage}>{error}</div>
            {isSupabaseConfigured && (error.toLowerCase().includes('credential') || error.toLowerCase().includes('invalid')) && (
              <div className={styles.tipMessage}>
                <strong>Database Setup Needed:</strong> Since Supabase is configured, you must register this admin user in your project first:
                <br /><br />
                1. Go to your <strong>Supabase Dashboard</strong>
                <br />
                2. Navigate to <strong>Authentication &gt; Users</strong>
                <br />
                3. Click <strong>Add user</strong> &gt; <strong>Create user</strong>
                <br />
                4. Set email to <code>admin@oliveprayerhouse.org</code> and password to <code>adminpassword123</code> (or use your custom email/password)
                <br />
                5. Make sure <strong>Auto-confirm user</strong> is checked and click <strong>Create</strong>.
              </div>
            )}
            {!isSupabaseConfigured && (
              <div className={styles.tipMessage}>
                <strong>Mock Fallback:</strong> Please make sure you are using the correct offline mock password: <code>adminpassword123</code>.
              </div>
            )}
          </div>
        )}

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

          {!isSupabaseConfigured && (
            <button
              type="button"
              onClick={handleAutofillMock}
              className={styles.demoButton}
              disabled={submitting}
            >
              Autofill Demo Credentials
            </button>
          )}
        </form>
      </div>
    </section>
  );
}

