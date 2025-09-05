# Release System Implementation Plan

## Overview
Step-by-step plan to implement automated releases for SDSA knowledge content using GitHub Actions.

## Prerequisites
- [ ] GitHub repository: `eugene-taran/sdsa.team`
- [ ] Write access to create releases
- [ ] Node.js for release scripts

## Implementation Steps

### Phase 1: Basic Structure

#### 1. Create Knowledge Folder Structure
```bash
mkdir -p knowledge/blocks
mkdir -p knowledge/resources
mkdir -p .github/workflows
mkdir -p scripts
```

#### 2. Create Initial Knowledge Content
```bash
# Create first knowledge block
cat > knowledge/blocks/e2e-testing.yaml << 'EOF'
id: 'e2e-testing'
title: 'End-to-End Testing Setup'
initial_question: 'Do you have an existing test system?'
paths:
  yes:
    question: 'Which framework?'
    options: ['cypress', 'playwright', 'other']
    resources: ['e2e-guide.md']
  no:
    resources: ['getting-started.md']
EOF

# Create catalog
cat > knowledge/catalog.json << 'EOF'
{
  "version": "1.0.0",
  "topics": [
    {
      "id": "e2e-testing",
      "title": "End-to-End Testing",
      "description": "Set up E2E testing",
      "blockId": "e2e-testing"
    }
  ]
}
EOF

# Create initial manifest
cat > knowledge/manifest.json << 'EOF'
{
  "version": "2024.12.15.0",
  "released": "2024-12-15T00:00:00Z",
  "size": "10KB",
  "blocks": {
    "e2e-testing": {
      "version": "1.0.0"
    }
  }
}
EOF
```

#### 3. Create Simple GitHub Action
```yaml
# .github/workflows/release.yml
name: Release Knowledge Content

on:
  push:
    branches: [main]
    paths:
      - 'knowledge/**'
      - '!knowledge/manifest.json'

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Generate version
        id: version
        run: |
          DATE=$(date +%Y.%m.%d)
          echo "version=${DATE}.0" >> $GITHUB_OUTPUT
      
      - name: Create bundle
        run: |
          cd knowledge
          zip -r ../knowledge-bundle.zip .
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ steps.version.outputs.version }}
          files: knowledge-bundle.zip
```

### Phase 2: Version Management

#### 4. Create Version Bump Script
```javascript
// scripts/bump-version.js
const fs = require('fs');
const path = require('path');

function generateVersion() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Check existing versions for today
  const baseVersion = `${year}.${month}.${day}`;
  // In real implementation, check git tags
  
  return `${baseVersion}.0`;
}

const version = generateVersion();
console.log(version);
```

#### 5. Update Manifest Automatically
```javascript
// scripts/update-manifest.js
const fs = require('fs');

const version = process.argv[2];
const manifestPath = 'knowledge/manifest.json';

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.version = version;
manifest.released = new Date().toISOString();

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
```

### Phase 3: Checksums & Validation

#### 6. Add Checksum Generation
```javascript
// scripts/generate-checksums.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function getChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function generateChecksums(dir) {
  const checksums = {};
  
  function walk(currentDir, prefix = '') {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const filePath = path.join(currentDir, file);
      const relativePath = path.join(prefix, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        walk(filePath, relativePath);
      } else if (file !== 'manifest.json') {
        checksums[relativePath] = getChecksum(filePath);
      }
    });
  }
  
  walk(dir);
  return checksums;
}

const checksums = generateChecksums('knowledge');
console.log(JSON.stringify(checksums, null, 2));
```

#### 7. Add YAML Validation
```yaml
# .github/workflows/validate.yml
name: Validate Knowledge Content

on:
  pull_request:
    paths:
      - 'knowledge/**'

jobs:
  validate:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install js-yaml ajv
      
      - name: Validate YAML files
        run: |
          for file in knowledge/blocks/*.yaml; do
            node -e "
              const yaml = require('js-yaml');
              const fs = require('fs');
              try {
                yaml.load(fs.readFileSync('$file', 'utf8'));
                console.log('✓ $file');
              } catch (e) {
                console.error('✗ $file:', e.message);
                process.exit(1);
              }
            "
          done
      
      - name: Validate catalog.json
        run: |
          node -e "
            const catalog = require('./knowledge/catalog.json');
            if (!catalog.topics || !Array.isArray(catalog.topics)) {
              console.error('Invalid catalog structure');
              process.exit(1);
            }
            console.log('✓ Catalog valid');
          "
```

### Phase 4: Advanced Features

#### 8. Enhanced Release Workflow
```yaml
# .github/workflows/release-enhanced.yml
name: Enhanced Release

on:
  push:
    branches: [main]
    paths:
      - 'knowledge/**'
      - '!knowledge/manifest.json'

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Get changed files
        id: changed
        uses: tj-actions/changed-files@v40
        with:
          files: knowledge/**
      
      - name: Generate version
        id: version
        run: |
          DATE=$(date +%Y.%m.%d)
          LAST_TAG=$(git tag -l "${DATE}.*" | sort -V | tail -n1 || echo "")
          
          if [ -z "$LAST_TAG" ]; then
            VERSION="${DATE}.0"
          else
            PATCH=$(echo $LAST_TAG | cut -d. -f4)
            VERSION="${DATE}.$((PATCH + 1))"
          fi
          
          echo "version=${VERSION}" >> $GITHUB_OUTPUT
      
      - name: Update manifest
        run: |
          node scripts/update-manifest.js ${{ steps.version.outputs.version }}
          
          # Generate checksums
          CHECKSUMS=$(node scripts/generate-checksums.js)
          
          # Add checksums to manifest
          node -e "
            const fs = require('fs');
            const manifest = JSON.parse(fs.readFileSync('knowledge/manifest.json'));
            manifest.checksums = ${CHECKSUMS};
            fs.writeFileSync('knowledge/manifest.json', JSON.stringify(manifest, null, 2));
          "
      
      - name: Commit manifest
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add knowledge/manifest.json
          git commit -m "chore: update manifest for v${{ steps.version.outputs.version }}"
          git push
      
      - name: Create bundles
        run: |
          cd knowledge
          tar -czf ../knowledge-bundle-${{ steps.version.outputs.version }}.tar.gz .
          zip -r ../knowledge-bundle-${{ steps.version.outputs.version }}.zip .
      
      - name: Generate changelog
        run: |
          echo "## Changes in v${{ steps.version.outputs.version }}" > CHANGELOG.md
          echo "" >> CHANGELOG.md
          echo "### Modified files:" >> CHANGELOG.md
          echo "${{ steps.changed.outputs.all_changed_files }}" | tr ' ' '\n' | sed 's/^/- /' >> CHANGELOG.md
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ steps.version.outputs.version }}
          name: Knowledge Content v${{ steps.version.outputs.version }}
          body_path: CHANGELOG.md
          files: |
            knowledge-bundle-*.tar.gz
            knowledge-bundle-*.zip
```

#### 9. Add Rollback Capability
```yaml
# .github/workflows/rollback.yml
name: Rollback Release

on:
  workflow_dispatch:
    inputs:
      version:
        description: 'Version to rollback to'
        required: true

jobs:
  rollback:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          ref: v${{ github.event.inputs.version }}
      
      - name: Restore manifest
        run: |
          cp knowledge/manifest.json /tmp/manifest.json
          
          git checkout main
          cp /tmp/manifest.json knowledge/manifest.json
          
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add knowledge/manifest.json
          git commit -m "chore: rollback to v${{ github.event.inputs.version }}"
          git push
```

### Phase 5: Testing & Monitoring

#### 10. Add Health Checks
```yaml
# .github/workflows/health-check.yml
name: Release Health Check

on:
  release:
    types: [published]
  schedule:
    - cron: '0 */6 * * *'

jobs:
  check:
    runs-on: ubuntu-latest
    
    steps:
      - name: Check manifest
        run: |
          curl -f https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json
      
      - name: Validate manifest structure
        run: |
          curl -s https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json | \
          jq -e '.version and .released and .size'
      
      - name: Test bundle download
        run: |
          curl -f -L -o /tmp/bundle.zip \
            https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.zip
          
          unzip -t /tmp/bundle.zip
      
      - name: Report status
        if: failure()
        run: |
          # Send alert (webhook, email, etc.)
          echo "Health check failed!"
```

## Deployment Checklist

### Before First Release
- [ ] Test GitHub Action locally with `act`
- [ ] Verify repository permissions
- [ ] Create initial knowledge content
- [ ] Test bundle creation
- [ ] Verify download URLs work

### First Release
1. Push initial knowledge content to main
2. Watch GitHub Actions run
3. Verify release created
4. Test download from release page
5. Check manifest is updated

### Ongoing Maintenance
- [ ] Monitor release success rate
- [ ] Check bundle sizes stay reasonable
- [ ] Validate content before merge
- [ ] Keep changelog updated
- [ ] Regular health checks

## Testing Strategy

### Local Testing
```bash
# Test version generation
node scripts/bump-version.js

# Test manifest update
node scripts/update-manifest.js 2024.12.15.0

# Test checksum generation
node scripts/generate-checksums.js

# Test GitHub Action locally
act push --secret GITHUB_TOKEN=$GITHUB_TOKEN
```

### Integration Testing
```bash
# Create test branch
git checkout -b test-release

# Make changes
echo "test" > knowledge/test.txt

# Push and verify action runs
git add .
git commit -m "test: release workflow"
git push origin test-release
```

## Troubleshooting

### Common Issues

#### 1. Action doesn't trigger
- Check paths filter in workflow
- Verify branch name matches
- Check GitHub Actions is enabled

#### 2. Release creation fails
- Check GITHUB_TOKEN permissions
- Verify tag doesn't already exist
- Check file paths are correct

#### 3. Manifest conflicts
- Use force push for manifest updates
- Consider separate manifest branch
- Add retry logic

## Success Metrics

### Release Health
- ✅ < 5 minute release time
- ✅ 100% success rate
- ✅ < 1MB bundle size
- ✅ Zero downtime

### Content Quality
- ✅ All YAML validates
- ✅ All resources exist
- ✅ Checksums match
- ✅ Version increments correctly

## Implementation Order

| Phase | Tasks | Outcome |
|-------|-------|---------|
| 1 | Basic structure, simple action | Manual releases work |
| 2 | Version management | Auto-versioning |
| 3 | Checksums, validation | Content integrity |
| 4 | Enhanced workflow | Full automation |
| 5 | Testing, monitoring | Production ready |

## Next Steps

After implementation:
1. Document release process
2. Train team on workflow
3. Set up monitoring dashboard
4. Plan enhancement roadmap
5. Gather feedback from app team