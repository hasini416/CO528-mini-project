import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { FiHeart, FiMessageCircle, FiImage, FiSend } from 'react-icons/fi';

const FeedPage = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [media, setMedia] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedPost, setExpandedPost] = useState(null);
  const [comments, setComments] = useState({});
  const [commentText, setCommentText] = useState('');
  const fileRef = useRef();

  useEffect(() => { fetchFeed(); }, []);

  const fetchFeed = async () => {
    try {
      const { data } = await API.get('/feed/get-feed');
      setPosts(data.posts);
    } catch { toast.error('Failed to load feed'); }
    finally { setLoading(false); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('text', text);
      if (media) fd.append('media', media);
      const { data } = await API.post('/feed/create-post', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPosts([data.post, ...posts]);
      setText(''); setMedia(null);
      toast.success('Posted!');
    } catch { toast.error('Failed to post'); }
    finally { setSubmitting(false); }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await API.post(`/feed/like-post/${postId}`);
      setPosts(posts.map(p => p._id === postId ? { ...p, likesCount: data.likesCount, _liked: data.liked } : p));
    } catch { toast.error('Failed to like'); }
  };

  const fetchComments = async (postId) => {
    try {
      const { data } = await API.get(`/feed/comments/${postId}`);
      setComments(c => ({ ...c, [postId]: data.comments }));
    } catch {}
  };

  const toggleComments = (postId) => {
    if (expandedPost === postId) { setExpandedPost(null); return; }
    setExpandedPost(postId);
    fetchComments(postId);
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    try {
      const { data } = await API.post(`/feed/comment/${postId}`, { text: commentText });
      setComments(c => ({ ...c, [postId]: [data.comment, ...(c[postId] || [])] }));
      setCommentText('');
      setPosts(posts.map(p => p._id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p));
    } catch { toast.error('Failed to comment'); }
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  return (
    <div>
      <div className="page-header"><h1>Feed</h1><p>Share updates with your department</p></div>

      {/* Create post */}
      <div className="card" style={{ marginBottom: 20 }}>
        <form onSubmit={handlePost}>
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="avatar">{initials(user?.name)}</div>
            <div style={{ flex: 1 }}>
              <textarea className="form-control" placeholder="What's on your mind?" value={text}
                onChange={e => setText(e.target.value)} rows={3} />
              {media && <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 4 }}>📎 {media.name}</p>}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => fileRef.current.click()}>
              <FiImage /> Add Media
            </button>
            <input ref={fileRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={e => setMedia(e.target.files[0])} />
            <button className="btn btn-primary btn-sm" disabled={submitting || !text.trim()}>
              <FiSend /> {submitting ? 'Posting...' : 'Post'}
            </button>
          </div>
        </form>
      </div>

      {/* Posts */}
      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        posts.length === 0 ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No posts yet. Be the first!</p> :
        posts.map(post => (
          <div className="card post-card" key={post._id}>
            <div className="post-header">
              <div className="avatar">{initials(post.user?.name)}</div>
              <div className="post-meta">
                <div className="name">{post.user?.name}<span className="badge badge-accent" style={{ marginLeft: 8 }}>{post.user?.role}</span></div>
                <div className="time">{post.user?.department} · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</div>
              </div>
            </div>
            <p className="post-text">{post.text}</p>
            {post.mediaUrl && post.mediaType === 'image' && <img className="post-media" src={post.mediaUrl} alt="post" />}
            <div className="post-actions">
              <button className={`post-action-btn${post._liked ? ' liked' : ''}`} onClick={() => handleLike(post._id)}>
                <FiHeart /> {post.likesCount}
              </button>
              <button className="post-action-btn" onClick={() => toggleComments(post._id)}>
                <FiMessageCircle /> {post.commentsCount}
              </button>
            </div>
            {expandedPost === post._id && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  <input className="form-control" placeholder="Write a comment..." value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleComment(post._id)} />
                  <button className="btn btn-primary btn-sm" onClick={() => handleComment(post._id)}>Post</button>
                </div>
                {(comments[post._id] || []).map(c => (
                  <div className="comment" key={c._id}>
                    <div className="avatar" style={{ width: 30, height: 30, fontSize: 12 }}>{initials(c.user?.name)}</div>
                    <div className="comment-body">
                      <div className="comment-author">{c.user?.name}</div>
                      <div className="comment-text">{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default FeedPage;
