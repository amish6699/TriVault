# 🛡️ TriVault

TriVault is a minimal, ultra-secure, and client-side encrypted Progressive Web App (PWA) that combines a free-form secure notepad and a structured password vault.

It implements a **zero-knowledge architecture**, encrypting all data directly on your device using browser-native cryptography. Your backup payload is saved and loaded securely from your personal **Google Drive** using a unique combination of **three independent security keys** (your Encryption Keys Triad).

---

## 🌟 Key Features

*   **🔑 Encryption Keys Triad:** Secures your data using three separate, user-provided codes. To decrypt, all three keys must be entered correctly. It also features built-in cryptographically secure random triad generation.
*   **☁️ Google Drive Backup & Sync:** Connect your personal Google account to backup your encrypted payload (`trivault_data.json`) directly to Google Drive. Your keys and decrypted content never touch Google's servers.
*   **📦 Unified Storage (No Overwriting):** Both the Notepad text and Password Vault table entries are saved together inside a single unified encrypted container. You will never lose notes when saving passwords, or vice-versa.
*   **📝 Dual Workspace Modes:**
    *   **Text Notepad:** A clean, free-form text workspace for keeping secure logs, journals, or general notes.
    *   **Password Vault (KV Store):** A structured, dynamic table to store labels (e.g., website login, service name) and values (e.g., password, API token) with copy-to-clipboard functionality and password visibility toggles.
*   **🔒 Zero-Knowledge & Client-Side Encryption:** No remote servers, no cloud storage, and no tracking. All cryptographic operations occur strictly inside the browser. Only derived ciphertext is synced to your Google Drive.
*   **✨ Premium UI/UX & Navigation Flow:**
    *   **Google OAuth Sign-In:** A secure login card to authenticate your Google profile.
    *   **Credentials Setup:** Manage your keys with separate restore and generate tabs, copy shortcuts, and security checkboxes.
    *   **Interactive Dashboard:** Displays only Notepad and Password Vault workspaces with a sleek header containing status badges, sync controls, session lock, and full sign-out.
    *   **Auto-Load on Key Entry:** Simply type or paste your keys. Once all three reach at least 8 characters, the app automatically verifies your credentials and loads your backup after a 500ms typing pause. You can also press `Enter` to access immediately.

---

## 🔒 Cryptographic Details & Security Model

TriVault uses the standard **Web Crypto API** built natively into modern web browsers:

1.  **Normalization:** The three user-provided keys ($C_1$, $C_2$, $C_3$) are concatenated with a pipe delimiter (`|`) and converted into a UTF-8 byte array:
    $$\text{Derived Input} = C_1 \mathbin{\Vert} \text{"|"} \mathbin{\Vert} C_2 \mathbin{\Vert} \text{"|"} \mathbin{\Vert} C_3$$
2.  **Key Derivation:** The combined array is passed through **PBKDF2** (Password-Based Key Derivation Function 2) using a cryptographically secure 16-byte random salt, **250,000 iterations**, and a **SHA-256** hash function to derive a 256-bit master key.
3.  **Encryption:** The plaintext (a unified JSON container holding notepad text and vault keys) is encrypted using **AES-256-GCM** with a cryptographically secure 12-byte random Initialization Vector (IV).
4.  **Google Drive Upload:** The encrypted payload is serialized to a JSON string containing the base64-encoded `salt`, `iv`, and `ciphertext` and saved to your personal Google Drive in a file named `trivault_data.json`:
    ```json
    {
      "salt": "base64...",
      "iv": "base64...",
      "ciphertext": "base64..."
    }
    ```

> [!WARNING]
> **No Key Persistence:** Your three keys are never stored on Google Drive, in local storage, cookies, or browser memory (beyond the active session). If you lose even one of your three keys, your encrypted data **cannot be recovered**.

---

## 🚀 How to Run

### Requirements
- A modern web browser supporting the Web Crypto API and Service Workers (Chrome, Edge, Firefox, Safari).
- **Node.js** installed locally (required to serve the files on localhost).

### Steps
1.  **Clone the repository and navigate to the directory:**
    ```bash
    git clone https://github.com/amish6699/trivault.git
    cd TriVault
    ```
2.  **Configure environment credentials:**
    Copy the example configuration to `.env`:
    ```bash
    cp .env.example .env
    ```
    Open `.env` and configure your Google OAuth Client ID:
    ```env
    GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
    ```
3.  **Install dependencies (minimal dev server):**
    ```bash
    npm install
    ```
4.  **Start the local development server:**
    ```bash
    npm run start
    ```
    *This runs `npx http-server` on port 3000.*
5.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📖 User Guide / Walkthrough

1.  **Sign In with Google:**
    - Click **"Sign in with Google"** on the landing screen to authenticate your Google Profile. This connects the app to your personal Google Drive account.
2.  **Configure Encryption Keys:**
    - **Existing User (Restore):** Type or paste your existing three keys. As soon as you finish entering the keys (detected automatically via a 500ms typing pause once all keys have at least 8 characters, or immediately when pressing `Enter`), the app will fetch the encrypted backup from your Google Drive and verify your keys by attempting to decrypt the backup.
      - If decryption succeeds, you are automatically directed to the dashboard.
      - If decryption fails, you will see a warning toast and remain on the setup screen to correct your keys. This prevents accessing the dashboard with wrong keys and keeps your backup safe.
    - **New User (Generate):** Switch tabs, click **"Generate Key Triad"**, copy your keys, check the safety acknowledgment checkbox, and click **"Use Keys & Open Vault"**.
3.  **Work and Save:**
    - Edit text inside **Text Notepad** and manage passwords inside **Password Vault**.
    - Click **"Save to Drive"** inside the top navigation header to encrypt both notepad and vault structures into a unified payload and upload it to your Google Drive.
4.  **Session Controls:**
    - **Lock:** Wipes all plain-text inputs, notepad text, and vault tables from browser memory, and locks the interface back to the **Key Setup Screen**.
    - **Disconnect:** Signs out of Google OAuth completely, clears active session credentials, wipes memory, and exits back to the main **Google Sign-In View**.

---

## 📂 Project Structure

```bash
TriVault/
├── index.html          # Main UI structures (Login view, Keys view, and Dashboard view)
├── styles.css          # Design system, glassmorphic styles, and layout animations
├── renderer.js         # Core router, input listeners, Google API, and encryption logic
├── service-worker.js   # Service worker configuration for offline capability and caching
├── manifest.json       # PWA installer specifications
├── package.json        # Node server configurations and scripts
├── .env.example        # Placeholder environment configuration file
└── src/
    └── crypto-web.js   # Cryptographic engine (PBKDF2, AES-GCM)
```

---

## 📝 License

This project was created for fun and learning. Feel free to use, modify, and distribute it however you like.
