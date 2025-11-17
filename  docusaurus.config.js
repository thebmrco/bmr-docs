// docusaurus.config.js
// JS wrapper so GitHub Actions (Node 18) can read our TypeScript config
require('ts-node').register({ transpileOnly: true });
module.exports = require('./docusaurus.config.ts').default;