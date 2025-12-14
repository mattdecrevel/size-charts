# Code Review

Review the recent changes for potential issues.

## Instructions

1. Run `git diff HEAD~1` to see recent changes (or use provided commit range)
2. Check for:
   - Security vulnerabilities (SQL injection, XSS, etc.)
   - Performance issues (N+1 queries, unnecessary re-renders)
   - Type safety issues
   - Missing error handling
   - Code style inconsistencies
   - Missing tests for new functionality
3. Provide feedback organized by severity (critical, warning, suggestion)
4. Include file paths and line numbers for each issue

Be thorough but constructive. Focus on actionable feedback.
