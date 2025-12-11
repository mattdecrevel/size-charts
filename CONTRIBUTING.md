# Contributing to Size Charts

Thank you for your interest in contributing to Size Charts! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Making Changes](#making-changes)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Commit Messages](#commit-messages)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- Git

### Development Setup

1. **Fork the repository**

   Click the "Fork" button on GitHub to create your own copy.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/size-charts.git
   cd size-charts
   ```

3. **Add upstream remote**

   ```bash
   git remote add upstream https://github.com/mattdecrevel/size-charts.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up the database**

   Option A: Using Docker (recommended)
   ```bash
   docker-compose up -d postgres
   ```

   Option B: Local PostgreSQL
   ```bash
   createdb size_charts
   ```

6. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your database URL
   ```

7. **Initialize the database**

   ```bash
   npm run db:push
   npm run db:seed
   ```

8. **Start development server**

   ```bash
   npm run dev
   ```

## Making Changes

### Create a Branch

Create a new branch for your changes:

```bash
git checkout -b feature/my-new-feature
# or
git checkout -b fix/bug-description
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions or changes

### Development Workflow

1. **Make your changes**

2. **Run type checking**
   ```bash
   npm run typecheck
   ```

3. **Run linting**
   ```bash
   npm run lint
   ```

4. **Test your changes manually**
   - Test in the browser
   - Test API endpoints with curl or Postman

5. **Commit your changes**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

## Pull Request Process

1. **Update your fork**

   Before submitting, ensure your fork is up to date:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push your branch**

   ```bash
   git push origin feature/my-new-feature
   ```

3. **Create a Pull Request**

   - Go to GitHub and create a PR from your branch
   - Fill out the PR template completely
   - Link any related issues

4. **PR Requirements**

   - Clear description of changes
   - Screenshots for UI changes
   - No TypeScript errors (`npm run typecheck`)
   - No lint errors (`npm run lint`)
   - Follows commit message conventions

5. **Review Process**

   - Maintainers will review your PR
   - Address any requested changes
   - Once approved, a maintainer will merge

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Avoid `any` types - use proper typing
- Export interfaces/types from `types/` directory

### React

- Use functional components with hooks
- Keep components focused and single-purpose
- Use `"use client"` directive only when necessary

### Styling

- Use Tailwind CSS classes
- Follow existing patterns in the codebase
- Use shadcn/ui components when possible

### API Routes

- Use Zod for request validation
- Return consistent error responses
- Document new endpoints in API docs

### Database

- Use Prisma for all database operations
- Add proper indexes for query performance
- Update seed data when adding new features

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

[optional body]

[optional footer]
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `test` - Test additions or changes
- `chore` - Build process or auxiliary tool changes

### Examples

```bash
feat(api): add label type configuration endpoint
fix(editor): prevent cell overflow on long text
docs(readme): add Docker setup instructions
refactor(hooks): extract common query logic
```

## Project Structure

```
size-charts/
├── app/
│   ├── admin/           # Admin pages
│   ├── api/             # API routes
│   │   ├── v1/          # Public API (versioned)
│   │   └── ...          # Admin API routes
│   └── size-guide/      # Public pages
├── components/
│   ├── admin/           # Admin components
│   └── ui/              # shadcn/ui components
├── hooks/               # React hooks
├── lib/                 # Utilities
├── prisma/              # Database schema & seeds
└── types/               # TypeScript types
```

## Need Help?

- Check existing [issues](https://github.com/mattdecrevel/size-charts/issues)
- Open a [discussion](https://github.com/mattdecrevel/size-charts/discussions)
- Read the [documentation](https://github.com/mattdecrevel/size-charts#readme)

## Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions

Thank you for contributing!
