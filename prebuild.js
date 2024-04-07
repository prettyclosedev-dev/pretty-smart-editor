// prebuild.js
const fs = require('fs');
const path = require('path');

// Check for the --in-app argument
const inApp = process.argv.includes('--in-app');

// Define the path to the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');

// Read the package.json file
const packageJson = require(packageJsonPath);

// Update the homepage field based on the argument
packageJson.homepage = inApp ? '/editor' : '/';

// Write the updated package.json back to file
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

console.log(`Set homepage to "${packageJson.homepage}"`);
