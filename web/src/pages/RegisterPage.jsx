import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: '', graduationYear: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      toast.success('Account created! Welcome to DECP 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div className="auth-logo">🎓</div>
        <h1>Join DECP</h1>
        <p>Department Engagement & Career Platform</p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" placeholder="Hasini Nirmani" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input className="form-control" type="email" placeholder="you@university.edu" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Role</label>
              <select className="form-control" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                <option value="student">Current Student</option>
                <option value="alumni">Alumni</option>
              </select>
            </div>
            <div className="form-group">
              <label>Graduation Year</label>
              <input className="form-control" type="number" placeholder="2025" value={form.graduationYear}
                onChange={e => setForm({ ...form, graduationYear: e.target.value })} />
            </div>
          </div>
          <div className="form-group">
            <label>Department</label>
            <input className="form-control" placeholder="Computer Science" value={form.department}
              onChange={e => setForm({ ...form, department: e.target.value })} />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', fontSize: 14 }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-light)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
