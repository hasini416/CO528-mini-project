import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiCalendar, FiMapPin, FiUsers, FiPlus, FiX } from 'react-icons/fi';
import { format, formatDistanceToNow } from 'date-fns';

const EventsPage = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', eventDate: '', location: '', capacity: 100, type: 'other' });

  useEffect(() => { fetchEvents(); }, []);

  const fetchEvents = async () => {
    try { const { data } = await API.get('/events/list-events'); setEvents(data.events); }
    catch { toast.error('Failed to load events'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await API.post('/events/create-event', form);
      setEvents([data.event, ...events]); setShowModal(false);
      toast.success('Event created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create event'); }
    finally { setSubmitting(false); }
  };

  const handleRSVP = async (eventId) => {
    try {
      const { data } = await API.post(`/events/rsvp/${eventId}`);
      setEvents(events.map(e => e._id === eventId ? { ...e, rsvpCount: data.rsvpCount, _rsvped: data.rsvped } : e));
      toast.success(data.rsvped ? 'RSVP confirmed!' : 'RSVP cancelled');
    } catch (err) { toast.error(err.response?.data?.message || 'RSVP failed'); }
  };

  const typeColors = { workshop: 'badge-accent', seminar: 'badge-success', social: 'badge-warning', other: 'badge-danger' };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Events & Announcements</h1><p>Department workshops, seminars, and social events</p></div>
        {(user?.role === 'admin' || user?.role === 'alumni') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Create Event</button>
        )}
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {events.map(event => (
            <div className="card" key={event._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                    <h3 style={{ fontSize: 17, fontWeight: 700 }}>{event.title}</h3>
                    <span className={`badge ${typeColors[event.type] || 'badge-accent'}`}>{event.type}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 16, fontSize: 13, color: 'var(--text-secondary)' }}>
                    <span><FiCalendar style={{ marginRight: 4 }} />{format(new Date(event.eventDate), 'PPP p')}</span>
                    <span><FiMapPin style={{ marginRight: 4 }} />{event.location}</span>
                    <span><FiUsers style={{ marginRight: 4 }} />{event.rsvpCount}/{event.capacity}</span>
                  </div>
                </div>
                <button className={`btn btn-sm ${event._rsvped ? 'btn-danger' : 'btn-primary'}`} onClick={() => handleRSVP(event._id)}>
                  {event._rsvped ? 'Cancel RSVP' : 'RSVP'}
                </button>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{event.description}</p>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <div className="avatar" style={{ width: 24, height: 24, fontSize: 10 }}>
                  {event.createdBy?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                </div>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {event.createdBy?.name}</span>
                {/* Capacity bar */}
                <div style={{ flex: 1, background: 'var(--bg-secondary)', borderRadius: 99, height: 4, overflow: 'hidden', maxWidth: 120 }}>
                  <div style={{ width: `${(event.rsvpCount / event.capacity) * 100}%`, background: 'var(--accent)', height: '100%', borderRadius: 99, transition: '0.3s' }} />
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No events scheduled.</p>}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 500, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Create Event</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="grid-2">
                <div className="form-group"><label>Date & Time</label><input type="datetime-local" className="form-control" value={form.eventDate} onChange={e => setForm({ ...form, eventDate: e.target.value })} required /></div>
                <div className="form-group"><label>Type</label><select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="workshop">Workshop</option><option value="seminar">Seminar</option><option value="social">Social</option><option value="other">Other</option></select></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Location</label><input className="form-control" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
                <div className="form-group"><label>Capacity</label><input type="number" className="form-control" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} /></div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>{submitting ? 'Creating...' : 'Create Event'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsPage;
