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
- **Mobile:** `EXPO_PUBLIC_API_URL` — API base URL
  - **Emulador Android:** `http://10.0.2.2:3000` (padrão)
  - **Simulador iOS:** `http://localhost:3000` (padrão)
  - **Dispositivo físico:** Use o IP do seu PC na mesma rede, ex: `http://192.168.1.100:3000`
    ```bash
    # Windows (PowerShell)
    $env:EXPO_PUBLIC_API_URL="http://192.168.1.100:3000"; npm run start -w mobile
    ```
    Descubra seu IP com `ipconfig` (Windows) ou `ifconfig` (Mac/Linux).
- **Server:** `PORT` — Server port (default: `3000`)

**Importante:** O servidor deve estar rodando (`npm run dev -w server`) antes de usar o app mobile.
