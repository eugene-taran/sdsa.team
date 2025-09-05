#!/usr/bin/env node

/**
 * Checksum Generation Script
 * Generates SHA-256 checksums for all knowledge content files
 * Updates manifest.json with checksums and file sizes
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KNOWLEDGE_DIR = path.join(__dirname, '..', 'knowledge');
const MANIFEST_PATH = path.join(KNOWLEDGE_DIR, 'manifest.json');

function getFileChecksum(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  return stats.size;
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B';
  if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + 'KB';
  return Math.round(bytes / (1024 * 1024)) + 'MB';
}

function scanDirectory(dir, basePath = '', excludeFiles = ['manifest.json']) {
  const results = {
    checksums: {},
    files: [],
    totalSize: 0,
    fileCount: 0
  };
  
  function walk(currentDir, prefix = '') {
    const files = fs.readdirSync(currentDir);
    
    files.forEach(file => {
      const fullPath = path.join(currentDir, file);
      const relativePath = prefix ? path.join(prefix, file) : file;
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walk(fullPath, relativePath);
      } else if (!excludeFiles.includes(file)) {
        const checksum = getFileChecksum(fullPath);
        const size = getFileSize(fullPath);
        
        results.checksums[relativePath] = `sha256:${checksum}`;
        results.files.push({
          path: relativePath,
          checksum: checksum,
          size: size
        });
        results.totalSize += size;
        results.fileCount++;
      }
    });
  }
  
  walk(dir, basePath);
  return results;
}

function categorizeFiles(files) {
  const categories = {
    blocks: [],
    resources: [],
    other: []
  };
  
  files.forEach(file => {
    if (file.path.startsWith('blocks/')) {
      categories.blocks.push(file);
    } else if (file.path.startsWith('resources/')) {
      categories.resources.push(file);
    } else {
      categories.other.push(file);
    }
  });
  
  return categories;
}

function updateManifest(results) {
  let manifest;
  
  if (fs.existsSync(MANIFEST_PATH)) {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
  } else {
    manifest = {
      version: '0.0.0',
      released: new Date().toISOString()
    };
  }
  
  // Update checksums and size
  manifest.checksums = results.checksums;
  manifest.size = formatSize(results.totalSize);
  
  // Update statistics
  const categories = categorizeFiles(results.files);
  manifest.statistics = {
    totalFiles: results.fileCount,
    totalSize: formatSize(results.totalSize),
    blocks: categories.blocks.length,
    resources: categories.resources.length,
    lastUpdated: new Date().toISOString()
  };
  
  // Update individual block info
  if (!manifest.blocks) {
    manifest.blocks = {};
  }
  
  categories.blocks.forEach(block => {
    const blockName = path.basename(block.path, '.yaml');
    if (!manifest.blocks[blockName]) {
      manifest.blocks[blockName] = {};
    }
    manifest.blocks[blockName].checksum = block.checksum;
    manifest.blocks[blockName].size = formatSize(block.size);
  });
  
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  
  return manifest;
}

function printReport(results, manifest) {
  console.log('📊 SDSA Knowledge Checksum Report');
  console.log('==================================');
  console.log(`📁 Total files: ${results.fileCount}`);
  console.log(`💾 Total size: ${formatSize(results.totalSize)}`);
  console.log('');
  
  const categories = categorizeFiles(results.files);
  
  if (categories.blocks.length > 0) {
    console.log('📚 Knowledge Blocks:');
    categories.blocks.forEach(file => {
      console.log(`  ✓ ${file.path} (${formatSize(file.size)})`);
      console.log(`    └─ ${file.checksum.substring(0, 16)}...`);
    });
    console.log('');
  }
  
  if (categories.resources.length > 0) {
    console.log('📄 Resources:');
    categories.resources.forEach(file => {
      console.log(`  ✓ ${file.path} (${formatSize(file.size)})`);
    });
    console.log('');
  }
  
  if (categories.other.length > 0) {
    console.log('📎 Other Files:');
    categories.other.forEach(file => {
      console.log(`  ✓ ${file.path} (${formatSize(file.size)})`);
    });
    console.log('');
  }
  
  console.log('✅ Checksums generated and saved to manifest.json');
}

// Main execution
function main() {
  const args = process.argv.slice(2);
  
  console.log('🔐 Generating checksums for knowledge content...\n');
  
  try {
    const results = scanDirectory(KNOWLEDGE_DIR, '', ['manifest.json']);
    
    if (results.fileCount === 0) {
      console.log('⚠️  No files found to checksum');
      return;
    }
    
    if (args.includes('--dry-run')) {
      console.log('🔍 Dry run mode - no changes made\n');
      printReport(results, null);
    } else {
      const manifest = updateManifest(results);
      printReport(results, manifest);
    }
    
    // Output JSON for GitHub Actions
    if (args.includes('--json')) {
      console.log('\n📋 JSON Output:');
      console.log(JSON.stringify(results.checksums, null, 2));
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { getFileChecksum, scanDirectory, updateManifest };