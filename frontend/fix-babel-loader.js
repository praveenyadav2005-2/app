const fs = require('fs');
const path = require('path');

const babelLoaderPath = path.join(__dirname, 'node_modules', 'babel-loader', 'lib', 'index.js');

if (fs.existsSync(babelLoaderPath)) {
  let content = fs.readFileSync(babelLoaderPath, 'utf8');
  
  // Replace the old import with a compatible one for schema-utils@3.x
  // schema-utils@3.x exports { validate } but babel-loader expects validateOptions
  if (content.includes('const validateOptions = require("schema-utils");')) {
    content = content.replace(
      'const validateOptions = require("schema-utils");',
      `const { validate } = require("schema-utils");
// Compatibility shim: babel-loader expects validateOptions but schema-utils@3.x exports validate
const validateOptions = (schema, options, name) => {
  return validate(schema, options, name);
};`
    );
    fs.writeFileSync(babelLoaderPath, content, 'utf8');
    console.log('✓ Fixed babel-loader to work with schema-utils@3.x');
  } else if (content.includes('const validateOptions')) {
    console.log('⚠ babel-loader already patched');
  } else {
    console.log('⚠ babel-loader structure changed, manual fix may be needed');
  }
} else {
  console.log('⚠ babel-loader not found, skipping fix');
}

