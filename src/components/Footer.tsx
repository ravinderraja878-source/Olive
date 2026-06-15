'use client';

import React from 'react';
import Link from 'next/link';
import { Leaf, MapPin, Phone, Mail, Clock } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        {/* Brand Column */}
        <div className={styles.brandCol}>
          <div className={styles.logoArea}>
            <Leaf size={32} fill="currentColor" />
            <span className={styles.logoText}>Olive Prayer House</span>
          </div>
          <p className={styles.description}>
            A house of prayer for all nations. Committed to preaching the Gospel of Jesus Christ, building fellowship, and nurturing faith in our community.
          </p>
        </div>

        {/* Contact Info Column */}
        <div className={styles.infoCol}>
          <h3>Contact Info</h3>
          <ul className={styles.contactList}>
            <li className={styles.contactItem}>
              <MapPin size={20} />
              <span>
                Abids Chapel Road,<br />
                Near Olive Enclave, Hyderabad,<br />
                Telangana - 500001, India
              </span>
            </li>
            <li className={styles.contactItem}>
              <Phone size={20} />
              <a href="tel:+919246887888" className={styles.link}>
                +91 92468 87888
              </a>
            </li>
            <li className={styles.contactItem}>
              <Mail size={20} />
              <a href="mailto:info@oliveprayerhouse.org" className={styles.link}>
                info@oliveprayerhouse.org
              </a>
            </li>
            <li className={styles.contactItem}>
              <Clock size={20} />
              <span>
                Office Hours: Tue - Sat<br />
                09:00 AM - 05:00 PM
              </span>
            </li>
          </ul>
        </div>

        {/* Map Column */}
        <div className={styles.mapCol}>
          <h3>Our Location</h3>
          <div className={styles.mapFrame}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.411624536767!2d78.4746684!3d17.3920957!2m3!1f0!2f0!3f0!3m2!1i1024!2i766!4f13.1!3m3!1m2!1s0x3bcb975881eb5607%3A0xe54325bbff74069c!2sChapel%20Rd%2C%20Abids%2C%20Hyderabad%2C%20Telangana%20500001!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Olive Prayer House Google Maps Location"
            ></iframe>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className={styles.bottomBar}>
        <p>&copy; {currentYear} Olive Prayer House. All rights reserved.</p>
        <nav className={styles.footerNav}>
          <Link href="/" className={styles.link}>Home</Link>
          <Link href="/gallery" className={styles.link}>Gallery</Link>
          <Link href="/contact" className={styles.link}>Contact</Link>
          <Link href="/admin" className={styles.link}>Admin Panel</Link>
        </nav>
      </div>
    </footer>
  );
}
