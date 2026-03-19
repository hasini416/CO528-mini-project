import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { FiBell, FiCheck } from 'react-icons/fi';

const typeEmoji = {
  new_message: '💬', new_job: '💼', event_created: '📅',
  job_applied: '📋', comment: '💬', like: '❤️', rsvp: '✅', research_invite: '🔬',
};

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchNotifications(); }, []);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data.notifications);
      setUnread(data.unreadCount);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  const markAllRead = async () => {
    try {
      await API.put('/notifications/mark-read');
      setNotifications(n => n.map(notif => ({ ...notif, isRead: true })));
      setUnread(0);
    } catch {}
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Notifications {unread > 0 && <span className="badge badge-danger">{unread} new</span>}
          </h1>
          <p>Stay up to date with activity across DECP</p>
        </div>
        {unread > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}><FiCheck /> Mark all read</button>
        )}
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {notifications.map(n => (
            <div key={n._id} className="card" style={{ display: 'flex', gap: 12, alignItems: 'center', opacity: n.isRead ? 0.7 : 1, background: n.isRead ? 'var(--bg-card)' : 'var(--bg-card-hover)', borderColor: n.isRead ? 'var(--border)' : 'var(--border-focus)' }}>
              <div style={{ fontSize: 24, width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--accent-glow)', borderRadius: '50%' }}>
                {typeEmoji[n.type] || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{n.message}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {n.triggeredBy?.name && <span>{n.triggeredBy.name} · </span>}
                  {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                </div>
              </div>
              {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />}
            </div>
          ))}
          {notifications.length === 0 && (
            <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>
              <FiBell style={{ fontSize: 36, marginBottom: 8 }} />
              <p>All caught up! No notifications.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
