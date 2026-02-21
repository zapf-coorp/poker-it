# Poker Plan It

A collaborative Planning Poker web application for agile teams to estimate tasks. Built with React (web), Expo (mobile), and a shared TypeScript backend.

## Documentation

- **[Product Spec](drivin-design/spec.MD)** — Product vision, user stories, and success criteria
- **[Quickstart](drivin-design/quickstart.MD)** — Stack, versions, and commands
- **[Tasks](drivin-design/tasks.MD)** — Implementation tasks by phase

## Quick Start

### Prerequisites

- Node.js 20 LTS or 22+ (LTS)
- npm 10+

### Install

```bash
npm install
npm run build -w shared
```

Build the shared package once before running web or mobile.

### Run

| App | Command |
|-----|---------|
| Web (Vite) | `npm run dev -w web` |
| Mobile (Expo) | `npm run start -w mobile` |
| Server | `npm run dev -w server` |

### Typecheck

```bash
npm run typecheck -w shared
```

## Project Structure

```
poker-plan-it/
├── apps/
│   ├── web/           # React (Vite) web app
│   └── mobile/        # Expo (React Native) mobile app
├── packages/
│   └── shared/        # Shared types, API client, business rules
├── server/            # Node.js backend (Express)
└── drivin-design/     # Spec and configuration
```

## Environment

- **Web:** `VITE_API_URL` — API base URL (default: `http://localhost:3000`)
- **Mobile:** `EXPO_PUBLIC_API_URL` — API base URL (default: `http://localhost:3000`)
- **Server:** `PORT` — Server port (default: `3000`)
