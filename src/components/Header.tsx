'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Leaf, Menu, X } from 'lucide-react';
import styles from './Header.module.css';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Check if link is active
  const isActive = (path: string) => {
    return pathname === path;
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ''}`}>
        <Link href="/" className={styles.logoContainer} onClick={closeMenu}>
          <span className={styles.logoIcon}>
            <Leaf size={28} fill="currentColor" />
          </span>
          <span className={styles.logoText}>Olive Prayer House</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navLink} ${isActive('/') ? styles.activeLink : ''}`}>
            Home
          </Link>
          <Link href="/gallery" className={`${styles.navLink} ${isActive('/gallery') ? styles.activeLink : ''}`}>
            Gallery
          </Link>
          <Link href="/contact" className={`${styles.navLink} ${isActive('/contact') ? styles.activeLink : ''}`}>
            Contact
          </Link>
          <Link href="/admin" className={`${styles.navLink} ${isActive('/admin') || isActive('/login') ? styles.activeLink : ''}`}>
            Admin Panel
          </Link>
        </nav>

        {/* Hamburger Menu Icon */}
        <button 
          className={styles.hamburger} 
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle Menu"
        >
          <Menu size={28} />
        </button>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={`${styles.overlay} ${mobileOpen ? styles.overlayVisible : ''}`} onClick={closeMenu}></div>
      <div className={`${styles.mobileMenu} ${mobileOpen ? styles.mobileMenuOpen : ''}`}>
        <button className={styles.mobileMenuCloseBtn} onClick={closeMenu} aria-label="Close Menu">
          <X size={28} />
        </button>
        <Link 
          href="/" 
          className={`${styles.mobileNavLink} ${isActive('/') ? styles.activeLink : ''}`}
          onClick={closeMenu}
        >
          Home
        </Link>
        <Link 
          href="/gallery" 
          className={`${styles.mobileNavLink} ${isActive('/gallery') ? styles.activeLink : ''}`}
          onClick={closeMenu}
        >
          Gallery
        </Link>
        <Link 
          href="/contact" 
          className={`${styles.mobileNavLink} ${isActive('/contact') ? styles.activeLink : ''}`}
          onClick={closeMenu}
        >
          Contact
        </Link>
        <Link 
          href="/admin" 
          className={`${styles.mobileNavLink} ${isActive('/admin') || isActive('/login') ? styles.activeLink : ''}`}
          onClick={closeMenu}
        >
          Admin Panel
        </Link>
      </div>
    </>
  );
}
