'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Calendar, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { db, WeeklyProgram } from '@/lib/db';
import styles from './page.module.css';

export default function Home() {
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPrograms() {
      try {
        const data = await db.getWeeklyPrograms();
        setPrograms(data);
      } catch (err) {
        console.error('Failed to load programs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrograms();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroSubtitle}>Welcome to</p>
          <h1 className={styles.heroTitle}>Olive Prayer House</h1>
          <p className={styles.heroDescription}>
            A vibrant, loving community dedicated to prayer, worship, and growth. We invite you to experience the presence of God and find hope, peace, and fellowship.
          </p>
          <div className={styles.heroActions}>
            <a href="#weekly-programs" className="btn-gold">
              Weekly Programs
            </a>
            <Link href="/contact" className="btn-outline">
              Join Us
            </Link>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section className={styles.welcomeSection}>
        <div className={styles.welcomeGrid}>
          <div className={styles.welcomeText}>
            <div className={styles.sectionHeader} style={{ textAlign: 'left', marginBottom: '30px' }}>
              <p className={styles.subtitle}>Who We Are</p>
              <h2 className={styles.title}>Rooted in Love, Growing in Faith</h2>
            </div>
            <div className={styles.verseCard}>
              &ldquo;For My house shall be called a house of prayer for all nations.&rdquo;
              <span style={{ display: 'block', fontSize: '0.9rem', marginTop: '8px', fontWeight: 'bold' }}>
                &mdash; Isaiah 56:7
              </span>
            </div>
            <p className={styles.welcomeDesc}>
              At Olive Prayer House, we believe in the transforming power of prayer and the unconditional love of Jesus Christ. Our mission is to build a warm sanctuary where people from all walks of life can gather to seek God, study His Word, and experience spiritual renewal.
            </p>
            <p className={styles.welcomeDesc}>
              Whether you are searching for answers, need prayer, or are looking for a church family to call home, our doors and hearts are open to you.
            </p>
          </div>
          <div className={styles.welcomeImage}>
            <Image
              src="https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&w=800&q=80"
              alt="Holy Bible and Cross"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 992px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Direct Call Banner */}
      <section className={styles.callBanner}>
        <div className={styles.callBannerContent}>
          <h2 className={styles.callBannerTitle}>Need Prayer or Have Questions? Call Us Directly</h2>
          <a href="tel:+919246887888" className={styles.callBannerPhone}>
            <Phone size={36} fill="currentColor" />
            <span>+91 92468 87888</span>
          </a>
          <p className={styles.callBannerSub}>Clicking the number or phone icon will immediately initiate a call to the church owner.</p>
        </div>
      </section>

      {/* Weekly Programs Section */}
      <section id="weekly-programs" className={styles.programsSection}>
        <div className={styles.programsContainer}>
          <div className={styles.sectionHeader}>
            <p className={styles.subtitle}>Join Our Fellowships</p>
            <h2 className={styles.title}>Weekly Programs</h2>
          </div>

          <div className={styles.programsGrid}>
            {loading ? (
              <div className={styles.noPrograms}>Loading programs...</div>
            ) : programs.length > 0 ? (
              programs.map((program) => (
                <div key={program.id} className={`${styles.programCard} glass-card`}>
                  <div className={styles.programTimeInfo}>
                    <Calendar size={18} />
                    <span>{program.day}</span>
                    <span style={{ color: 'var(--text-muted)' }}>|</span>
                    <Clock size={18} />
                    <span>{program.time}</span>
                  </div>
                  <h3 className={styles.programTitle}>{program.title}</h3>
                  {program.description && <p className={styles.programDesc}>{program.description}</p>}
                </div>
              ))
            ) : (
              <div className={styles.noPrograms}>
                No weekly programs scheduled at the moment. Please check back soon!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Gallery Teaser Section */}
      <section className={styles.galleryTeaser}>
        <div className={styles.sectionHeader}>
          <p className={styles.subtitle}>Moments of Fellowship</p>
          <h2 className={styles.title}>Life at Olive Prayer House</h2>
        </div>

        <div className={styles.teaserGrid}>
          <div className={styles.teaserImg}>
            <Image
              src="https://images.unsplash.com/photo-1548625361-155deee223cb?auto=format&fit=crop&w=400&q=80"
              alt="Sanctuary"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className={styles.teaserOverlay}>Sanctuary</div>
          </div>
          <div className={styles.teaserImg}>
            <Image
              src="https://images.unsplash.com/photo-1438232992991-995b7058bbb3?auto=format&fit=crop&w=400&q=80"
              alt="Prayer"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className={styles.teaserOverlay}>Prayer</div>
          </div>
          <div className={styles.teaserImg}>
            <Image
              src="https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=400&q=80"
              alt="Fellowship"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className={styles.teaserOverlay}>Fellowship</div>
          </div>
          <div className={styles.teaserImg}>
            <Image
              src="https://images.unsplash.com/photo-1445445290350-18a3b86e0b5b?auto=format&fit=crop&w=400&q=80"
              alt="Holy Bible"
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
            <div className={styles.teaserOverlay}>Scripture</div>
          </div>
        </div>

        <Link href="/gallery" className="btn-gold" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
          Explore Full Gallery <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  );
}
