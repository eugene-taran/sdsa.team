#!/usr/bin/env node

/**
 * Checksum Generation Script
 * Generates a single SHA-256 checksum for the entire contexts folder
 * Creates or updates manifest.json in the release pipeline
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const CONTEXTS_DIR = path.join(__dirname, '..', 'contexts');

function getDirectoryChecksum(dir, excludeFiles = ['manifest.json', '.DS_Store']) {
  const hash = crypto.createHash('sha256');
  const files = [];
  
  function walk(currentDir, prefix = '') {
    const items = fs.readdirSync(currentDir).sort();
    
    items.forEach(item => {
      if (excludeFiles.includes(item)) return;
      
      const fullPath = path.join(currentDir, item);
      const relativePath = prefix ? path.join(prefix, item) : item;
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath, relativePath);
      } else {
        const content = fs.readFileSync(fullPath);
        // Include file path and content in hash for consistency
        hash.update(relativePath);
        hash.update(content);
        files.push({
          path: relativePath,
          size: stat.size
        });
      }
    });
  }
  
  walk(dir);
  
  return {
    checksum: hash.digest('hex'),
    files: files,
    totalSize: files.reduce((sum, file) => sum + file.size, 0),
    fileCount: files.length
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
  return Math.round(bytes / (1024 * 1024)) + 'MB';
}

function countCategories() {
  const categoriesPath = path.join(CONTEXTS_DIR, 'categories.json');
  if (fs.existsSync(categoriesPath)) {
    const content = JSON.parse(fs.readFileSync(categoriesPath, 'utf8'));
    return content.categories ? content.categories.length : 0;
  }
  return 0;
}

function countTopics() {
  let count = 0;
  const categoriesDir = path.join(CONTEXTS_DIR, 'categories');
  
  if (fs.existsSync(categoriesDir)) {
    function walk(dir) {
      const items = fs.readdirSync(dir);
      items.forEach(item => {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          walk(fullPath);
        } else if (item.endsWith('.json')) {
          count++;
        }
      });
    }
    walk(categoriesDir);
  }
  
  return count;
}

function generateManifest(checksum, totalSize, fileCount) {
  const manifest = {
    version: process.env.VERSION || '0.0.0',
    released: new Date().toISOString(),
    checksum: `sha256:${checksum}`,
    size: formatSize(totalSize),
    statistics: {
      totalFiles: fileCount,
      totalSize: formatSize(totalSize),
      categories: countCategories(),
      topics: countTopics(),
      lastUpdated: new Date().toISOString()
    }
  };
  
  return manifest;
}

function printReport(result, manifest) {
  console.log('📊 SDSA Contexts Checksum Report');
  console.log('==================================');
  console.log(`📁 Total files: ${result.fileCount}`);
  console.log(`💾 Total size: ${formatSize(result.totalSize)}`);
  console.log(`🔐 Checksum: ${result.checksum.substring(0, 16)}...`);
  console.log('');
  
  if (manifest) {
    console.log('📋 Manifest:');
    console.log(`  Version: ${manifest.version}`);
    console.log(`  Categories: ${manifest.statistics.categories}`);
    console.log(`  Topics: ${manifest.statistics.topics}`);
    console.log('');
  }
  
  console.log('✅ Checksum generated successfully');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  console.log('🔐 Generating checksum for contexts folder...\n');
  
  try {
    const result = getDirectoryChecksum(CONTEXTS_DIR);
    
    if (result.fileCount === 0) {
      console.log('⚠️  No files found to checksum');
      return;
    }
    
    const manifest = generateManifest(result.checksum, result.totalSize, result.fileCount);
    
    if (args.includes('--dry-run')) {
      console.log('🔍 Dry run mode - no changes made\n');
      printReport(result, manifest);
    } else if (args.includes('--save-manifest')) {
      // Save manifest.json (for release pipeline)
      const manifestPath = path.join(CONTEXTS_DIR, 'manifest.json');
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
      printReport(result, manifest);
      console.log('📄 Manifest saved to contexts/manifest.json');
    } else {
      printReport(result, manifest);
    }
    
    // Output JSON for GitHub Actions
    if (args.includes('--json')) {
      console.log('\n📋 JSON Output:');
      console.log(JSON.stringify({
        checksum: result.checksum,
        totalSize: result.totalSize,
        fileCount: result.fileCount
      }, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getDirectoryChecksum, generateManifest };