# Playwright Parallel Execution Setup

## Why Parallel Execution?

Running tests in parallel can reduce your test suite execution time by 70-90%. Playwright makes this easy with built-in support for parallel execution.

## Configuration

### Basic Parallel Setup

Update `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  // Run tests in parallel
  workers: process.env.CI ? 2 : 4,
  
  // Parallelize tests within a single file
  fullyParallel: true,
  
  // Retry failed tests
  retries: process.env.CI ? 2 : 0,
  
  // Reporter configuration
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results.json' }],
  ],
});
```

## Sharding for CI/CD

Split tests across multiple machines:

```bash
# Machine 1
npx playwright test --shard=1/3

# Machine 2  
npx playwright test --shard=2/3

# Machine 3
npx playwright test --shard=3/3
```

### GitHub Actions Parallel Jobs

```yaml
name: Playwright Tests
on: [push]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        shard: [1, 2, 3]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test --shard=${{ matrix.shard }}/3
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report-${{ matrix.shard }}
          path: playwright-report/
```

## Best Practices for Parallel Tests

### 1. Test Isolation

Each test should be independent:

```typescript
test.describe('User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Fresh state for each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('create user', async ({ page }) => {
    // Test implementation
  });
});
```

### 2. Avoid Shared State

```typescript
// Bad - shares state
let userId;

test('create user', async () => {
  userId = await createUser();
});

test('delete user', async () => {
  await deleteUser(userId); // Fails in parallel
});

// Good - independent tests
test('create and delete user', async () => {
  const userId = await createUser();
  await deleteUser(userId);
});
```

### 3. Use Test Fixtures

```typescript
import { test as base } from '@playwright/test';

const test = base.extend({
  testUser: async ({ page }, use) => {
    const user = await createTestUser();
    await use(user);
    await deleteTestUser(user);
  },
});

test('user can login', async ({ page, testUser }) => {
  await page.fill('#email', testUser.email);
  await page.fill('#password', testUser.password);
  await page.click('#login');
});
```

## Performance Optimization

### 1. Smart Test Distribution

```typescript
// Group related tests
test.describe.configure({ mode: 'serial' });

test.describe('Checkout flow', () => {
  test('add to cart', async ({ page }) => {});
  test('proceed to checkout', async ({ page }) => {});
  test('complete purchase', async ({ page }) => {});
});
```

### 2. Resource Management

```typescript
export default defineConfig({
  use: {
    // Reuse context for faster execution
    launchOptions: {
      args: ['--disable-dev-shm-usage'],
    },
    
    // Limit video recording
    video: process.env.CI ? 'retain-on-failure' : 'off',
  },
});
```

## Monitoring & Reporting

### Merge Reports from Shards

```bash
# Merge HTML reports
npx playwright merge-reports --reporter html ./all-reports
```

### Track Metrics

- Test execution time per shard
- Failure rate by parallel degree
- Resource utilization

## Troubleshooting

### Issue: Tests fail only in parallel
**Solution**: Check for shared state, race conditions, or resource conflicts

### Issue: Out of memory errors
**Solution**: Reduce worker count or increase system resources

### Issue: Flaky tests increase
**Solution**: Add proper wait conditions and increase test isolation

---
*Author: eugene-taran | Last updated: 2024-12-15*