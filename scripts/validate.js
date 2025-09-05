#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Simple YAML validator without external dependencies
function validateYAML(content, filename) {
  const errors = [];
  const lines = content.split('\n');
  let currentIndent = 0;
  let inMultilineString = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;
    
    // Skip empty lines and comments
    if (!line.trim() || line.trim().startsWith('#')) continue;
    
    // Check for tabs (YAML doesn't allow tabs for indentation)
    if (line.includes('\t')) {
      errors.push(`Line ${lineNum}: YAML files should not contain tabs`);
    }
    
    // Check for improper indentation
    const indent = line.match(/^(\s*)/)[1].length;
    if (indent % 2 !== 0) {
      errors.push(`Line ${lineNum}: Indentation should be in multiples of 2 spaces`);
    }
    
    // Check for basic YAML structure
    if (line.includes(':') && !line.includes(': ')) {
      const colonIndex = line.indexOf(':');
      if (colonIndex < line.length - 1 && line[colonIndex + 1] !== ' ' && line[colonIndex + 1] !== '\n') {
        errors.push(`Line ${lineNum}: Space required after colon`);
      }
    }
    
    // Check for unclosed quotes (skip this check for lines with apostrophes in words)
    // Only check if line starts/ends with quotes or has quotes around values
    const trimmedLine = line.trim();
    if (trimmedLine.startsWith("'") || trimmedLine.endsWith("'") || 
        trimmedLine.startsWith('"') || trimmedLine.endsWith('"')) {
      const singleQuotes = (line.match(/'/g) || []).length;
      const doubleQuotes = (line.match(/"/g) || []).length;
      
      // For single quotes, only check if they appear to be string delimiters
      if (trimmedLine.startsWith("'") && singleQuotes % 2 !== 0) {
        errors.push(`Line ${lineNum}: Unclosed single quote`);
      }
      if (trimmedLine.startsWith('"') && doubleQuotes % 2 !== 0) {
        errors.push(`Line ${lineNum}: Unclosed double quote`);
      }
    }
  }
  
  // Check required fields for knowledge blocks
  if (filename.includes('blocks/')) {
    if (!content.includes('id:')) {
      errors.push('Missing required field: id');
    }
    if (!content.includes('title:')) {
      errors.push('Missing required field: title');
    }
    if (!content.includes('initial_question:')) {
      errors.push('Missing required field: initial_question');
    }
    if (!content.includes('paths:')) {
      errors.push('Missing required field: paths');
    }
    if (!content.includes('metadata:')) {
      errors.push('Missing required field: metadata');
    }
  }
  
  return errors;
}

// Get all YAML files in knowledge directory
function getAllYamlFiles() {
  const files = [];
  const knowledgeDir = path.resolve(__dirname, '..', 'knowledge');
  
  // Get files from blocks directory
  const blocksDir = path.join(knowledgeDir, 'blocks');
  if (fs.existsSync(blocksDir)) {
    fs.readdirSync(blocksDir).forEach(file => {
      if (file.endsWith('.yaml') || file.endsWith('.yml')) {
        files.push(path.join('knowledge', 'blocks', file));
      }
    });
  }
  
  // Could add other directories here if needed
  
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
  const errors = validateYAML(content, filename);
  
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
    filesToValidate = getAllYamlFiles();
    if (filesToValidate.length === 0) {
      console.log('No YAML files found in knowledge/blocks/');
      process.exit(0);
    }
    console.log(`Validating ${filesToValidate.length} YAML file(s)...\n`);
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