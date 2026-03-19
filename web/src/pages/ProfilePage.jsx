import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, login, token } = useAuth();
  const [form, setForm] = useState({
    name: user?.name || '', bio: user?.bio || '',
    department: user?.department || '', graduationYear: user?.graduationYear || '',
    linkedIn: user?.linkedIn || '', github: user?.github || '',
    skills: (user?.skills || []).join(', '),
  });
  const [submitting, setSubmitting] = useState(false);
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const handleUpdate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await API.put('/users/profile/update', {
        ...form, skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
      });
      login(data.user, token);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSubmitting(false); }
  };

  const roleColors = { student: 'badge-accent', alumni: 'badge-success', admin: 'badge-warning' };

  return (
    <div style={{ maxWidth: 680 }}>
      <div className="page-header"><h1>My Profile</h1><p>Update your personal information</p></div>
      <div className="card" style={{ marginBottom: 20, display: 'flex', gap: 20, alignItems: 'center' }}>
        <div className="avatar" style={{ width: 72, height: 72, fontSize: 28 }}>{initials}</div>
        <div>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{user?.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{user?.email}</p>
          <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
            <span className={`badge ${roleColors[user?.role]}`}>{user?.role}</span>
            {user?.department && <span className="badge badge-accent">{user.department}</span>}
          </div>
        </div>
      </div>
      <div className="card">
        <form onSubmit={handleUpdate}>
          <div className="grid-2">
            <div className="form-group"><label>Full Name</label><input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
            <div className="form-group"><label>Department</label><input className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Bio</label><textarea className="form-control" rows={3} value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Tell the department about yourself..." /></div>
          <div className="grid-2">
            <div className="form-group"><label>Graduation Year</label><input type="number" className="form-control" value={form.graduationYear} onChange={e => setForm({ ...form, graduationYear: e.target.value })} /></div>
            <div className="form-group"><label>Skills</label><input className="form-control" value={form.skills} onChange={e => setForm({ ...form, skills: e.target.value })} placeholder="React, Node.js, Python" /></div>
          </div>
          <div className="grid-2">
            <div className="form-group"><label>LinkedIn URL</label><input className="form-control" value={form.linkedIn} onChange={e => setForm({ ...form, linkedIn: e.target.value })} placeholder="https://linkedin.com/in/..." /></div>
            <div className="form-group"><label>GitHub URL</label><input className="form-control" value={form.github} onChange={e => setForm({ ...form, github: e.target.value })} placeholder="https://github.com/..." /></div>
          </div>
          <button className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
