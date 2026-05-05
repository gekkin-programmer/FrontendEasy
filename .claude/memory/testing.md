# Testing & CI Logic — Jest 30 & Playwright

## Unit Testing (Jest)
- **Rule 1:** Mock ALL constructor dependencies in `createTestingModule`.
- **Rule 2:** Use `mockResolvedValue` inside individual tests to avoid state leakage.
- **Mocking BullMQ:** ```typescript
  { provide: getQueueToken('queue-name'), useValue: { add: jest.fn() } }

  Uninstalled Packages: @google/generative-ai is mocked via src/__mocks__/google-generative-ai.ts using moduleNameMapper in package.json.

E2E Testing (Playwright)
Located in e2e/.

Excluded from Jest: Ensure testPathIgnorePatterns: ['<rootDir>/e2e/'] is in Jest config to prevent crashes.

CI/CD Pipeline (GitHub Actions)
Workflow: pnpm lint -> pnpm test -> pnpm build.

ESLint in CI: Strict on react/no-unescaped-entities and @typescript-eslint/no-require-imports.

Deployment: Successful build on dev branch auto-pushes to main, triggering Dokploy autodeploy.

Common Pitfalls
Optional Catch Binding: Use catch { instead of catch (e) to satisfy no-unused-vars.

Prisma Generation: Always run pnpm prisma generate before running tests if the schema changed.

Docker Build: The Dockerfile uses corepack enable pnpm to ensure the build step can find the correct package manager.