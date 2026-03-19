import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiPlus, FiX, FiUpload, FiUserPlus, FiFileText } from 'react-icons/fi';

const ResearchPage = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [inviteModal, setInviteModal] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', tags: '' });
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const [all, mine] = await Promise.all([
        API.get('/research/list-projects'),
        API.get('/research/my-projects'),
      ]);
      setProjects(all.data.projects);
      setMyProjects(mine.data.projects);
    } catch { toast.error('Failed to load research projects'); }
    finally { setLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      const { data } = await API.post('/research/create-project', payload);
      setMyProjects([data.project, ...myProjects]); setProjects([data.project, ...projects]);
      setShowCreate(false); setForm({ title: '', description: '', tags: '' });
      toast.success('Research project created!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create project'); }
    finally { setSubmitting(false); }
  };

  const handleInvite = async (projectId) => {
    try {
      const users = await API.get(`/users/get-user/${inviteEmail}`).catch(() => null);
      toast.error('Enter a valid User ID below the project to invite');
    } catch {}
  };

  const displayed = tab === 'all' ? projects : myProjects;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Research Collaboration</h1><p>Create projects, share documents, invite collaborators</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><FiPlus /> New Project</button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'mine'].map(t => (
          <button key={t} className={`btn btn-sm ${tab === t ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setTab(t)}>{t === 'all' ? 'All Projects' : 'My Projects'}</button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
          {displayed.map(proj => (
            <div className="card" key={proj._id} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: 16, fontWeight: 700 }}>{proj.title}</h3>
                {proj.isOpen && <span className="badge badge-success">Open</span>}
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.6, flex: 1 }}>{proj.description}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {proj.tags?.map(tag => <span key={tag} className="badge badge-accent">{tag}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <FiUserPlus style={{ marginRight: 4 }} />{proj.collaborators?.length || 0} collaborators
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>·</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <FiFileText style={{ marginRight: 4 }} />{proj.documents?.length || 0} documents
                </span>
              </div>
              {proj.owner?._id === user?._id && (
                <button className="btn btn-outline btn-sm" onClick={() => setInviteModal(proj)}>
                  <FiUserPlus /> Invite Collaborator
                </button>
              )}
            </div>
          ))}
          {displayed.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No projects found.</p>}
        </div>
      )}

      {/* Create project modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>New Research Project</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowCreate(false)}><FiX /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group"><label>Project Title</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
              <div className="form-group"><label>Tags (comma-separated)</label><input className="form-control" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="ML, NLP, Computer Vision" /></div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>{submitting ? 'Creating...' : 'Create Project'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Invite modal */}
      {inviteModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 420 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Invite to: {inviteModal.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setInviteModal(null)}><FiX /></button>
            </div>
            <div className="form-group">
              <label>User ID</label>
              <input className="form-control" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="Paste MongoDB user _id" />
            </div>
            <button className="btn btn-primary" onClick={async () => {
              try {
                await API.post('/research/invite-user', { projectId: inviteModal._id, userId: inviteEmail });
                toast.success('Invitation sent!'); setInviteModal(null); setInviteEmail('');
              } catch (err) { toast.error(err.response?.data?.message || 'Failed to invite'); }
            }}>Send Invite</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPage;
