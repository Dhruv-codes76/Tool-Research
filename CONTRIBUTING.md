# Contributing to Flexizones (AI-Tool-Search)

Thank you for your interest in contributing to our project! This document provides all the necessary details to set up the project locally, run the development environment, and make your first contribution.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Docker** & **Docker Compose** (required for the local Postgres database)
- **Git**

## Getting Started

### 1. Clone the Repository

First, clone the repository to your local machine and navigate into the `tools-section` directory:

```bash
git clone https://github.com/Dhruv-codes76/Tool-Research-.git
cd AI-Tool-Search/tools-section
```

### 2. Install Dependencies

Install the required Node.js packages using npm:

```bash
npm install
```

### 3. Environment Variables Setup

You need to set up your environment variables for the application to function correctly. 

Copy the example environment file to create your local `.env` file:

```bash
cp .env.example .env
```

Open the `.env` file and fill in the necessary values. You will need configuration details for:
- Database (Postgres URI)
- Supabase (URL and Keys)
- Sanity (Project ID, Dataset, Token)
- Any other service integrations mentioned in `.env.example`

*Note: For the local database URL, use the credentials specified in the docker-compose file (e.g., `postgresql://postgres:postgres@localhost:54322/tools_db`).*

### 4. Database Setup (Docker)

We use Docker to run a local instance of PostgreSQL.

Start the database container in the background:
```bash
docker-compose up -d
```
*(You can stop the database later using `docker-compose down`)*

Once the database is running, push the Prisma schema to synchronize the database structure and generate the Prisma Client:
```bash
npx prisma generate
npx prisma db push
```

*(Optional)* If the project contains seed data, populate the database:
```bash
npx prisma db seed
```

### 5. Running the Application

Start the local development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Development Guidelines

### Code Style and Linting
We use ESLint for code quality and consistency. Before submitting any changes, ensure your code passes the linting checks:
```bash
npm run lint
```
Fix any errors or warnings reported by the linter.

### Making Changes
1. Create a new branch for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes and commit them with descriptive messages.
3. Push your branch to the remote repository.
4. Open a Pull Request (PR) against the `main` branch.

### Architecture Notes
- **Next.js App Router**: This project uses the modern Next.js App Router (`src/app`).
- **Prisma**: Used as the ORM. Schema modifications should be done in `prisma/schema.prisma`.
- **UI Components**: Placed in `src/components/ui/` and styled with Tailwind CSS.

---
We appreciate your contributions! If you encounter any issues during setup, feel free to open an issue or reach out to the maintainers.
