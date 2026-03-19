# Department Engagement & Career Platform (DECP)

A full-stack academic social platform connecting students and alumni through feeds, jobs, events, research collaboration, and real-time messaging.

## 🏗 Architecture Overview

Built on **Service-Oriented Architecture (SOA)** — 8 modular backend services consumed by both a React web client and a React Native mobile app.

| Layer | Technology |
|---|---|
| **Web Client** | React (Vite), React Router v6, Axios, Socket.IO |
| **Mobile Client** | React Native (Expo), React Navigation |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | JWT + bcrypt (RBAC: student / alumni / admin) |
| **Realtime** | Socket.IO (messaging) |
| **File Storage** | Cloudinary |

---

## 📁 Project Structure

```
project/
├── backend/          # Node.js + Express (8 service modules)
│   └── src/
│       ├── modules/
│       │   ├── users/         # Auth, RBAC
│       │   ├── feed/          # Posts, likes, comments
│       │   ├── jobs/          # Job board, applications
│       │   ├── events/        # Events, RSVP
│       │   ├── research/      # Projects, collaboration
│       │   ├── messaging/     # Chat history APIs
│       │   ├── notifications/ # In-app notifications
│       │   └── analytics/     # Stats & metrics
│       └── app.js             # Express + Socket.IO
├── web/              # React + Vite (web client)
│   └── src/
│       ├── pages/             # 10 pages
│       ├── components/        # Sidebar, ProtectedRoute
│       └── context/           # AuthContext
├── mobile/           # React Native + Expo (mobile client)
│   └── src/
│       ├── screens/           # Auth, Feed, Jobs, Events
│       └── context/           # AuthContext (AsyncStorage)
└── docs/             # Architecture diagrams + documentation
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account (for media uploads)
- Expo Go app (for mobile testing)

### 1. Backend Setup

```bash
cd backend
cp .env.example .env
# Fill in MONGO_URI, JWT_SECRET, CLOUDINARY_* in .env
npm install
npm run dev
# Runs on http://localhost:5000
```

### 2. Web Client Setup

```bash
cd web
# Edit .env if your backend URL is different
npm install
npm run dev
# Runs on http://localhost:5173
```

### 3. Mobile Client Setup

```bash
cd mobile
npm install
npx expo start
# Scan the QR code with Expo Go on your phone
```

> ⚠️ For mobile, change `baseURL` in `mobile/src/api/axios.js` to your machine's local IP address (e.g., `http://192.168.1.x:5000/api`)

---

## 🔐 User Roles

| Role | Capabilities |
|---|---|
| **student** | View/create posts, apply for jobs, RSVP events, join research, message |
| **alumni** | All student capabilities + post jobs/internships + create events |
| **admin** | All capabilities + analytics dashboard |

---

## 📡 API Endpoints Summary

| Module | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/register`, `POST /api/auth/login` |
| **Users** | `GET /api/users/get-user/:id`, `PUT /api/users/profile/update` |
| **Feed** | `POST /api/feed/create-post`, `GET /api/feed/get-feed`, `POST /api/feed/like-post/:id`, `POST /api/feed/comment/:id` |
| **Jobs** | `POST /api/jobs/post-job`, `GET /api/jobs/list-jobs`, `POST /api/jobs/apply-job/:id`, `GET /api/jobs/applications` |
| **Events** | `POST /api/events/create-event`, `GET /api/events/list-events`, `POST /api/events/rsvp/:id` |
| **Research** | `POST /api/research/create-project`, `POST /api/research/invite-user`, `POST /api/research/upload-doc` |
| **Messaging** | `GET /api/messaging/chat-history/:roomId` + Socket.IO |
| **Notifications** | `GET /api/notifications`, `PUT /api/notifications/mark-read` |
| **Analytics** | `GET /api/analytics/stats/users`, `/stats/posts`, `/stats/jobs` |

---

## 🔌 Socket.IO Events

| Event (Client → Server) | Description |
|---|---|
| `room:join` | Join a DM or group chat room |
| `message:send` | Send a message to a room |
| `typing:start` / `typing:stop` | Typing indicators |

| Event (Server → Client) | Description |
|---|---|
| `message:receive` | New message in the room |
| `users:online` | Updated list of online user IDs |
| `typing:start` / `typing:stop` | Another user is typing |

---

## ☁️ Cloud Deployment

### Backend (Render / Railway)
1. Create a Web Service pointing to the `backend/` directory
2. Set build command: `npm install`
3. Set start command: `node server.js`
4. Add all `.env` variables in the service dashboard

### Database (MongoDB Atlas)
1. Create a free cluster on [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Whitelist IP `0.0.0.0/0` for cloud deployment
3. Copy connection string → set as `MONGO_URI` in backend env

### Web Frontend (Vercel / Netlify)
1. Deploy the `web/` folder
2. Set `VITE_API_URL` to your deployed backend URL
3. Set `VITE_SOCKET_URL` to same backend URL

---

## 🔬 Research Findings: Comparative Platform Analysis

| Feature | Facebook | LinkedIn | **DECP** |
|---|---|---|---|
| Social Feed | ✅ | ✅ | ✅ |
| Job Board | ❌ | ✅ | ✅ |
| Academic Research Collaboration | ❌ | ❌ | ✅ |
| Department-specific Networking | ❌ | ❌ | ✅ |
| RSVP Event Management | Limited | Limited | ✅ |
| Real-time Messaging | ✅ | ✅ | ✅ |
| Analytics Dashboard | ❌ (public) | ❌ (public) | ✅ (admin) |
| Integrated Academic + Career | ❌ | ❌ | ✅ |

### Key Proposed Improvements
- **Academic-focused collaboration** (missing from Facebook and LinkedIn)
- **Department-specific networking** rather than general professional networking
- **Integrated system**: research + jobs + events + feed in ONE platform
- **RBAC model** tailored to academia (student / alumni / admin)

---

## 📐 Architecture Diagrams

See [`docs/`](./docs/) for:
- `soa_diagram.md` — SOA service interaction diagram
- `enterprise_architecture.md` — Enterprise-level roles & module integration
- `product_modularity.md` — Core vs optional module breakdown
- `deployment_diagram.md` — Cloud deployment architecture

---

## 👥 Team
- Department: Computer Science
- Semester: 7
- Course: Advanced Software Architecture

---

## 📜 License
MIT
