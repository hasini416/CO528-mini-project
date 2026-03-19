import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { FiSend } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';

let socket;

const MessagingPage = () => {
  const { user, token } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [newRoomId, setNewRoomId] = useState('');
  const bottomRef = useRef();

  useEffect(() => {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
    });
    socket.on('message:receive', (msg) => {
      setMessages(prev => [...prev, msg]);
    });
    return () => socket.disconnect();
  }, [token]);

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const joinRoom = async (roomId) => {
    if (!roomId.trim()) return;
    setActiveRoom(roomId);
    socket.emit('room:join', roomId);
    try {
      const { data } = await API.get(`/messaging/chat-history/${roomId}`);
      setMessages(data.messages);
    } catch { toast.error('Failed to load messages'); }
  };

  const sendMessage = () => {
    if (!text.trim() || !activeRoom) return;
    socket.emit('message:send', { roomId: activeRoom, text });
    setText('');
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div>
      <div className="page-header"><h1>Messages</h1><p>Real-time chat powered by Socket.IO</p></div>
      <div className="messages-layout" style={{ borderRadius: 'var(--radius)', overflow: 'hidden', border: '1px solid var(--border)' }}>
        {/* Rooms / new DM panel */}
        <div className="rooms-panel" style={{ background: 'var(--bg-secondary)', padding: 16 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12, color: 'var(--text-secondary)' }}>Direct Messages</h3>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <input className="form-control" placeholder="Room / User ID" value={newRoomId}
              onChange={e => setNewRoomId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && joinRoom(newRoomId)} style={{ fontSize: 13 }} />
            <button className="btn btn-primary btn-sm" onClick={() => joinRoom(newRoomId)}>Go</button>
          </div>
          {activeRoom && (
            <div style={{ padding: '10px 14px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-focus)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent-light)' }}>Active Room</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', wordBreak: 'break-all' }}>{activeRoom}</div>
            </div>
          )}
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 16 }}>Enter a room ID or another user's ID to start a conversation</p>
        </div>

        {/* Chat panel */}
        <div className="chat-panel" style={{ background: 'var(--bg-primary)' }}>
          {!activeRoom ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexDirection: 'column', gap: 8 }}>
              <span style={{ fontSize: 40 }}>💬</span>
              <p>Select or start a conversation</p>
            </div>
          ) : (
            <>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontWeight: 600, fontSize: 14 }}>
                Room: <code style={{ color: 'var(--accent-light)', fontSize: 12 }}>{activeRoom}</code>
              </div>
              <div className="chat-messages">
                {messages.map((msg, i) => {
                  const isMine = msg.sender?._id === user?._id || msg.sender === user?._id;
                  return (
                    <div key={msg._id || i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start' }}>
                      {!isMine && <div className="msg-sender">{msg.sender?.name}</div>}
                      <div className={`msg-bubble ${isMine ? 'mine' : 'theirs'}`}>{msg.text}</div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
              <div className="chat-input-bar">
                <input className="form-control" value={text} onChange={e => setText(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Type a message..." />
                <button className="btn btn-primary" onClick={sendMessage}><FiSend /></button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
