# Cypress Modern Setup Guide

## Overview
This guide covers setting up Cypress v13+ with best practices for modern web applications.

## Installation

```bash
npm install --save-dev cypress@latest
```

## Configuration

Create `cypress.config.js`:

```javascript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
```

## Project Structure

```
cypress/
├── e2e/              # Test files
├── fixtures/         # Test data
├── support/          # Helper functions
│   ├── commands.js   # Custom commands
│   └── e2e.js       # Global configuration
└── downloads/        # Downloaded files during tests
```

## Best Practices

1. **Use data attributes for selectors**
   ```javascript
   cy.get('[data-cy="submit-button"]').click();
   ```

2. **Avoid hard-coded waits**
   ```javascript
   // Bad
   cy.wait(3000);
   
   // Good
   cy.get('[data-cy="loading"]').should('not.exist');
   ```

3. **Use aliases for requests**
   ```javascript
   cy.intercept('GET', '/api/users').as('getUsers');
   cy.wait('@getUsers');
   ```

## Running Tests

```bash
# Open Cypress Test Runner
npx cypress open

# Run tests headlessly
npx cypress run

# Run specific test file
npx cypress run --spec "cypress/e2e/login.cy.js"
```

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Run E2E tests
  uses: cypress-io/github-action@v6
  with:
    start: npm start
    wait-on: 'http://localhost:3000'
```

## Common Issues

### Issue: Tests are flaky
**Solution**: Use proper wait strategies and retry mechanisms

### Issue: Slow test execution
**Solution**: Run tests in parallel using Cypress Cloud

## Next Steps
- Set up component testing
- Configure Cypress Cloud for parallel execution
- Add visual regression testing

---
*Author: eugene-taran | Last updated: 2024-12-15*