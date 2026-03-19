import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('decp_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('decp_token'));

  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem('decp_user', JSON.stringify(userData));
    localStorage.setItem('decp_token', authToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('decp_user');
    localStorage.removeItem('decp_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
