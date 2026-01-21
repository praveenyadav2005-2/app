const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all JS files in node_modules that import schema-utils
const findCommand = 'find node_modules -name "*.js" -exec grep -l \'require("schema-utils")\' {} \\;';
const files = execSync(findCommand, { encoding: 'utf8' }).trim().split('\n').filter(Boolean);

console.log(`Found ${files.length} files to patch`);

files.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Check for the destructured import
    if (content.includes('const {\n  validate\n} = require("schema-utils");')) {
      content = content.replace(
        'const {\n  validate\n} = require("schema-utils");',
        `const schemaUtils = require("schema-utils");
// Compatibility shim: handle both function and object exports from schema-utils
const { validate } = typeof schemaUtils === 'function' ? { validate: schemaUtils } : schemaUtils;`
      );
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Patched ${filePath}`);
    } else if (content.includes('const { validate } = require("schema-utils");')) {
      // Single line version
      content = content.replace(
        'const { validate } = require("schema-utils");',
        `const schemaUtils = require("schema-utils");
// Compatibility shim: handle both function and object exports from schema-utils
const { validate } = typeof schemaUtils === 'function' ? { validate: schemaUtils } : schemaUtils;`
      );
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✓ Patched ${filePath}`);
    } else {
      console.log(`⚠ No patch needed for ${filePath}`);
    }
  }
});

console.log('Schema-utils patching complete');