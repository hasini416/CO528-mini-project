import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiHome, FiBookOpen, FiBriefcase, FiCalendar,
  FiMessageSquare, FiBarChart2, FiUser, FiBell
} from 'react-icons/fi';

const LINKS = [
  { to: '/', icon: <FiHome />, label: 'Feed' },
  { to: '/research', icon: <FiBookOpen />, label: 'Research' },
  { to: '/jobs', icon: <FiBriefcase />, label: 'Jobs & Internships' },
  { to: '/events', icon: <FiCalendar />, label: 'Events' },
  { to: '/messages', icon: <FiMessageSquare />, label: 'Messages' },
  { to: '/notifications', icon: <FiBell />, label: 'Notifications' },
  { to: '/profile', icon: <FiUser />, label: 'Profile' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };
  const initials = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span>🎓 DECP</span>
      </div>
      <nav>
        {LINKS.map(({ to, icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            {icon} {label}
          </NavLink>
        ))}
        {user?.role === 'admin' && (
          <NavLink to="/analytics" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <FiBarChart2 /> Analytics
          </NavLink>
        )}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-chip">
          <div className="avatar" style={{ fontSize: 14 }}>{initials}</div>
          <div className="user-chip-info">
            <div className="user-chip-name">{user?.name}</div>
            <div className="user-chip-role">{user?.role}</div>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Sign out</button>
      </div>
    </aside>
  );
};

export default Sidebar;
