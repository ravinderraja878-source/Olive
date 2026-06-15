'use client';

import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import { db } from '@/lib/db';
import styles from './contact.module.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus('error');
      return;
    }

    setStatus('submitting');
    try {
      await db.addContactMessage({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || 'N/A',
        message: formData.message,
      });
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' }); // reset form
    } catch (err) {
      console.error('Submission failed:', err);
      setStatus('error');
    }
  };

  return (
    <section className={styles.contactSection}>
      <div className={styles.header}>
        <p className={styles.subtitle}>Get in Touch</p>
        <h1 className={styles.title}>Contact Us</h1>
      </div>

      <div className={styles.grid}>
        {/* Contact Info Sidebar */}
        <div className={styles.sidebar}>
          <div className={`${styles.infoCard} glass-card`}>
            <div className={styles.iconWrapper}>
              <MapPin size={24} />
            </div>
            <div className={styles.infoContent}>
              <h3>Church Location</h3>
              <p>
                Abids Chapel Road,<br />
                Near Olive Enclave, Hyderabad,<br />
                Telangana - 500001, India
              </p>
            </div>
          </div>

          <div className={`${styles.infoCard} glass-card`}>
            <div className={styles.iconWrapper}>
              <Phone size={24} />
            </div>
            <div className={styles.infoContent}>
              <h3>Phone Connection</h3>
              <p style={{ fontWeight: '600' }}>Direct Call (Owner):</p>
              <a href="tel:+919246887888" className={styles.link}>
                +91 92468 87888
              </a>
            </div>
          </div>

          <div className={`${styles.infoCard} glass-card`}>
            <div className={styles.iconWrapper}>
              <Mail size={24} />
            </div>
            <div className={styles.infoContent}>
              <h3>Email Queries</h3>
              <a href="mailto:info@oliveprayerhouse.org" className={styles.link}>
                info@oliveprayerhouse.org
              </a>
            </div>
          </div>

          <div className={`${styles.infoCard} glass-card`}>
            <div className={styles.iconWrapper}>
              <Clock size={24} />
            </div>
            <div className={styles.infoContent}>
              <h3>Gathering Hours</h3>
              <p>
                Office: Tue - Sat (09:00 AM - 05:00 PM)<br />
                Sunday Service: 09:30 AM onwards
              </p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className={`${styles.formCard} glass-card`}>
          <h2 className={styles.formTitle}>Send a Message</h2>
          <p className={styles.formSubtitle}>Have a prayer request or an inquiry? Write to us and we will get back to you.</p>

          {status === 'success' && (
            <div className={styles.successMessage}>
              Thank you! Your message has been received. We will pray for your requests.
            </div>
          )}

          {status === 'error' && (
            <div className={styles.errorMessage}>
              Please check your form details and try again. Ensure Name, Email, and Message are filled.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Full Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                className={styles.input}
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                required
                disabled={status === 'submitting'}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email Address *</label>
              <input
                type="email"
                id="email"
                name="email"
                className={styles.input}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={status === 'submitting'}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                className={styles.input}
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={handleChange}
                disabled={status === 'submitting'}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Prayer Request / Message *</label>
              <textarea
                id="message"
                name="message"
                className={styles.textarea}
                placeholder="Write your request or message here..."
                value={formData.message}
                onChange={handleChange}
                required
                disabled={status === 'submitting'}
              ></textarea>
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'center', marginTop: '10px' }}
              disabled={status === 'submitting'}
            >
              {status === 'submitting' ? 'Sending Message...' : 'Send Message'}
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* Map Section */}
      <div className={styles.mapSection}>
        <h2 className={styles.mapTitle}>Find Us in Hyderabad</h2>
        <div className={styles.mapWrapper}>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.411624536767!2d78.4746684!3d17.3920957!2m3!1f0!2f0!3f0!3m2!1i1024!2i766!4f13.1!3m3!1m2!1s0x3bcb975881eb5607%3A0xe54325bbff74069c!2sChapel%20Rd%2C%20Abids%2C%20Hyderabad%2C%20Telangana%20500001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={true}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Olive Prayer House Detailed Google Maps Location"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
