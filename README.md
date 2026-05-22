# 🛡️ TriVault

TriVault is a minimal, ultra-secure, and offline-first Progressive Web App (PWA) that combines a free-form secure notepad and a structured password vault. 

It implements a **zero-knowledge architecture**, encrypting all data directly on your device using browser-native cryptography and a unique combination of **three independent security keys** (your Encryption Keys Triad).

---

## 🌟 Key Features

*   **🔑 Encryption Keys Triad:** Secures your data using three separate, user-provided codes. To decrypt, all three keys must be entered correctly. It also features built-in cryptographically secure random triad generation.
*   **📝 Dual Workspace Modes:**
    *   **Text Notepad:** A clean, free-form text workspace for keeping secure logs, journals, or general notes.
    *   **Password Vault (KV Store):** A structured, dynamic table to store labels (e.g., website login, service name) and values (e.g., password, API token) with copy-to-clipboard functionality and password visibility toggles.
*   **🔒 Zero-Knowledge & Client-Side Encryption:** No remote servers, no cloud storage, and no tracking. All cryptographic operations occur strictly inside the browser. Only the derived ciphertext and encryption parameters are stored.
*   **📱 Installable PWA (Offline Ready):** Fully offline-functional service worker that caches all core application assets. You can install it on your mobile device's home screen or desktop for a standalone, app-like experience.
*   **✨ Premium UI/UX:** Dark mode aesthetics with glassmorphic elements, smooth custom transitions, real-time toast notifications, and interactive visibility controls.

---

## 🔒 Cryptographic Details & Security Model

TriVault uses the standard **Web Crypto API** built natively into modern web browsers:

1.  **Normalization:** The three user-provided keys ($C_1$, $C_2$, $C_3$) are concatenated with a pipe delimiter (`|`) and converted into a UTF-8 byte array:
    $$\text{Derived Input} = C_1 \mathbin{\Vert} \text{"|"} \mathbin{\Vert} C_2 \mathbin{\Vert} \text{"|"} \mathbin{\Vert} C_3$$
2.  **Key Derivation:** The combined array is passed through **PBKDF2** (Password-Based Key Derivation Function 2) using a cryptographically secure 16-byte random salt, **250,000 iterations**, and a **SHA-256** hash function to derive a 256-bit master key.
3.  **Encryption:** The plaintext (notepad text or serialized JSON vault database) is encrypted using **AES-256-GCM** with a cryptographically secure 12-byte random Initialization Vector (IV).
4.  **Local Storage:** The encrypted payload is serialized to a JSON string containing the base64-encoded `salt`, `iv`, and `ciphertext` and saved to browser `localStorage` under the key `trivault_note`:
    ```json
    {
      "salt": "base64...",
      "iv": "base64...",
      "ciphertext": "base64..."
    }
    ```

> [!WARNING]
> **No Key Persistence:** Your three keys are never stored in `localStorage`, cookies, memory (beyond the active session), or sent over the network. If you lose or forget even one of the three keys, your encrypted data **cannot be recovered**.

---

## 🚀 How to Run

### Requirements
- A modern web browser supporting the Web Crypto API and Service Workers (Chrome, Edge, Firefox, Safari).
- **Node.js** installed locally (only required to serve the files on localhost).

### Steps
1.  **Clone the repository and navigate to the directory:**
    ```bash
    git clone https://github.com/amish6699/trivault.git
    cd TriVault
    ```
2.  **Install dependencies (minimal dev server):**
    ```bash
    npm install
    ```
3.  **Start the local development server:**
    ```bash
    npm run start
    ```
    *This runs `npx http-server` on port 3000.*
4.  **Open the application:**
    Open [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 📖 User Guide / Walkthrough

1.  **Initialize/Enter Keys:**
    - On first load, TriVault automatically generates a secure, random triad for you. 
    - You can write down and copy these keys, or click **"Generate Key Triad"** to get a new set.
    - If you already have your triad keys, type them into the **Key 1**, **Key 2**, and **Key 3** fields. Click the eye icons to toggle visibility.
2.  **Create / Modify Data:**
    - **Notepad Mode:** Click **"Text Notepad"** and write your text.
    - **Password Vault Mode:** Click **"Password Vault"** to switch to the table. Click **"Add Vault Entry"** to create label-secret rows. Copy values directly with the copy button, or delete rows using the trash bin icon.
3.  **Save Your Data:**
    - With your keys populated, click **"Save Encrypted Locally"**.
    - This will encrypt the active mode's data and save the secure payload to your browser's local storage.
4.  **Load & Decrypt:**
    - To load data in a new session, fill in your exact three keys.
    - Click **"Load & Decrypt"**. The application will automatically detect whether the saved data was a plain text notepad or a password vault, decrypt it, and switch to the correct tab.

---

## 📂 Project Structure

```bash
TriVault/
├── index.html          # Main UI structure and DOM elements
├── styles.css          # Design system, glassmorphic themes, animations
├── renderer.js         # UI events, logic, and local storage integration
├── service-worker.js   # Service worker configuration for offline capability
├── manifest.json       # PWA installer specifications
├── package.json        # Node configuration and run scripts
└── src/
    └── crypto-web.js   # Cryptographic engine (PBKDF2, AES-GCM)
```

---

## 📝 License

This project was created for fun and learning. Feel free to use, modify, and distribute it however you like.
