/**
 * Script to replace console.log statements with proper logger
 */

const fs = require('fs');
const path = require('path');

const SRC_DIRS = [
  path.join(__dirname, '../app'),
  path.join(__dirname, '../components'),
  path.join(__dirname, '../services'),
  path.join(__dirname, '../contexts'),
  path.join(__dirname, '../hooks'),
];

const CONSOLE_PATTERNS = [
  /console\.log\(/g,
  /console\.info\(/g,
  /console\.warn\(/g,
  /console\.error\(/g,
  /console\.debug\(/g,
];

let totalFiles = 0;
let totalReplacements = 0;

function getComponentName(filePath) {
  const fileName = path.basename(filePath, path.extname(filePath));
  return fileName;
}

function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let hasConsole = false;
    let replacements = 0;

    // Check if file has console statements
    for (const pattern of CONSOLE_PATTERNS) {
      if (pattern.test(content)) {
        hasConsole = true;
        break;
      }
    }

    if (!hasConsole) {
      return;
    }

    const componentName = getComponentName(filePath);
    
    // Check if logger is already imported
    const hasLoggerImport = /import.*Logger.*from.*logger/.test(content);
    
    if (!hasLoggerImport) {
      // Add logger import at the top (after other imports)
      const importStatement = `import { createLogger } from '../utils/logger';\n\nconst logger = createLogger('${componentName}');\n`;
      
      // Find the last import statement
      const lines = content.split('\n');
      let lastImportIndex = -1;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          lastImportIndex = i;
        }
      }
      
      if (lastImportIndex !== -1) {
        lines.splice(lastImportIndex + 1, 0, '', importStatement);
        content = lines.join('\n');
      }
    }

    // Replace console statements
    content = content.replace(/console\.log\(/g, () => {
      replacements++;
      return 'logger.debug(';
    });
    
    content = content.replace(/console\.info\(/g, () => {
      replacements++;
      return 'logger.info(';
    });
    
    content = content.replace(/console\.warn\(/g, () => {
      replacements++;
      return 'logger.warn(';
    });
    
    content = content.replace(/console\.error\(/g, () => {
      replacements++;
      return 'logger.error(';
    });
    
    content = content.replace(/console\.debug\(/g, () => {
      replacements++;
      return 'logger.debug(';
    });

    if (replacements > 0) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ ${filePath}: ${replacements} replacements`);
      totalFiles++;
      totalReplacements += replacements;
    }
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log(`⚠️  Directory not found: ${dir}`);
    return;
  }

  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      processFile(filePath);
    }
  }
}

console.log('🚀 Starting console.log replacement...\n');

for (const dir of SRC_DIRS) {
  console.log(`Processing directory: ${dir}`);
  processDirectory(dir);
}

console.log('\n' + '='.repeat(50));
console.log('📊 Summary:');
console.log(`  Files modified: ${totalFiles}`);
console.log(`  Total replacements: ${totalReplacements}`);
console.log('='.repeat(50));

if (totalReplacements > 0) {
  console.log('\n✅ Console.log statements replaced successfully!');
  console.log('⚠️  Please review the changes and test the app.');
} else {
  console.log('\n✅ No console.log statements found.');
}

