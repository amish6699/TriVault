**TriVault**

- **What:** Minimal cross-platform notepad + password manager that encrypts data using three user-provided codes.
- **Name:** TriVault
- **Stack:** Electron (desktop), Node.js (built-in crypto), simple HTML/JS UI. This keeps the tech minimal and cross-platform (macOS, Windows, Linux).

Why three codes?
- The user supplies three independent codes. The app concatenates them and derives an AES-256-GCM key via PBKDF2. This provides a straightforward UX while still using strong crypto primitives.

Quick start

1. Install dependencies (Node 18+ recommended):

```bash
cd TriVault
npm install
npm run start
```

Files of interest
- `main.js`: Electron main process and IPC handlers
- `preload.js`: secure bridge to renderer
- `src/crypto.js`: encryption/decryption code (PBKDF2 + AES-256-GCM)
- `index.html` + `renderer.js`: UI and frontend logic

Notes & next steps
- Storage: currently stores encrypted JSON files locally under the Electron `userData` path: `trivault_note.json` and `trivault_pw.json`.
- Sync: placeholder—you will need to configure OAuth client IDs for Google Drive and Zoho Drive. The codebase includes IPC points where Drive upload/download can be added.
- Security: secrets (the 3 codes) are never stored — only used to derive keys in memory. Salt/iv/auth tag are stored alongside ciphertext to allow decryption.

To push to a GitHub repository
- I can push this project to a public repository for you, but I need either:
  - a GitHub repository URL where you want the code pushed (and collaborator access), or
  - a personal access token I can use to create/push a repo on your behalf.

If you want, I can also add:
- Google Drive & Zoho Drive sync helpers (OAuth flow + upload/download)
- Packaging (electron-builder) for cross-platform installers
