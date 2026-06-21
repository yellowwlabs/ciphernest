# 🪺 Cipher Nest

Cipher Nest is a modern, high-performance TypeScript monorepo template built with **pnpm Workspaces** and **Turborepo**. It features a full-stack architecture comprising a Next.js frontend, a Fastify API backend, a BullMQ background worker, and a Drizzle ORM database package.

---

## 🏗️ Project Architecture

```mermaid
graph TD
    subgraph Apps ["apps/"]
        Web["💻 web (Next.js)"]
        API["🔌 api (Fastify)"]
        Worker["⚙️ worker (BullMQ)"]
    end

    subgraph Packages ["packages/"]
        DB["🗄️ db (Drizzle ORM)"]
    end

    Web -->|HTTP / WebSockets| API
    API -->|Enqueues Jobs| Worker
    API -->|Queries/Mutations| DB
    Worker -->|Queries/Mutations| DB
    Worker -.->|Redis Queue| API
```

### Modules Breakdown
- **[`apps/web`](file:///Users/samarthhhh/Documents/yellowlabs/cipher-nest/apps/web)**: Frontend web client using Next.js 16 (App Router), React 19, and Tailwind CSS v4.
- **[`apps/api`](file:///Users/samarthhhh/Documents/yellowlabs/cipher-nest/apps/api)**: High-speed, low-overhead Fastify API backend with TypeScript, WebSocket integration, and JWT verification.
- **[`apps/worker`](file:///Users/samarthhhh/Documents/yellowlabs/cipher-nest/apps/worker)**: Distributed background job worker powered by BullMQ and Redis.
- **[`packages/db`](file:///Users/samarthhhh/Documents/yellowlabs/cipher-nest/packages/db)**: Database layer using Drizzle ORM and `postgres.js` to interface with PostgreSQL.

---

## 🛠️ Tech Stack

- **Monorepo Manager**: [pnpm Workspaces](https://pnpm.io/workspaces)
- **Build System**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js](https://nextjs.org/) (React 19, Tailwind CSS v4)
- **Backend API**: [Fastify](https://fastify.dev/) (WebSockets, JWT, Zod)
- **Task Queue**: [BullMQ](https://bullmq.io/) & Redis
- **ORM & DB**: [Drizzle ORM](https://orm.drizzle.team/) & PostgreSQL
- **Linter & Formatter**: [Biome](https://biomejs.dev/)

---

## 🚦 Getting Started

### Prerequisites

Ensure you have the following installed locally:
- [Node.js](https://nodejs.org/) (v20+ recommended)
- [pnpm](https://pnpm.io/) (v11+ recommended)
- [PostgreSQL](https://www.postgresql.org/) database
- [Redis](https://redis.io/) server (required for BullMQ queue management)

### Installation

Clone the repository and install all dependencies in the root directory:

```bash
pnpm install
```

### Environment Configuration

Configure your environment variables before running the services.

1. **Database Module (`packages/db`)**:
   Create a `.env` file or export the variable:
   ```env
   DATABASE_URL=postgres://username:password@localhost:5432/cipher_nest
   ```

2. **API Backend (`apps/api`)**:
   Configure JWT secrets and other credentials as required by Fastify dependencies.

---

## 💻 Development Commands

The workspace relies on Turborepo to run commands across all packages concurrently and efficiently.

| Action | Command | Description |
| :--- | :--- | :--- |
| **Start Development** | `pnpm dev` | Runs development servers for Web, API, and Worker |
| **Production Build** | `pnpm build` | Compiles and builds all apps and packages |
| **Run Linter** | `pnpm lint` | Lints files across the repo using Biome |
| **Auto-Format Code** | `pnpm format` | Formats codebase using Biome rules |
| **Type Check** | `pnpm typecheck` | Checks TypeScript compilation without emitting output |

---

## 📦 Directory Structure

```
cipher-nest/
├── apps/
│   ├── api/            # Fastify REST/WebSocket server
│   ├── web/            # Next.js web application
│   └── worker/         # BullMQ queue processor
├── packages/
│   └── db/             # Drizzle database client & user schema
├── package.json        # Workspace configuration
├── pnpm-workspace.yaml # Workspace definitions
├── turbo.json          # Turborepo task pipeline configuration
└── biome.json          # Unified formatter & linter rules
```

## 🔒 Security & Code Quality

- **Linting & Formatting**: Enforced with Biome. Use `pnpm format` to automatically apply recommendations.
- **Type Safety**: Strictly typed with TypeScript across both apps and packages.
