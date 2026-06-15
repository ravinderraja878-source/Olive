'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, X, Image as ImageIcon, Film } from 'lucide-react';
import { db, GalleryMedia } from '@/lib/db';
import styles from './gallery.module.css';

export default function Gallery() {
  const [mediaList, setMediaList] = useState<GalleryMedia[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'image' | 'video'>('all');
  const [selectedMedia, setSelectedMedia] = useState<GalleryMedia | null>(null);

  useEffect(() => {
    async function loadMedia() {
      try {
        const data = await db.getGalleryMedia();
        setMediaList(data);
      } catch (err) {
        console.error('Failed to load gallery:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMedia();
  }, []);

  const filteredMedia = mediaList.filter((item) => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  // Helper to determine masonry styles based on index for variety
  const getMasonryClass = (idx: number) => {
    if (idx % 5 === 0) return styles.cardLarge;
    if (idx % 6 === 3) return styles.cardWide;
    return '';
  };

  return (
    <section className={styles.gallerySection}>
      <div className={styles.header}>
        <p className={styles.subtitle}>Media Archive</p>
        <h1 className={styles.title}>Gallery & Videos</h1>
      </div>

      {/* Filter Options */}
      <div className={styles.filterBar}>
        <button
          className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('all')}
        >
          All Media
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'image' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('image')}
        >
          Photos
        </button>
        <button
          className={`${styles.filterBtn} ${filter === 'video' ? styles.activeFilter : ''}`}
          onClick={() => setFilter('video')}
        >
          Videos
        </button>
      </div>

      {/* Media Grid */}
      {loading ? (
        <div className={styles.noMedia}>Loading gallery archive...</div>
      ) : filteredMedia.length > 0 ? (
        <div className={styles.grid}>
          {filteredMedia.map((item, idx) => (
            <div
              key={item.id}
              className={`${styles.card} ${getMasonryClass(idx)}`}
              onClick={() => setSelectedMedia(item)}
            >
              {item.type === 'video' && (
                <div className={styles.videoBadge}>
                  <Play size={14} fill="currentColor" />
                  <span>Video</span>
                </div>
              )}
              <div className={styles.imageContainer}>
                {/* For videos we display a thumbnail placeholder, or use Cloudinary image generation, or cover image */}
                <Image
                  src={item.type === 'video' 
                    ? 'https://images.unsplash.com/photo-1548625361-155deee223cb?auto=format&fit=crop&w=800&q=80' // default thumbnail for local mock video
                    : item.url
                  }
                  alt={item.caption || 'Olive Prayer House Gallery Media'}
                  fill
                  style={{ objectFit: 'cover' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className={styles.overlay}>
                  <span className={styles.mediaType}>
                    {item.type === 'image' ? <ImageIcon size={16} /> : <Film size={16} />}
                    <span style={{ marginLeft: '6px' }}>{item.type}</span>
                  </span>
                  {item.caption && <h3 className={styles.caption}>{item.caption}</h3>}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.noMedia}>No photo or video assets found.</div>
      )}

      {/* Lightbox Modal */}
      <div
        className={`${styles.lightbox} ${selectedMedia ? styles.lightboxVisible : ''}`}
        onClick={() => setSelectedMedia(null)}
      >
        <button className={styles.lightboxCloseBtn} onClick={() => setSelectedMedia(null)}>
          <X size={24} />
        </button>
        
        {selectedMedia && (
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.lightboxMedia}>
              {selectedMedia.type === 'video' ? (
                <video
                  className={styles.lightboxVideo}
                  src={selectedMedia.url}
                  controls
                  autoPlay
                />
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={selectedMedia.url}
                  alt={selectedMedia.caption || 'Selected gallery view'}
                  style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', borderRadius: '4px' }}
                />
              )}
            </div>
            {selectedMedia.caption && (
              <p className={styles.lightboxCaption}>{selectedMedia.caption}</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
