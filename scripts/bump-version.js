#!/usr/bin/env node

/**
 * Version Bump Script
 * Generates a new version based on date format: YYYY.MM.DD.PATCH
 * Checks existing git tags to increment patch number if multiple releases same day
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getGitTags() {
  try {
    const tags = execSync('git tag -l', { encoding: 'utf8' }).trim();
    return tags ? tags.split('\n') : [];
  } catch (error) {
    console.error('Warning: Could not fetch git tags:', error.message);
    return [];
  }
}

function generateVersion() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  const baseVersion = `${year}.${month}.${day}`;
  
  // Get all tags for today
  const tags = getGitTags();
  const todayTags = tags.filter(tag => tag.includes(`v${baseVersion}.`));
  
  if (todayTags.length === 0) {
    return `${baseVersion}.0`;
  }
  
  // Find highest patch number
  let maxPatch = -1;
  todayTags.forEach(tag => {
    const match = tag.match(/v\d+\.\d+\.\d+\.(\d+)/);
    if (match) {
      const patch = parseInt(match[1], 10);
      if (patch > maxPatch) {
        maxPatch = patch;
      }
    }
  });
  
  return `${baseVersion}.${maxPatch + 1}`;
}

function updateManifest(version) {
  const manifestPath = path.join(__dirname, '..', 'knowledge', 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    console.error('Error: manifest.json not found at', manifestPath);
    process.exit(1);
  }
  
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const oldVersion = manifest.version;
  
  manifest.version = version;
  manifest.released = new Date().toISOString();
  
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  
  console.log(`✅ Version bumped from ${oldVersion} to ${version}`);
  return oldVersion;
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  const version = args[0] || generateVersion();
  
  console.log('📦 SDSA Knowledge Version Bump');
  console.log('==============================');
  console.log(`New version: ${version}`);
  
  if (args.includes('--dry-run')) {
    console.log('🔍 Dry run - no changes made');
    return;
  }
  
  if (args.includes('--update-manifest')) {
    updateManifest(version);
  } else {
    console.log('ℹ️  Use --update-manifest to update manifest.json');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Review changes');
  console.log('2. Commit: git add -A && git commit -m "chore: bump version to ' + version + '"');
  console.log('3. Tag: git tag v' + version);
  console.log('4. Push: git push origin main --tags');
}

if (require.main === module) {
  main();
}

module.exports = { generateVersion, updateManifest };