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
| **Web + Server** (recomendado para dev local) | `npm run dev` |
| Web (Vite) | `npm run dev:web` |
| Server | `npm run dev:server` |
| Mobile (Expo) | `npm run start -w mobile` |

**Importante:** Para criar salas e usar a API, o servidor precisa estar rodando. Use `npm run dev` para iniciar web e servidor juntos.

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

- **Web:** `VITE_API_URL` — API base URL (default: `http://localhost:3033`)
- **Mobile:** `EXPO_PUBLIC_API_URL` — API base URL
  - **Emulador Android:** `http://10.0.2.2:3033` (padrão)
  - **Simulador iOS:** `http://localhost:3033` (padrão)
  - **Dispositivo físico:** Use o IP do seu PC na mesma rede, ex: `http://192.168.1.100:3033`
    ```bash
    # Windows (PowerShell)
    $env:EXPO_PUBLIC_API_URL="http://192.168.1.100:3033"; npm run start -w mobile
    ```
    Descubra seu IP com `ipconfig` (Windows) ou `ifconfig` (Mac/Linux).
- **Server:** `PORT` — Server port (default: `3033`)

**Importante:** O servidor deve estar rodando (`npm run dev -w server`) antes de usar o app mobile.

## Testar online com Ngrok (um único túnel)

Para compartilhar com amigos usando **apenas um túnel Ngrok**:

1. **Build e serve** (web + API no mesmo processo, porta 3033):
   ```bash
   npm run serve
   ```

2. **Exponha com Ngrok:**
   ```bash
   ngrok http 3033
   ```

3. **Compartilhe a URL** do Ngrok com os amigos (ex: `https://xxx.ngrok-free.app`).

O comando `serve` faz build do web app (com API em same-origin), build do server e inicia tudo na porta 3033. O Ngrok expõe essa porta — web e API funcionam pela mesma URL.
