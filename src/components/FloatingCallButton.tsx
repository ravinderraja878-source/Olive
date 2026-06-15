'use client';

import React from 'react';
import { Phone } from 'lucide-react';

export default function FloatingCallButton() {
  return (
    <a 
      href="tel:+919246887888" 
      className="floating-call-btn" 
      title="Call Olive Prayer House"
      aria-label="Call Owner Direct Line"
    >
      <Phone size={28} fill="currentColor" />
    </a>
  );
}
