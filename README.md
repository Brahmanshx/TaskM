# Taskify — Intelligent Task & Goal Management

A production-ready MERN stack application that connects long-term vision with daily execution using intelligent prioritization, structured planning, and automated notifications.

## Quick Start

### Prerequisites
- **Node.js** v18+
- **MongoDB** (local or Atlas)

### Backend Setup
```bash
cd backend
npm install
# Edit .env with your MongoDB URI and email credentials
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173` with the API on port `5000`.

## Environment Variables (backend/.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/taskify
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
OTP_EXPIRY_MINUTES=10
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Taskify <your-email@gmail.com>
NODE_ENV=development
```

> **Dev Mode**: If email isn't configured, OTP codes are logged to the server console.

## Features

### Authentication
- Email OTP-based (no passwords)
- JWT session management
- Rate-limited OTP requests

### 3-Tier Goal Hierarchy
- **Vision Layer** — Long-term goals (months/years)
- **Planning Layer** — Short-term goals (weeks/months)
- **Execution Layer** — Day-to-day tasks

### Intelligent Task Prioritization
```
priorityScore = (urgency × 0.4) + (importance × 0.3) + (goalImpact × 0.2) − (effort × 0.1)
```

### Additional Features
- 📊 Analytics dashboard with charts
- 🔥 Streak tracking
- ⏰ Time blocking
- 🔄 Recurring tasks (daily/weekly)
- 📧 Email notifications (reminders, daily summaries)
- 💡 Smart task suggestions

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS v4 |
| Backend | Node.js, Express 5, Mongoose 9 |
| Database | MongoDB |
| Charts | Recharts |
| Email | Nodemailer |
| Scheduling | node-cron |
