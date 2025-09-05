# Knowledge Content Release Strategy

## Overview

Automated release system for SDSA knowledge trees using GitHub Actions and semantic versioning. When content changes in the `knowledge/` folder, a new version is automatically released.

## Repository Structure

```
sdsa.team/
├── knowledge/                # ← WATCHED FOLDER (triggers releases)
│   ├── manifest.json        # Version manifest (auto-updated)
│   ├── catalog.json         # Topics catalog
│   ├── blocks/              # Knowledge tree YAML files
│   │   ├── e2e-testing.yaml
│   │   ├── react-setup.yaml
│   │   └── ...
│   └── resources/           # Markdown resources
│       ├── getting-started.md
│       └── ...
├── .github/
│   └── workflows/
│       └── release.yml      # GitHub Action for releases
├── scripts/
│   └── prepare-release.js  # Version bump & manifest update
└── docs/
    └── release-strategy.md  # This file

```

## Version Strategy

### Version Format
```
YYYY.MM.DD.PATCH
```
- **YYYY.MM.DD** - Date of release (e.g., 2024.12.15)
- **PATCH** - Incremental number for multiple releases same day (starts at 0)

Examples:
- `2024.12.15.0` - First release on Dec 15, 2024
- `2024.12.15.1` - Second release same day
- `2024.12.16.0` - First release next day

### Manifest File (`knowledge/manifest.json`)
```json
{
  "version": "2024.12.15.0",
  "released": "2024-12-15T14:30:00Z",
  "changelog": "Added Docker setup guide, fixed React Native typos",
  "size": "245KB",
  "checksums": {
    "catalog": "sha256:abc123...",
    "blocks/e2e-testing.yaml": "sha256:def456...",
    "blocks/react-setup.yaml": "sha256:ghi789..."
  },
  "blocks": {
    "e2e-testing": {
      "version": "1.2.0",
      "updated": "2024-12-15T14:30:00Z"
    },
    "react-setup": {
      "version": "1.0.0",
      "updated": "2024-12-10T10:00:00Z"
    }
  }
}
```

## GitHub Action Workflow

### `.github/workflows/release.yml`
```yaml
name: Release Knowledge Content

on:
  push:
    branches: [main]
    paths:
      - 'knowledge/**'
      - '!knowledge/manifest.json'  # Don't trigger on manifest updates

jobs:
  release:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # Full history for changelog
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Get changed files
        id: changed-files
        uses: tj-actions/changed-files@v40
        with:
          files: knowledge/**
          files_ignore: knowledge/manifest.json
      
      - name: Generate version
        id: version
        run: |
          DATE=$(date +%Y.%m.%d)
          # Check if we already released today
          LAST_TAG=$(git tag -l "${DATE}.*" | sort -V | tail -n1)
          if [ -z "$LAST_TAG" ]; then
            VERSION="${DATE}.0"
          else
            PATCH=$(echo $LAST_TAG | cut -d. -f4)
            VERSION="${DATE}.$((PATCH + 1))"
          fi
          echo "version=${VERSION}" >> $GITHUB_OUTPUT
      
      - name: Calculate checksums
        run: |
          cd knowledge
          find . -type f -name "*.yaml" -o -name "*.json" -o -name "*.md" | \
          while read file; do
            shasum -a 256 "$file"
          done > checksums.txt
      
      - name: Update manifest
        run: node scripts/prepare-release.js ${{ steps.version.outputs.version }}
      
      - name: Commit manifest
        run: |
          git config user.name "GitHub Actions"
          git config user.email "actions@github.com"
          git add knowledge/manifest.json
          git commit -m "chore: update manifest for v${{ steps.version.outputs.version }}"
          git push
      
      - name: Create bundle
        run: |
          cd knowledge
          tar -czf ../knowledge-bundle-${{ steps.version.outputs.version }}.tar.gz .
          cd ..
          zip -r knowledge-bundle-${{ steps.version.outputs.version }}.zip knowledge/
      
      - name: Generate changelog
        id: changelog
        run: |
          echo "## Changes in this release:" > changelog.md
          echo "" >> changelog.md
          echo "${{ steps.changed-files.outputs.all_changed_files }}" | tr ' ' '\n' | \
          sed 's/^/- /' >> changelog.md
      
      - name: Create Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ steps.version.outputs.version }}
          name: Knowledge Content v${{ steps.version.outputs.version }}
          body_path: changelog.md
          files: |
            knowledge-bundle-*.tar.gz
            knowledge-bundle-*.zip
          draft: false
          prerelease: false
      
      - name: Update latest tag
        run: |
          git tag -f latest
          git push origin latest --force
```

## Release Script

### `scripts/prepare-release.js`
```javascript
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const version = process.argv[2];
if (!version) {
  console.error('Version required');
  process.exit(1);
}

// Calculate file sizes and checksums
function getDirectorySize(dir) {
  let size = 0;
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stat.size;
    }
  });
  
  return size;
}

function getFileChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Read current manifest or create new
const manifestPath = path.join(__dirname, '..', 'knowledge', 'manifest.json');
let manifest = {};

if (fs.existsSync(manifestPath)) {
  manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

// Update manifest
manifest.version = version;
manifest.released = new Date().toISOString();
manifest.size = `${Math.round(getDirectorySize('knowledge') / 1024)}KB`;

// Update checksums
manifest.checksums = {};
const knowledgeDir = path.join(__dirname, '..', 'knowledge');

function addChecksums(dir, basePath = '') {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (file === 'manifest.json') return;
    
    const filePath = path.join(dir, file);
    const relativePath = path.join(basePath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      addChecksums(filePath, relativePath);
    } else {
      manifest.checksums[relativePath] = `sha256:${getFileChecksum(filePath)}`;
    }
  });
}

addChecksums(knowledgeDir);

// Track individual block versions
manifest.blocks = manifest.blocks || {};

const blocksDir = path.join(knowledgeDir, 'blocks');
if (fs.existsSync(blocksDir)) {
  fs.readdirSync(blocksDir).forEach(file => {
    if (file.endsWith('.yaml')) {
      const blockId = file.replace('.yaml', '');
      const blockPath = path.join(blocksDir, file);
      const checksum = getFileChecksum(blockPath);
      
      // If checksum changed, bump version
      if (!manifest.blocks[blockId] || 
          manifest.blocks[blockId].checksum !== checksum) {
        manifest.blocks[blockId] = {
          version: manifest.blocks[blockId] 
            ? bumpVersion(manifest.blocks[blockId].version)
            : '1.0.0',
          updated: new Date().toISOString(),
          checksum: checksum
        };
      }
    }
  });
}

function bumpVersion(version) {
  const parts = version.split('.');
  parts[2] = String(parseInt(parts[2]) + 1);
  return parts.join('.');
}

// Write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`Manifest updated for version ${version}`);
```

## Release Triggers

### Automatic Triggers
- **Push to main branch** with changes in `knowledge/` folder
- **Merged PRs** that modify knowledge content

### Manual Triggers
```bash
# Force a release with custom version
gh workflow run release.yml -f version=2024.12.15.custom

# Create release from specific commit
git tag v2024.12.15.0
git push origin v2024.12.15.0
```

## Distribution Strategy

### 1. GitHub Releases (Primary)
- Stable URL: `https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.tar.gz`
- Versioned URL: `https://github.com/eugene-taran/sdsa.team/releases/download/v2024.12.15.0/knowledge-bundle.tar.gz`
- Manifest URL: `https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json`

### 2. GitHub Pages (Alternative)
Deploy to GitHub Pages for faster CDN access:
```yaml
# .github/workflows/deploy-pages.yml
name: Deploy to Pages

on:
  release:
    types: [published]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Pages
        uses: actions/configure-pages@v4
      
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: 'knowledge'
      
      - name: Deploy to Pages
        uses: actions/deploy-pages@v3
```

URLs after Pages deployment:
- Manifest: `https://sdsa.team/manifest.json`
- Catalog: `https://sdsa.team/catalog.json`
- Blocks: `https://sdsa.team/blocks/e2e-testing.yaml`

## App Integration

### Checking for Updates (SDSA App)
```typescript
class KnowledgeUpdateService {
  private currentVersion: string = null;
  
  async checkForUpdates(): Promise<boolean> {
    try {
      // Check manifest at stable URL
      const response = await fetch(
        'https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json'
      );
      const manifest = await response.json();
      
      // Compare versions
      if (this.currentVersion !== manifest.version) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update check failed:', error);
      return false;
    }
  }
  
  async downloadUpdate(): Promise<void> {
    // Download from GitHub releases
    const bundleUrl = 'https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.tar.gz';
    // ... download and extract logic
  }
}
```

## Rollback Strategy

### Quick Rollback
```bash
# List recent releases
gh release list --limit 10

# Delete problematic release
gh release delete v2024.12.15.0 --yes

# Revert to previous version
git revert <commit-hash>
git push origin main

# Or restore from previous release
gh release download v2024.12.14.0
```

### Emergency Override
Create `knowledge/FREEZE` file to prevent releases:
```yaml
# In release.yml, add condition
- name: Check freeze
  run: |
    if [ -f knowledge/FREEZE ]; then
      echo "Releases are frozen"
      exit 0
    fi
```

## Monitoring

### Release Health Checks
```yaml
# .github/workflows/health-check.yml
name: Health Check

on:
  release:
    types: [published]
  schedule:
    - cron: '0 */6 * * *'  # Every 6 hours

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Check manifest accessibility
        run: |
          curl -f https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json
      
      - name: Validate manifest
        run: |
          curl -s https://raw.githubusercontent.com/eugene-taran/sdsa.team/main/knowledge/manifest.json | \
          jq -e '.version and .released and .checksums'
      
      - name: Check bundle download
        run: |
          curl -f -L -o /tmp/bundle.tar.gz \
            https://github.com/eugene-taran/sdsa.team/releases/latest/download/knowledge-bundle.tar.gz
```

## Best Practices

### Before Release
1. **Test locally**: Run YAML validation
2. **Preview changes**: Use PR previews
3. **Check resources**: Ensure all referenced files exist
4. **Version appropriateness**: Major changes = new day version

### After Release
1. **Monitor app telemetry**: Check download success rates
2. **User feedback**: Watch for issues
3. **Quick iteration**: Can release multiple times per day

## Future Enhancements

### Phase 1 (Current)
- Basic GitHub Actions automation
- Date-based versioning
- GitHub Releases distribution

### Phase 2
- Semantic versioning option
- Differential updates (only changed files)
- CDN distribution
- Release channels (stable, beta, dev)

### Phase 3
- A/B testing for content
- Gradual rollout
- Content analytics
- Automatic rollback on errors

## FAQ

**Q: How often can we release?**
A: Unlimited. The patch number increments for same-day releases.

**Q: What if we need to hotfix?**
A: Push to main with changes. New release auto-creates with incremented patch.

**Q: Can we schedule releases?**
A: Yes, use GitHub Actions scheduled workflows or deployment environments.

**Q: How to test before release?**
A: Create PR, test with branch URL: `https://raw.githubusercontent.com/eugene-taran/sdsa.team/[branch]/knowledge/manifest.json`