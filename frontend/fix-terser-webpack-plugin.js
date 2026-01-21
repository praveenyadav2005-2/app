const fs = require('fs');
const path = require('path');

const terserPluginPath = path.join(__dirname, 'node_modules', 'terser-webpack-plugin', 'dist', 'index.js');

if (fs.existsSync(terserPluginPath)) {
  let content = fs.readFileSync(terserPluginPath, 'utf8');
  
  // Check if it already uses the destructured import
  if (content.includes('const {\n  validate\n} = require("schema-utils");')) {
    // Replace with a compatibility shim
    content = content.replace(
      'const {\n  validate\n} = require("schema-utils");',
      `const schemaUtils = require("schema-utils");
// Compatibility shim: handle both function and object exports from schema-utils
const { validate } = typeof schemaUtils === 'function' ? { validate: schemaUtils } : schemaUtils;`
    );
    fs.writeFileSync(terserPluginPath, content, 'utf8');
    console.log('✓ Fixed terser-webpack-plugin to work with schema-utils export shapes');
  } else if (content.includes('const validate = require("schema-utils");')) {
    console.log('⚠ terser-webpack-plugin already uses old import style');
  } else {
    console.log('⚠ terser-webpack-plugin structure changed, manual fix may be needed');
  }
} else {
  console.log('⚠ terser-webpack-plugin not found, skipping fix');
}