# AIListify

A production-ready AI tools directory built with Next.js 15, TypeScript, Tailwind CSS, Shadcn UI, Prisma, PostgreSQL, and Auth.js.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 + Shadcn UI
- **Database:** PostgreSQL (Neon) + Prisma ORM
- **Auth:** Auth.js (NextAuth v5)
- **Forms:** React Hook Form + Zod
- **Data Fetching:** Server Actions

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (recommend [Neon](https://neon.tech))

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your database URL, auth secret, and optional OAuth credentials.

3. **Set up the database**

   ```bash
   npm run db:push
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command              | Description                                     |
| -------------------- | ----------------------------------------------- |
| `npm run dev`        | Start development server                        |
| `npm run build`      | Generate Prisma client and build for production |
| `npm run start`      | Start production server                         |
| `npm run lint`       | Run ESLint                                      |
| `npm run format`     | Format code with Prettier                       |
| `npm run db:migrate` | Run Prisma migrations                           |
| `npm run db:push`    | Push schema to database                         |
| `npm run db:studio`  | Open Prisma Studio                              |

## Project Structure

```
src/
├── app/              # Next.js App Router pages & API routes
├── components/
│   ├── ui/           # Shadcn UI primitives
│   ├── layout/       # Header, footer, main layout
│   ├── shared/       # Reusable shared components
│   └── tools/        # Tool-specific components
├── actions/          # Server Actions
├── lib/              # Utilities, auth, prisma, metadata
├── hooks/            # Custom React hooks
├── services/         # Data access layer
├── types/            # TypeScript type definitions
├── constants/        # App constants
├── validations/      # Zod schemas
└── prisma/           # Prisma schema & migrations
```

## Environment Variables

See `.env.example` for all required variables.

## License

MIT
