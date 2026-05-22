 # TriVault (PWA)

TriVault is a minimal Progressive Web App that combines a notepad and key/value storage and encrypts data client-side using three user-provided codes.

## Key ideas
- Runs entirely in the browser as a PWA (installable to homescreen/desktop).
- Uses the browser `Web Crypto API` for PBKDF2 key derivation and AES-256-GCM encryption.
- Secrets (the three codes) are not persisted; only the ciphertext + metadata (salt/iv) are stored locally.

## Why this stack
- PWA: works across desktop and mobile browsers without bundling native code.
- Web Crypto: secure, native browser cryptography without external native modules.

## Minimum tech stack
- Modern browser supporting Service Worker and Web Crypto.
- Node.js only needed for local development server (script uses `npx http-server`).

## Application name
- TriVault

## Features implemented
- Notepad: free-form text editing and encrypted save/load.
- Key/Value mode: store named values and copy them to clipboard.
- Single storage: either plain text or a KV JSON object is encrypted and saved under the same local key.
- Offline-ready via a basic service worker; app can be installed from the browser.

## Files of interest
- `index.html` + `renderer.js`: UI and frontend logic (now a module)
- `src/crypto-web.js`: browser-side encryption/decryption (PBKDF2 + AES-256-GCM)
- `styles.css`: theme and styling
- `service-worker.js` and `manifest.json`: PWA assets

## Quick start (development)

1. Install dependencies and run a local server

```bash
cd TriVault
npm install
npm run start
```

2. Open `http://localhost:3000` in a browser that supports PWAs (Chrome, Edge, Firefox has limited install support).

3. Use the top input to enter exactly three codes separated by commas (or click "Generate Codes").

## Storage & format
- Data is stored in `localStorage` under the key `trivault_note` as an encrypted JSON blob containing `salt`, `iv`, and `ciphertext` (base64-encoded).
- When saving in Key/Value mode the app stores a JSON object: `{ type: 'kv', data: { key: value } }` encrypted the same as plain text.

## PWA notes
- The service worker caches core assets for offline usage. Install the app from the browser's install prompt to run it like a native app.

## Sync (Google Drive / Zoho Drive)
- Sync remains a future enhancement. Implementing it requires OAuth credentials and uploading/downloading the encrypted blobs only (never plaintext).

## Security notes
- The three user codes are concatenated with a delimiter and used as input to PBKDF2 with a random salt to derive an AES-256-GCM key. The salt and iv are stored with the ciphertext so the same codes can recover the data.
- Do not store the three codes anywhere. If users lose them, ciphertext cannot be recovered.

## License

MIT
