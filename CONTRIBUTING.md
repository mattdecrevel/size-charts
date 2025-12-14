# Contributing to Size Charts

Thank you for your interest in contributing to Size Charts! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/size-charts.git`
3. Install dependencies: `npm install`
4. Set up your database (see README.md)
5. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Set up database
npm run db:push
npm run db:seed

# Start development server
npm run dev
```

## Code Style

- Use TypeScript for all new code
- Follow existing code patterns and conventions
- Use meaningful variable and function names
- Add comments for complex logic

## Commit Messages

We follow conventional commits:

- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

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

- A clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Your environment (OS, Node version, etc.)

## Feature Requests

Feature requests are welcome! Please:

- Check existing issues first
- Describe the use case
- Explain why it would be useful

## Testing

```bash
# Run unit tests
npm run test:run

# Run with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## Questions?

Feel free to open a discussion on GitHub if you have questions about contributing.

Thank you for contributing!
