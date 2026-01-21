const fs = require('fs');
const path = require('path');

const cssMinimizerPluginPath = path.join(__dirname, 'node_modules', 'css-minimizer-webpack-plugin', 'dist', 'index.js');

if (fs.existsSync(cssMinimizerPluginPath)) {
  let content = fs.readFileSync(cssMinimizerPluginPath, 'utf8');
  
  // Check if it already uses the destructured import
  if (content.includes('const {\n  validate\n} = require("schema-utils");')) {
    // Replace with a compatibility shim
    content = content.replace(
      'const {\n  validate\n} = require("schema-utils");',
      `const schemaUtils = require("schema-utils");
// Compatibility shim: handle both function and object exports from schema-utils
const { validate } = typeof schemaUtils === 'function' ? { validate: schemaUtils } : schemaUtils;`
    );
    fs.writeFileSync(cssMinimizerPluginPath, content, 'utf8');
    console.log('✓ Fixed css-minimizer-webpack-plugin to work with schema-utils export shapes');
  } else if (content.includes('const validate = require("schema-utils");')) {
    console.log('⚠ css-minimizer-webpack-plugin already uses old import style');
  } else {
    console.log('⚠ css-minimizer-webpack-plugin structure changed, manual fix may be needed');
  }
} else {
  console.log('⚠ css-minimizer-webpack-plugin not found, skipping fix');
}