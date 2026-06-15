'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  LogOut, Calendar, Image as ImageIcon, Mail, Plus, Trash2, 
  Edit2, Check, Eye, EyeOff, Upload, FileVideo, AlertCircle 
} from 'lucide-react';
import { auth } from '@/lib/auth';
import { db, WeeklyProgram, GalleryMedia, ContactMessage } from '@/lib/db';
import styles from './admin.module.css';

type Tab = 'programs' | 'gallery' | 'messages';

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('programs');
  const [authorized, setAuthorized] = useState(false);
  const [adminEmail, setAdminEmail] = useState<string | null>('');

  // Weekly Programs State
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [programForm, setProgramForm] = useState({
    title: '',
    day: 'Sunday',
    time: '',
    description: '',
  });
  const [editingProgramId, setEditingProgramId] = useState<string | null>(null);

  // Gallery State
  const [mediaList, setMediaList] = useState<GalleryMedia[]>([]);
  const [mediaForm, setMediaForm] = useState({
    type: 'image' as 'image' | 'video',
    caption: '',
  });
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [useDirectUrl, setUseDirectUrl] = useState(false);
  const [directUrl, setDirectUrl] = useState('');

  // Messages State
  const [messages, setMessages] = useState<ContactMessage[]>([]);

  // Feedback Alerts
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    async function checkAuth() {
      const logged = await auth.isLoggedIn();
      if (!logged) {
        router.push('/login');
      } else {
        setAuthorized(true);
        setAdminEmail(auth.getAdminEmail());
        // Load initial data
        loadData();
      }
    }
    checkAuth();
  }, [router]);

  async function loadData() {
    try {
      const progs = await db.getWeeklyPrograms();
      setPrograms(progs);

      const media = await db.getGalleryMedia();
      setMediaList(media);

      const msgs = await db.getContactMessages();
      setMessages(msgs);
    } catch (err) {
      console.error('Error loading admin data:', err);
    }
  }

  const handleSignOut = async () => {
    await auth.logout();
    router.push('/login');
  };

  const showFeedback = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  // --- WEEKLY PROGRAMS ACTIONS ---
  const handleProgramSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!programForm.title || !programForm.time) {
      showFeedback('error', 'Please fill in Title and Time.');
      return;
    }

    try {
      if (editingProgramId) {
        // Edit existing
        await db.updateWeeklyProgram(editingProgramId, programForm);
        showFeedback('success', 'Weekly program updated successfully!');
        setEditingProgramId(null);
      } else {
        // Add new
        await db.addWeeklyProgram(programForm);
        showFeedback('success', 'Weekly program added successfully!');
      }

      setProgramForm({ title: '', day: 'Sunday', time: '', description: '' });
      const updated = await db.getWeeklyPrograms();
      setPrograms(updated);
    } catch (err) {
      console.error('Error saving program:', err);
      showFeedback('error', 'Failed to save weekly program.');
    }
  };

  const handleEditProgramClick = (prog: WeeklyProgram) => {
    setEditingProgramId(prog.id);
    setProgramForm({
      title: prog.title,
      day: prog.day,
      time: prog.time,
      description: prog.description || '',
    });
  };

  const handleDeleteProgram = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      await db.deleteWeeklyProgram(id);
      showFeedback('success', 'Program deleted successfully.');
      const updated = await db.getWeeklyPrograms();
      setPrograms(updated);
    } catch (err) {
      console.error('Error deleting program:', err);
      showFeedback('error', 'Failed to delete program.');
    }
  };

  const cancelEdit = () => {
    setEditingProgramId(null);
    setProgramForm({ title: '', day: 'Sunday', time: '', description: '' });
  };

  // --- GALLERY ACTIONS ---
  const handleMediaUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (useDirectUrl) {
      if (!directUrl.trim()) {
        showFeedback('error', 'Please enter a valid media URL.');
        return;
      }
      setUploading(true);
      try {
        await db.addGalleryMedia({
          type: mediaForm.type,
          url: directUrl.trim(),
          public_id: `url_${Date.now()}`,
          caption: mediaForm.caption,
        });
        showFeedback('success', 'Media link saved successfully!');
        setDirectUrl('');
        setMediaForm({ type: 'image', caption: '' });
        const updated = await db.getGalleryMedia();
        setMediaList(updated);
      } catch (err) {
        console.error('Failed to save URL:', err);
        showFeedback('error', 'Failed to save media URL.');
      } finally {
        setUploading(false);
      }
      return;
    }

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showFeedback('error', 'Please select an image or video file to upload.');
      return;
    }

    setUploading(true);
    try {
      // 1. Attempt server-side Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', mediaForm.type);

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (uploadRes.ok) {
        const cloudData = await uploadRes.json();
        // Save metadata to DB
        await db.addGalleryMedia({
          type: mediaForm.type,
          url: cloudData.url,
          public_id: cloudData.public_id,
          caption: mediaForm.caption,
        });
        showFeedback('success', 'Media uploaded successfully to Cloudinary!');
      } else {
        // Cloudinary credentials might be missing on localhost. Let's do dataURL fallback!
        console.warn('API upload failed, checking local FileReader fallback...');
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Url = reader.result as string;
          // Save mock base64 to DB (LocalStorage/Mock)
          await db.addGalleryMedia({
            type: mediaForm.type,
            url: base64Url,
            public_id: `mock_${Date.now()}`,
            caption: mediaForm.caption,
          });
          showFeedback('error', 'Cloudinary is not configured. Saved only to local browser (NOT shared with public).');
          loadData();
        };
        reader.readAsDataURL(file);
        // We handle reloading in reader.onloadend
        setUploading(false);
        setMediaForm({ type: 'image', caption: '' });
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      setMediaForm({ type: 'image', caption: '' });
      if (fileInputRef.current) fileInputRef.current.value = '';
      const updated = await db.getGalleryMedia();
      setMediaList(updated);
    } catch (err) {
      console.error('Upload failed:', err);
      showFeedback('error', 'Upload failed. Ensure Cloudinary settings are correct.');
    } finally {
      setUploading(false);
    }
  };


  const handleDeleteMedia = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    try {
      await db.deleteGalleryMedia(id);
      showFeedback('success', 'Media deleted successfully.');
      const updated = await db.getGalleryMedia();
      setMediaList(updated);
    } catch (err) {
      console.error('Error deleting media:', err);
      showFeedback('error', 'Failed to delete media.');
    }
  };

  // --- MESSAGE ACTIONS ---
  const handleMarkRead = async (id: string, currentStatus: boolean) => {
    try {
      await db.markMessageRead(id, !currentStatus);
      const updated = await db.getContactMessages();
      setMessages(updated);
    } catch (err) {
      console.error('Error toggling read status:', err);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await db.deleteMessage(id);
      showFeedback('success', 'Message deleted.');
      const updated = await db.getContactMessages();
      setMessages(updated);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  if (!authorized) {
    return (
      <section className={styles.adminSection}>
        <div style={{ color: 'var(--text-muted)' }}>Redirecting to login...</div>
      </section>
    );
  }

  return (
    <section className={styles.adminSection}>
      {/* Dashboard Top bar */}
      <div className={styles.dashboardHeader}>
        <div className={styles.titleInfo}>
          <h1>Admin Dashboard</h1>
          <p className={styles.adminEmail}>Logged in as: <strong>{adminEmail}</strong></p>
        </div>
        <button className={styles.signOutBtn} onClick={handleSignOut}>
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>

      {/* Global Alerts Feed */}
      {feedback && (
        <div 
          className={feedback.type === 'success' ? 'successMessage' : 'errorMessage'}
          style={{ 
            marginBottom: '30px', 
            borderRadius: '8px', 
            padding: '15px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            gap: '10px' 
          }}
        >
          <AlertCircle size={20} />
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tab Switcher */}
      <div className={styles.tabsBar}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'programs' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('programs')}
        >
          <Calendar size={18} />
          <span>Weekly Programs</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'gallery' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          <ImageIcon size={18} />
          <span>Gallery Media</span>
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'messages' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('messages')}
        >
          <Mail size={18} />
          <span>Contact Messages</span>
        </button>
      </div>

      {/* TAB 1: WEEKLY PROGRAMS */}
      {activeTab === 'programs' && (
        <div className={`${styles.tabContent} ${styles.twoColLayout}`}>
          {/* Add / Edit Form */}
          <div className={`${styles.formCard} glass-card`}>
            <h2 className={styles.cardTitle}>
              {editingProgramId ? 'Edit Program' : 'Add Weekly Program'}
            </h2>
            <form onSubmit={handleProgramSubmit}>
              <div className={styles.formGroup}>
                <label>Program Title *</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g., Sunday Worship Service"
                  value={programForm.title}
                  onChange={(e) => setProgramForm({...programForm, title: e.target.value})}
                  required
                />
              </div>

              <div className={styles.rowInputs}>
                <div className={styles.formGroup}>
                  <label>Day of Week *</label>
                  <select 
                    className={styles.select}
                    value={programForm.day}
                    onChange={(e) => setProgramForm({...programForm, day: e.target.value})}
                  >
                    <option value="Sunday">Sunday</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Time Duration *</label>
                  <input 
                    type="text" 
                    className={styles.input} 
                    placeholder="e.g., 09:30 AM - 11:30 AM"
                    value={programForm.time}
                    onChange={(e) => setProgramForm({...programForm, time: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Description / Details</label>
                <textarea 
                  className={styles.textarea} 
                  placeholder="Provide any details about activities, themes, or location..."
                  value={programForm.description}
                  onChange={(e) => setProgramForm({...programForm, description: e.target.value})}
                ></textarea>
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <button type="submit" className="btn-gold" style={{ flex: 1 }}>
                  {editingProgramId ? 'Save Changes' : 'Publish Program'}
                </button>
                {editingProgramId && (
                  <button type="button" className="btn-outline" onClick={cancelEdit} style={{ color: 'var(--text-main)' }}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Programs List */}
          <div className={`${styles.listCard} glass-card`}>
            <h2 className={styles.cardTitle}>Scheduled Programs</h2>
            <div className={styles.itemsList}>
              {programs.length > 0 ? (
                programs.map((prog) => (
                  <div key={prog.id} className={styles.itemRow}>
                    <div className={styles.itemDetails}>
                      <span className={styles.itemTitle}>{prog.title}</span>
                      <span className={styles.itemMeta}>
                        <strong>{prog.day}</strong> &bull; {prog.time}
                      </span>
                    </div>
                    <div className={styles.itemActions}>
                      <button 
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEditProgramClick(prog)}
                        title="Edit Program"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDeleteProgram(prog.id)}
                        title="Delete Program"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles.noItems}>No scheduled programs found. Add one on the left.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GALLERY MEDIA */}
      {activeTab === 'gallery' && (
        <div className={`${styles.tabContent} ${styles.twoColLayout}`}>
          {/* Upload Form */}
          <div className={`${styles.formCard} glass-card`}>
            <h2 className={styles.cardTitle}>Upload Image or Video</h2>
            <form onSubmit={handleMediaUpload}>
              <div className={styles.formGroup}>
                <label>Media Type *</label>
                <select 
                  className={styles.select}
                  value={mediaForm.type}
                  onChange={(e) => setMediaForm({...mediaForm, type: e.target.value as 'image' | 'video'})}
                >
                  <option value="image">Image / Photograph</option>
                  <option value="video">Video Clip</option>
                </select>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: '15px' }}>
                <label>Source Type</label>
                <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="sourceType" 
                      checked={!useDirectUrl} 
                      onChange={() => setUseDirectUrl(false)} 
                    />
                    Upload File
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'normal', cursor: 'pointer' }}>
                    <input 
                      type="radio" 
                      name="sourceType" 
                      checked={useDirectUrl} 
                      onChange={() => setUseDirectUrl(true)} 
                    />
                    Provide Public URL
                  </label>
                </div>
              </div>

              {!useDirectUrl ? (
                <div className={styles.formGroup}>
                  <label>Select File *</label>
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    className={styles.input} 
                    accept={mediaForm.type === 'image' ? 'image/*' : 'video/*'}
                    required={!useDirectUrl}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {mediaForm.type === 'image' 
                      ? 'Recommended formats: JPEG, PNG, WEBP' 
                      : 'Recommended format: MP4 (Cloudinary supports video encoding)'
                    }
                  </span>
                </div>
              ) : (
                <div className={styles.formGroup}>
                  <label>Public Media URL *</label>
                  <input 
                    type="url" 
                    className={styles.input} 
                    placeholder={mediaForm.type === 'image' 
                      ? 'e.g. https://images.unsplash.com/photo-1548625361-155deee223cb'
                      : 'e.g. https://www.w3schools.com/html/mov_bbb.mp4'
                    }
                    value={directUrl}
                    onChange={(e) => setDirectUrl(e.target.value)}
                    required={useDirectUrl}
                  />
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Provide a direct URL to a publicly hosted photo or video.
                  </span>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>Caption / Title</label>
                <input 
                  type="text" 
                  className={styles.input} 
                  placeholder="e.g., Youth fellowship gathering"
                  value={mediaForm.caption}
                  onChange={(e) => setMediaForm({...mediaForm, caption: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="btn-gold" 
                style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}
                disabled={uploading}
              >
                <Upload size={18} />
                <span>{uploading ? 'Processing Media...' : (useDirectUrl ? 'Save Media Link' : 'Upload Media')}</span>
              </button>
            </form>
            
            {uploading && (
              <div className={styles.uploadLoading}>
                <div className={styles.spinner}></div>
                <span>Syncing media to storage bucket...</span>
              </div>
            )}
          </div>

          {/* Current Gallery */}
          <div className={`${styles.listCard} glass-card`}>
            <h2 className={styles.cardTitle}>Gallery Archive</h2>
            <div className={styles.galleryGrid}>
              {mediaList.length > 0 ? (
                mediaList.map((item) => (
                  <div key={item.id} className={styles.mediaThumb}>
                    <button 
                      className={styles.mediaDeleteBtn}
                      onClick={() => handleDeleteMedia(item.id)}
                      title="Delete Media"
                    >
                      <Trash2 size={14} />
                    </button>
                    {item.type === 'video' ? (
                      <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#111' }}>
                        <FileVideo size={36} style={{ color: 'var(--accent-gold)', margin: 'auto' }} />
                        <span style={{ position: 'absolute', bottom: '8px', left: '8px', background: 'rgba(0,0,0,0.7)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.65rem', color: 'white' }}>Video</span>
                      </div>
                    ) : (
                      <img 
                        src={item.url} 
                        alt={item.caption || 'Gallery thumbnail'} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                        loading="lazy"
                      />
                    )}
                  </div>
                ))

              ) : (
                <div className={styles.noItems} style={{ gridColumn: '1 / -1' }}>No media uploaded yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CONTACT MESSAGES */}
      {activeTab === 'messages' && (
        <div className={`${styles.tabContent} glass-card ${styles.listCard}`}>
          <h2 className={styles.cardTitle}>Inbox Messages</h2>
          <div>
            {messages.length > 0 ? (
              messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`${styles.messageCard} ${!msg.is_read ? styles.unreadMessage : ''}`}
                >
                  <div className={styles.messageHeader}>
                    <div className={styles.senderName}>
                      {msg.name}
                      {!msg.is_read && <span className={styles.unreadBadge}>Unread</span>}
                    </div>
                    <span className={styles.messageTime}>
                      {msg.created_at ? new Date(msg.created_at).toLocaleString() : 'N/A'}
                    </span>
                  </div>

                  <div className={styles.senderDetails}>
                    <span>Email: <strong>{msg.email}</strong></span>
                    <span>Phone: <strong>{msg.phone}</strong></span>
                  </div>

                  <div className={styles.messageBody}>
                    {msg.message}
                  </div>

                  <div className={styles.messageActions}>
                    <button 
                      className={`${styles.textBtn} ${styles.markReadBtn}`}
                      onClick={() => handleMarkRead(msg.id, msg.is_read)}
                    >
                      {msg.is_read ? <EyeOff size={16} /> : <Eye size={16} />}
                      <span>{msg.is_read ? 'Mark as Unread' : 'Mark as Read'}</span>
                    </button>
                    <button 
                      className={`${styles.textBtn} ${styles.deleteMsgBtn}`}
                      onClick={() => handleDeleteMessage(msg.id)}
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className={styles.noItems}>No messages found in the inbox.</div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
