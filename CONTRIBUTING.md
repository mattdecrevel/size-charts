# Contributing to Size Charts

Thank you for your interest in contributing to Size Charts! This document provides guidelines and instructions for contributing.

## Branch Strategy

We use a two-branch workflow:

| Branch | Purpose | Deploys To |
|--------|---------|------------|
| `main` | Development branch. All PRs target this branch. | Preview/Staging |
| `production` | Production releases. Only release PRs merge here. | Production |

**Workflow:**
1. Create feature branches from `main`
2. Open PRs against `main`
3. After review and merge, changes go to staging
4. When ready to release, create a Release PR from `main` → `production`

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/size-charts.git`
3. Install dependencies: `npm install`
4. Set up your database (see README.md)
5. Create a branch from `main`: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Set up database (push schema and seed data)
npx prisma db push
npm run db:seed

# Start development server
npm run dev
```

## Code Style

-  Use TypeScript for all new code
-  Follow existing code patterns and conventions
-  Use meaningful variable and function names
-  Add comments for complex logic

## Commit Messages

We follow conventional commits:

-  `feat:` New features
-  `fix:` Bug fixes
-  `docs:` Documentation changes
-  `style:` Code style changes (formatting, etc.)
-  `refactor:` Code refactoring
-  `test:` Adding or updating tests
-  `chore:` Maintenance tasks

Example: `feat: add bulk import functionality`

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all tests pass: `npm run test:run`
4. Ensure build passes: `npm run build`
5. Update the README.md if needed
6. Submit your PR with a clear description

## Reporting Issues

When reporting issues, please include:

-  A clear description of the problem
-  Steps to reproduce
-  Expected vs actual behavior
-  Your environment (OS, Node version, etc.)

## Feature Requests

Feature requests are welcome! Please:

-  Check existing issues first
-  Describe the use case
-  Explain why it would be useful

## Testing

```bash
# Run unit tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Release Process

Releases are created by merging `main` into `production`. This triggers automatic version tagging and GitHub release creation.

### Creating a Release

**Option 1: Manual PR**
```bash
# Ensure main is up to date
git checkout main
git pull origin main

# Create release PR
gh pr create --base production --head main --title "Release vX.Y.Z"
```

**Option 2: Automated Workflow** (recommended)
1. Go to Actions → "Create Release PR"
2. Click "Run workflow"
3. Select version bump type (patch/minor/major)
4. Review and merge the created PR

### Version Bumping

We follow [Semantic Versioning](https://semver.org/):

- **patch** (1.0.0 → 1.0.1): Bug fixes, minor changes
- **minor** (1.0.0 → 1.1.0): New features, backward compatible
- **major** (1.0.0 → 2.0.0): Breaking changes

The release workflow auto-detects version bump from commit messages:
- `feat:` commits → minor bump
- `fix:` commits → patch bump
- `BREAKING CHANGE` or `feat!:` → major bump

### After Release

Once the PR is merged to `production`:
1. A git tag is automatically created (e.g., `v1.2.0`)
2. A GitHub Release is created with auto-generated changelog
3. Vercel deploys the production branch to the live site

## Questions?

Feel free to open a discussion on GitHub if you have questions about contributing.

Thank you for contributing!
