import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { FiBriefcase, FiMapPin, FiClock, FiPlus, FiX } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

const JobsPage = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [applyModal, setApplyModal] = useState(null);
  const [form, setForm] = useState({ title: '', company: '', location: 'Remote', type: 'job', description: '', salary: '' });
  const [applyForm, setApplyForm] = useState({ coverLetter: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchJobs(); }, [filter]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?type=${filter}` : '';
      const { data } = await API.get(`/jobs/list-jobs${params}`);
      setJobs(data.jobs);
    } catch { toast.error('Failed to load jobs'); }
    finally { setLoading(false); }
  };

  const handlePost = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const { data } = await API.post('/jobs/post-job', form);
      setJobs([data.job, ...jobs]); setShowModal(false);
      setForm({ title: '', company: '', location: 'Remote', type: 'job', description: '', salary: '' });
      toast.success('Job posted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post job'); }
    finally { setSubmitting(false); }
  };

  const handleApply = async (e) => {
    e.preventDefault(); setSubmitting(true);
    try {
      await API.post(`/jobs/apply-job/${applyModal._id}`, applyForm);
      toast.success('Application submitted!'); setApplyModal(null);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
    finally { setSubmitting(false); }
  };

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div><h1>Jobs & Internships</h1><p>Opportunities posted by alumni and admins</p></div>
        {(user?.role === 'alumni' || user?.role === 'admin') && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><FiPlus /> Post Opportunity</button>
        )}
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['all', 'job', 'internship'].map(f => (
          <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setFilter(f)}>{f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1) + 's'}</button>
        ))}
      </div>

      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {jobs.map(job => (
            <div className="card" key={job._id}>
              <div className="job-card">
                <div className="job-card-header">
                  <div>
                    <div className="job-title">{job.title}</div>
                    <div className="job-company">{job.company}</div>
                  </div>
                  <span className={`badge ${job.type === 'internship' ? 'badge-warning' : 'badge-accent'}`}>{job.type}</span>
                </div>
                <div className="job-meta">
                  <span className="badge badge-success"><FiMapPin style={{ marginRight: 3 }} />{job.location}</span>
                  {job.salary && <span className="badge badge-accent">💰 {job.salary}</span>}
                  {job.deadline && <span className="badge badge-warning"><FiClock style={{ marginRight: 3 }} />Deadline: {new Date(job.deadline).toLocaleDateString()}</span>}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>{job.description}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Posted by {job.postedBy?.name} · {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
                  {user?.role === 'student' && (
                    <button className="btn btn-primary btn-sm" onClick={() => setApplyModal(job)}>Apply Now</button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {jobs.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No opportunities found.</p>}
        </div>
      )}

      {/* Post job modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 520, maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700 }}>Post Opportunity</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handlePost}>
              <div className="grid-2">
                <div className="form-group"><label>Title</label><input className="form-control" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Software Engineer" /></div>
                <div className="form-group"><label>Company</label><input className="form-control" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} required placeholder="Acme Corp" /></div>
              </div>
              <div className="grid-2">
                <div className="form-group"><label>Type</label><select className="form-control" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}><option value="job">Job</option><option value="internship">Internship</option></select></div>
                <div className="form-group"><label>Location</label><input className="form-control" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} /></div>
              </div>
              <div className="form-group"><label>Salary / Stipend</label><input className="form-control" value={form.salary} onChange={e => setForm({ ...form, salary: e.target.value })} placeholder="$5000/month" /></div>
              <div className="form-group"><label>Description</label><textarea className="form-control" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required rows={4} /></div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>{submitting ? 'Posting...' : 'Post Opportunity'}</button>
            </form>
          </div>
        </div>
      )}

      {/* Apply modal */}
      {applyModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
          <div className="card" style={{ width: '100%', maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>Apply: {applyModal.title}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setApplyModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handleApply}>
              <div className="form-group"><label>Cover Letter</label><textarea className="form-control" rows={5} value={applyForm.coverLetter} onChange={e => setApplyForm({ ...applyForm, coverLetter: e.target.value })} placeholder="Tell them why you're a great fit..." /></div>
              <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Application'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobsPage;
