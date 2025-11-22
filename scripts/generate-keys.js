/**
 * Script to generate RSA key pair for NextAuth JWT signing
 * Run with: node scripts/generate-keys.js
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate RSA key pair
const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding: {
    type: 'spki',
    format: 'pem'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'pem'
  }
});

// Create keys directory if it doesn't exist
const keysDir = path.join(process.cwd(), 'keys');
if (!fs.existsSync(keysDir)) {
  fs.mkdirSync(keysDir);
}

// Save keys
fs.writeFileSync(path.join(keysDir, 'private.pem'), privateKey);
fs.writeFileSync(path.join(keysDir, 'public.pem'), publicKey);

// Convert keys to base64 for .env
const privateKeyBase64 = Buffer.from(privateKey).toString('base64');
const publicKeyBase64 = Buffer.from(publicKey).toString('base64');

console.log('\n✅ RSA key pair generated successfully!\n');
console.log('Keys saved to:');
console.log('  - keys/private.pem');
console.log('  - keys/public.pem\n');
console.log('Add these to your .env.local file:\n');
console.log('# JWT Signing Keys (RS256)');
console.log(`NEXTAUTH_JWT_PRIVATE_KEY="${privateKeyBase64}"`);
console.log(`NEXTAUTH_JWT_PUBLIC_KEY="${publicKeyBase64}"`);
console.log('\n⚠️  IMPORTANT: Add keys/ to .gitignore to keep private key secure!\n');
