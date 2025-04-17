# Task Management Application

A modern task management application built with Next.js, TypeScript, and Prisma. Features include project management, task tracking with Kanban board, and user authentication.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Authentication**: NextAuth.js
- **Drag and Drop**: @atlaskit/pragmatic-drag-and-drop
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ and pnpm installed
- PostgreSQL database
- Git

## Getting Started

1. Clone the repository:
```bash
git clone <repository-url>
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mydb"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Set up the database:
```bash
# Run database migrations
pnpm prisma migrate deploy

# Seed the database
pnpm prisma db seed
```

5. Start the development server:
```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── board/          # Kanban board components
│   ├── tasks/          # Task-related components
│   └── ui/             # UI components
├── lib/                # Utility functions and configurations
└── prisma/             # Prisma schema and migrations
```

## Features

- User authentication (login/register)
- Project management
- Task management with Kanban board
- Task status tracking (To Do, In Progress, Done)
- Due date management
- Responsive design

## Development

### Database

The project uses PostgreSQL with Prisma ORM. The database schema is defined in `prisma/schema.prisma`. To make changes to the database schema:

1. Update the schema file
2. Run migrations:
```bash
pnpm prisma migrate dev
```

### Styling

The project uses Tailwind CSS for styling and Shadcn UI for components. To add new components:

1. Use the Shadcn UI CLI:
```bash
pnpm dlx shadcn-ui@latest add <component-name>
```

2. Or create custom components in the `src/components/ui` directory

### Authentication

Authentication is handled by NextAuth.js. The configuration can be found in `src/lib/auth.ts`.

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

[MIT License](LICENSE)
