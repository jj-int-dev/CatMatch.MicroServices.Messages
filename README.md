# CatMatch Messages Microservice

A real-time messaging microservice for the CatMatch platform, enabling communication between pet adopters and rehomers.

## Overview

This microservice provides a complete messaging solution for the CatMatch application, handling conversations, messages, typing indicators, and read receipts between users looking to adopt cats and those looking to rehome them.

## Features

- 🔐 **Secure Authentication** - Integration with Supabase Auth
- 💬 **Real-time Messaging** - Send and receive messages between adopters and rehomers
- 👁️ **Read Receipts** - Track message read status and timestamps
- ⌨️ **Typing Indicators** - Real-time typing status updates
- 📊 **Conversation Management** - Create and retrieve conversations
- 🔔 **Unread Count** - Track unread messages per user
- 📝 **Comprehensive API Documentation** - Swagger/OpenAPI documentation
  ✅ **Robust Testing** - Unit tests with Vitest (see [TEST_SUMMARY.md](./TEST_SUMMARY.md) for more information)

## Tech Stack

- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Supabase
- **Caching:** Upstash Redis
- **Validation:** Zod
- **Testing:** Vitest
- **API Documentation:** Swagger/OpenAPI

## Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database
- Supabase account
- Redis instance (Upstash)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/jj-int-dev/CatMatch.MicroServices.Messages.git
cd CatMatch.MicroServices.Messages
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables (create a `.env` file based on your configuration):

```env
# Database
DATABASE_URL=your_postgres_connection_string

# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key

# Redis
UPSTASH_REDIS_URL=your_redis_url

# Server
PORT=3000
NODE_ENV=development
AUTHORIZED_CALLER=your_authorized_origin
```

4. Run database migrations:

```bash
npm run db:migrate
```

## Available Scripts

| Script                  | Description                              |
| ----------------------- | ---------------------------------------- |
| `npm run dev`           | Start development server with hot reload |
| `npm run build`         | Compile TypeScript to JavaScript         |
| `npm start`             | Start production server                  |
| `npm test`              | Run unit tests                           |
| `npm run test:watch`    | Run tests in watch mode                  |
| `npm run test:coverage` | Generate test coverage report            |
| `npm run lint`          | Lint code with ESLint                    |
| `npm run db:generate`   | Generate database migrations             |
| `npm run db:migrate`    | Apply database migrations                |
| `npm run db:push`       | Push schema changes to database          |
| `npm run db:studio`     | Open Drizzle Studio                      |

## API Documentation

Once the server is running, access the Swagger documentation at:

```
http://localhost:3000/api-docs
```

### Main Endpoints

- `POST /api/messages/:userId/conversations` - Create a new conversation
- `GET /api/messages/:userId/conversations` - Get user's conversations
- `POST /api/messages/:userId/conversations/:conversationId/messages` - Send a message
- `GET /api/messages/:userId/conversations/:conversationId/messages` - Get messages in a conversation
- `PUT /api/messages/:userId/conversations/:conversationId/read` - Mark messages as read
- `POST /api/messages/:userId/conversations/:conversationId/typing` - Update typing status
- `GET /api/messages/:userId/unread-count` - Get unread message count
- `DELETE /api/messages/:userId/conversations` - Delete user conversations

## Project Structure

```
src/
├── actions/          # Business logic layer
├── commands/         # Command handlers
├── config/           # Configuration files
├── database-migrations/  # Database schema and migrations
├── dtos/            # Data transfer objects
├── routes/          # API route definitions
├── utils/           # Utility functions
└── validators/      # Request and data validators
    ├── database/    # Database validation
    └── requests/    # API request validation

tests/
├── fixtures/        # Test data
├── mocks/          # Mock implementations
└── unit/           # Unit tests
```

## Database Schema

The service manages the following main entities:

- **conversations** - Chat conversations between adopters and rehomers
- **messages** - Individual messages within conversations
- **users** - User information (synced with Supabase Auth)

Key features include:

- Typing indicators with timestamps
- Last active and last read tracking
- Cascade deletion support
- Optimized indexes for queries
