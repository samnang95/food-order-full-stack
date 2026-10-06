const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

/**
 * 1. Detect flavor from CLI flags, FLAVOR, APP_ENV, or NODE_ENV
 * Supports:
 *   - Flags: node src/app.js --flavor=dev (or --flavor=staging, --flavor=prod, --env=...)
 *   - Env:   FLAVOR=dev | APP_ENV=staging | NODE_ENV=production
 *   - Fallback: 'development'
 */
const parseCliFlag = (name) => {
  const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
  return arg ? arg.split('=')[1] : null;
};

const rawFlavor =
  parseCliFlag('flavor') ||
  parseCliFlag('env') ||
  process.env.FLAVOR ||
  process.env.APP_ENV ||
  process.env.NODE_ENV ||
  'development';

const normalizeFlavor = (val) => {
  const lower = String(val).toLowerCase().trim();
  if (['dev', 'development', 'local'].includes(lower)) return 'development';
  if (['staging', 'stage', 'test', 'qa'].includes(lower)) return 'staging';
  if (['prod', 'production', 'live'].includes(lower)) return 'production';
  return lower;
};

const currentFlavor = normalizeFlavor(rawFlavor);
const shortFlavor = currentFlavor === 'development' ? 'dev' : currentFlavor === 'production' ? 'prod' : 'staging';

// Sync process.env for standard packages
process.env.NODE_ENV = currentFlavor;
process.env.FLAVOR = shortFlavor;
process.env.APP_ENV = currentFlavor;

/**
 * 2. Cascading .env file resolution
 * Priority order:
 *   1. .env.{flavor}.local   (e.g., .env.development.local, .env.dev.local)
 *   2. .env.{flavor}         (e.g., .env.development, .env.dev)
 *   3. .env.local
 *   4. .env                  (base fallback)
 */
const rootDir = path.resolve(__dirname, '../../');

const candidateFiles = Array.from(new Set([
  `.env.${currentFlavor}.local`,
  `.env.${shortFlavor}.local`,
  `.env.${currentFlavor}`,
  `.env.${shortFlavor}`,
  '.env.local',
  '.env',
]));

const loadedFiles = [];
for (const file of candidateFiles) {
  const fullPath = path.join(rootDir, file);
  if (fs.existsSync(fullPath)) {
    // override: false ensures host/platform container env vars take precedence
    const result = dotenv.config({ path: fullPath, override: false });
    if (!result.error) {
      loadedFiles.push(file);
    }
  }
}

if (loadedFiles.length === 0) {
  dotenv.config();
  loadedFiles.push('.env (default fallback)');
}

console.log(`🌿 [Flavor Manager] Active Flavor: ${currentFlavor.toUpperCase()} (code: '${shortFlavor}')`);
console.log(`   📁 Loaded env files: [ ${loadedFiles.join(', ')} ]`);

module.exports = {
  flavor: currentFlavor,
  shortFlavor,
  isDev: currentFlavor === 'development',
  isStaging: currentFlavor === 'staging',
  isProd: currentFlavor === 'production',
  loadedFiles,
};
