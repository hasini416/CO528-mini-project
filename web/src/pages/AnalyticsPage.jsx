import { useState, useEffect } from 'react';
import API from '../api/axios';
import toast from 'react-hot-toast';

const AnalyticsPage = () => {
  const [stats, setStats] = useState({ users: null, posts: null, jobs: null });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [u, p, j] = await Promise.all([
          API.get('/analytics/stats/users'),
          API.get('/analytics/stats/posts'),
          API.get('/analytics/stats/jobs'),
        ]);
        setStats({ users: u.data.stats, posts: p.data.stats, jobs: j.data.stats });
      } catch { toast.error('Failed to load analytics'); }
      finally { setLoading(false); }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div>
      <div className="page-header"><h1>Analytics Dashboard</h1><p>Platform-wide metrics and insights</p></div>

      {/* User stats */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>👥 Users</h2>
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-value">{stats.users?.total}</div><div className="stat-label">Total Users</div></div>
        <div className="stat-card"><div className="stat-value">{stats.users?.students}</div><div className="stat-label">Students</div></div>
        <div className="stat-card"><div className="stat-value">{stats.users?.alumni}</div><div className="stat-label">Alumni</div></div>
        <div className="stat-card"><div className="stat-value">{stats.users?.newLast30Days}</div><div className="stat-label">New (30d)</div></div>
      </div>

      {/* Post stats */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>📝 Feed</h2>
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-value">{stats.posts?.total}</div><div className="stat-label">Total Posts</div></div>
        <div className="stat-card"><div className="stat-value">{stats.posts?.totalLikes}</div><div className="stat-label">Total Likes</div></div>
        <div className="stat-card"><div className="stat-value">{stats.posts?.recentLast7Days}</div><div className="stat-label">Posts (7d)</div></div>
      </div>

      {/* Most liked posts */}
      {stats.posts?.mostLiked?.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>🔥 Most Liked Posts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
            {stats.posts.mostLiked.map((p, i) => (
              <div className="card" key={p._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-light)', width: 28 }}>#{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{p.text?.slice(0, 80)}...</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>by {p.user?.name}</div>
                </div>
                <span className="badge badge-accent">❤️ {p.likesCount}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Jobs stats */}
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>💼 Jobs</h2>
      <div className="stats-grid" style={{ marginBottom: 28 }}>
        <div className="stat-card"><div className="stat-value">{stats.jobs?.totalJobs}</div><div className="stat-label">Total Jobs</div></div>
        <div className="stat-card"><div className="stat-value">{stats.jobs?.activeJobs}</div><div className="stat-label">Active</div></div>
        <div className="stat-card"><div className="stat-value">{stats.jobs?.totalApplications}</div><div className="stat-label">Applications</div></div>
        <div className="stat-card"><div className="stat-value">{stats.jobs?.pendingApplications}</div><div className="stat-label">Pending Review</div></div>
      </div>

      {stats.jobs?.topJobs?.length > 0 && (
        <>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>📈 Most Applied Jobs</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.jobs.topJobs.map((j, i) => (
              <div className="card" key={j._id} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent-light)', width: 28 }}>#{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{j.job?.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{j.job?.company}</div>
                </div>
                <span className="badge badge-accent">📋 {j.count} apps</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
