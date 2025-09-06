#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple JSON validator
function validateJSON(content, filename) {
  const errors = [];
  
  // Try to parse JSON
  let json;
  try {
    json = JSON.parse(content);
  } catch (e) {
    errors.push(`Invalid JSON: ${e.message}`);
    return errors;
  }
  
  // Check if it's the categories metadata file
  if (filename.includes('categories.json')) {
    if (!json.categories || !Array.isArray(json.categories)) {
      errors.push('Missing or invalid required field in categories.json: categories (must be an array)');
    } else {
      json.categories.forEach((cat, index) => {
        if (!cat.id) errors.push(`Category at index ${index} missing required field: id`);
        if (!cat.name) errors.push(`Category at index ${index} missing required field: name`);
        if (!cat.description) errors.push(`Category at index ${index} missing required field: description`);
        if (!cat.path) errors.push(`Category at index ${index} missing required field: path`);
      });
    }
  }
  // Check required fields for topic questionnaires
  else if (filename.includes('categories/') && !filename.includes('manifest.json') && !filename.includes('categories.json')) {
    if (!json.id) {
      errors.push('Missing required field: id');
    }
    if (!json.title) {
      errors.push('Missing required field: title');
    }
    if (!json.questions || !Array.isArray(json.questions)) {
      errors.push('Missing or invalid required field: questions (must be an array)');
    }
    if (!json.llmConfig) {
      errors.push('Missing required field: llmConfig');
    }
    
    // Check that ID matches filename
    const expectedId = path.basename(filename, '.json');
    if (json.id && json.id !== expectedId && !filename.includes('categories.json')) {
      errors.push(`ID mismatch: expected "${expectedId}" but found "${json.id}"`);
    }
  }
  
  return errors;
}

// Get all JSON files in contexts directory
function getAllJsonFiles() {
  const files = [];
  const contextsDir = path.resolve(__dirname, '..', 'contexts');
  
  // Add categories.json if it exists
  const categoriesJsonPath = path.join(contextsDir, 'categories.json');
  if (fs.existsSync(categoriesJsonPath)) {
    files.push(path.join('contexts', 'categories.json'));
  }
  
  // Recursively find all JSON files in categories
  function walkDir(dir, baseDir = '') {
    if (!fs.existsSync(dir)) return;
    
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const relativePath = baseDir ? path.join(baseDir, item) : item;
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        walkDir(fullPath, relativePath);
      } else if (item.endsWith('.json') && item !== 'manifest.json' && item !== 'categories.json') {
        files.push(path.join('contexts', relativePath));
      }
    });
  }
  
  // Walk through categories directory
  const categoriesDir = path.join(contextsDir, 'categories');
  if (fs.existsSync(categoriesDir)) {
    walkDir(categoriesDir, 'categories');
  }
  
  return files;
}

// Validate a single file
function validateFile(filename) {
  const filepath = path.resolve(filename);
  
  if (!fs.existsSync(filepath)) {
    return {
      filename,
      valid: false,
      errors: [`File not found: ${filename}`]
    };
  }
  
  const content = fs.readFileSync(filepath, 'utf8');
  const errors = validateJSON(content, filename);
  
  return {
    filename,
    valid: errors.length === 0,
    errors
  };
}

// Main function
function main() {
  const args = process.argv.slice(2);
  let filesToValidate = [];
  
  if (args.length === 0) {
    // No arguments - validate all files
    filesToValidate = getAllJsonFiles();
    if (filesToValidate.length === 0) {
      console.log('No JSON files found in contexts/categories/');
      process.exit(0);
    }
    console.log(`Validating ${filesToValidate.length} JSON file(s)...\n`);
  } else {
    // Validate specific file
    filesToValidate = [args[0]];
  }
  
  let hasErrors = false;
  const results = [];
  
  // Validate each file
  filesToValidate.forEach(filename => {
    const result = validateFile(filename);
    results.push(result);
    
    if (result.valid) {
      console.log(`✓ ${filename}`);
    } else {
      hasErrors = true;
      console.error(`✗ ${filename}`);
      result.errors.forEach(error => console.error(`  - ${error}`));
    }
  });
  
  // Summary for multiple files
  if (filesToValidate.length > 1) {
    console.log('\n' + '='.repeat(50));
    const validCount = results.filter(r => r.valid).length;
    console.log(`Summary: ${validCount}/${results.length} files valid`);
  }
  
  process.exit(hasErrors ? 1 : 0);
}

// Run if called directly
if (require.main === module) {
  main();
}