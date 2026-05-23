import { encrypt as encryptWeb, decrypt as decryptWeb } from './src/crypto-web.js'

// Elements
const code1Input = document.getElementById('code1')
const code2Input = document.getElementById('code2')
const code3Input = document.getElementById('code3')
const revealPanel = document.getElementById('reveal-panel')
const labelCode1 = document.getElementById('label-code-1')
const labelCode2 = document.getElementById('label-code-2')
const labelCode3 = document.getElementById('label-code-3')

const notepad = document.getElementById('notepad')


const generateCodesBtn = document.getElementById('btn-generate-keys')
const copy1Btn = document.getElementById('copy-1')
const copy2Btn = document.getElementById('copy-2')
const copy3Btn = document.getElementById('copy-3')

const modeTextBtn = document.getElementById('mode-text')
const modeKvBtn = document.getElementById('mode-kv')
const textModeDiv = document.getElementById('text-mode')
const kvModeDiv = document.getElementById('kv-mode')
const addRowBtn = document.getElementById('add-row')
const kvTbody = document.getElementById('kv-tbody')

let mode = 'text'

// Custom Toast System
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container')
  if (!container) return
  
  const toast = document.createElement('div')
  toast.className = `toast-item toast-${type}`
  toast.textContent = message
  
  container.appendChild(toast)
  
  // Auto-remove toast after 3 seconds
  setTimeout(() => {
    toast.classList.add('toast-fadeout')
    toast.addEventListener('animationend', () => {
      toast.remove()
    })
  }, 3000)
}

// Utilities
function _randomCode(len = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789'
  let out = ''
  const arr = new Uint32Array(len)
  window.crypto.getRandomValues(arr)
  for (let i = 0; i < len; i++) out += chars[arr[i] % chars.length]
  return out
}

function generateCodes() {
  const a = _randomCode(8)
  const b = _randomCode(8)
  const c = _randomCode(8)
  
  // Set values to masked inputs
  code1Input.value = a
  code2Input.value = b
  code3Input.value = c
  
  // Set labels in the reveal panel
  labelCode1.textContent = a
  labelCode2.textContent = b
  labelCode3.textContent = c
  
  // Show the reveal panel
  revealPanel.style.display = 'flex'
  
  showToast('Generated 3 new secure keys!', 'success')
}

function setupCopy(btn, textFn, label = 'Key') {
  if (!btn) return
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(textFn())
      showToast(`${label} copied to clipboard!`, 'success')
    } catch (e) {
      showToast('Copy failed', 'error')
    }
  })
}

if (generateCodesBtn) generateCodesBtn.addEventListener('click', generateCodes)
setupCopy(copy1Btn, () => labelCode1.textContent, 'Key 1')
setupCopy(copy2Btn, () => labelCode2.textContent, 'Key 2')
setupCopy(copy3Btn, () => labelCode3.textContent, 'Key 3')

// Toggle Password Visibility Logic
document.querySelectorAll('.toggle-password').forEach(button => {
  button.addEventListener('click', () => {
    const targetId = button.getAttribute('data-target')
    const targetInput = document.getElementById(targetId)
    if (!targetInput) return
    
    const isPassword = targetInput.type === 'password'
    targetInput.type = isPassword ? 'text' : 'password'
    
    // Change SVG icon depending on visibility
    if (isPassword) {
      // Eye-off icon
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `
    } else {
      // Eye icon
      button.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `
    }
  })
})

function getCodes() {
  const c1 = code1Input.value.trim()
  const c2 = code2Input.value.trim()
  const c3 = code3Input.value.trim()
  
  if (!c1 || !c2 || !c3) {
    throw new Error('Please fill in all three keys to proceed.')
  }
  return [c1, c2, c3]
}

// Mode switching
function switchMode(m) {
  mode = m
  if (m === 'text') {
    textModeDiv.style.display = ''
    kvModeDiv.style.display = 'none'
    modeTextBtn.classList.add('active')
    modeKvBtn.classList.remove('active')
  } else {
    textModeDiv.style.display = 'none'
    kvModeDiv.style.display = ''
    modeTextBtn.classList.remove('active')
    modeKvBtn.classList.add('active')
    // ensure at least one row exists
    if (kvTbody.children.length === 0) addRow()
  }
}

if (modeTextBtn) modeTextBtn.addEventListener('click', () => switchMode('text'))
if (modeKvBtn) modeKvBtn.addEventListener('click', () => switchMode('kv'))

// KV table management
function addRow(key = '', value = '') {
  const tr = document.createElement('tr')

  const tdKey = document.createElement('td')
  const keyInput = document.createElement('input')
  keyInput.type = 'text'
  keyInput.className = 'form-control'
  keyInput.placeholder = 'e.g. Google Password'
  keyInput.value = key
  tdKey.appendChild(keyInput)

  const tdVal = document.createElement('td')
  const valInput = document.createElement('input')
  valInput.type = 'password' // Secure by default
  valInput.className = 'form-control'
  valInput.placeholder = 'Secret value'
  valInput.value = value
  
  // Wrap value input with a show/hide toggle for privacy in rows
  const inputWrapper = document.createElement('div')
  inputWrapper.style.position = 'relative'
  inputWrapper.style.display = 'flex'
  inputWrapper.style.alignItems = 'center'
  
  valInput.style.paddingRight = '40px'
  inputWrapper.appendChild(valInput)
  
  const toggleRowBtn = document.createElement('button')
  toggleRowBtn.type = 'button'
  toggleRowBtn.className = 'toggle-password'
  toggleRowBtn.style.position = 'absolute'
  toggleRowBtn.style.right = '12px'
  toggleRowBtn.style.background = 'none'
  toggleRowBtn.style.border = 'none'
  toggleRowBtn.style.padding = '0'
  toggleRowBtn.style.color = 'var(--text-muted)'
  toggleRowBtn.style.cursor = 'pointer'
  toggleRowBtn.style.display = 'flex'
  toggleRowBtn.style.alignItems = 'center'
  
  toggleRowBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
      <circle cx="12" cy="12" r="3"></circle>
    </svg>
  `
  
  toggleRowBtn.addEventListener('click', () => {
    const isPw = valInput.type === 'password'
    valInput.type = isPw ? 'text' : 'password'
    if (isPw) {
      toggleRowBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
          <line x1="1" y1="1" x2="23" y2="23"></line>
        </svg>
      `
    } else {
      toggleRowBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
          <circle cx="12" cy="12" r="3"></circle>
        </svg>
      `
    }
  })
  
  inputWrapper.appendChild(toggleRowBtn)
  tdVal.appendChild(inputWrapper)

  const tdActions = document.createElement('td')
  tdActions.style.whiteSpace = 'nowrap'
  tdActions.style.display = 'flex'
  tdActions.style.gap = '6px'
  
  const copyBtn = document.createElement('button')
  copyBtn.className = 'btn btn-sm btn-icon-only'
  copyBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
  `
  copyBtn.title = 'Copy secret'
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(valInput.value)
      showToast(`Copied secret for "${keyInput.value || 'entry'}"!`, 'success')
    } catch (e) {
      showToast('Copy failed', 'error')
    }
  })

  const delBtn = document.createElement('button')
  delBtn.className = 'btn btn-sm btn-icon-only'
  delBtn.style.color = '#ef4444'
  delBtn.style.borderColor = 'rgba(239, 68, 68, 0.2)'
  delBtn.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
  `
  delBtn.title = 'Delete entry'
  delBtn.addEventListener('click', () => {
    tr.style.opacity = '0'
    tr.style.transform = 'translateY(10px)'
    tr.style.transition = 'all 0.25s ease'
    setTimeout(() => {
      tr.remove()
      showToast('Entry removed', 'info')
    }, 250)
  })

  tdActions.appendChild(copyBtn)
  tdActions.appendChild(delBtn)

  tr.appendChild(tdKey)
  tr.appendChild(tdVal)
  tr.appendChild(tdActions)

  // Smooth slide-in for new rows
  tr.style.opacity = '0'
  tr.style.transform = 'translateY(10px)'
  tr.style.transition = 'all 0.25s ease'
  
  kvTbody.appendChild(tr)
  
  // Trigger layout reflow for animation
  setTimeout(() => {
    tr.style.opacity = '1'
    tr.style.transform = 'translateY(0)'
  }, 10)

  return tr
}

if (addRowBtn) addRowBtn.addEventListener('click', () => addRow())

// Read values from table entries
function readKvData() {
  const data = {}
  Array.from(kvTbody.querySelectorAll('tr')).forEach(tr => {
    const inputs = tr.querySelectorAll('input')
    if (inputs.length >= 2) {
      const k = inputs[0].value.trim()
      const v = inputs[1].value
      if (k) data[k] = v
    }
  })
  return data
}

function populateKv(data) {
  kvTbody.innerHTML = ''
  const keys = Object.keys(data || {})
  if (keys.length === 0) {
    addRow()
    return
  }
  keys.forEach(k => addRow(k, data[k]))
}

function serializeData() {
  return JSON.stringify({
    version: 2,
    notepad: notepad.value,
    vault: readKvData()
  })
}

function deserializeData(text) {
  try {
    const parsed = JSON.parse(text)
    if (parsed && (parsed.version === 2 || ('notepad' in parsed && 'vault' in parsed))) {
      notepad.value = parsed.notepad || ''
      populateKv(parsed.vault || {})
      return { type: 'unified' }
    }
    if (parsed && parsed.type === 'kv' && parsed.data) {
      notepad.value = ''
      populateKv(parsed.data)
      return { type: 'kv' }
    }
  } catch (e) {
    // Fall back to plain text
  }
  notepad.value = text || ''
  populateKv({})
  return { type: 'text' }
}



// Google Drive Sync Configuration & Elements
let GOOGLE_CLIENT_ID = ''

async function loadEnvConfig() {
  try {
    let response = await fetch('/.env')
    if (!response.ok) {
      // Fallback to .env.example
      response = await fetch('/.env.example')
    }
    if (response.ok) {
      const text = await response.text()
      const lines = text.split('\n')
      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx === -1) continue
        const key = trimmed.substring(0, eqIdx).trim()
        let val = trimmed.substring(eqIdx + 1).trim()
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.substring(1, val.length - 1)
        }
        if (key === 'GOOGLE_CLIENT_ID') {
          GOOGLE_CLIENT_ID = val
          break
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load environment configuration:', e)
  }
}

const googleConnectBtn = document.getElementById('google-connect-btn')
const googleDisconnectBtn = document.getElementById('setup-signout')
const googleUserAvatar = document.getElementById('google-user-avatar')
const googleUserEmail = document.getElementById('google-user-email')
const googleSaveBtn = document.getElementById('google-save-btn')
const googleLoadBtn = document.getElementById('google-load-btn')
const googleSyncStatus = document.getElementById('google-sync-status')

let oauthToken = ''
let tokenClient = null
let userProfile = null

function initGoogleClient() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
    console.warn('Google Client ID placeholder is not replaced. Please set GOOGLE_CLIENT_ID in .env')
    return
  }

  if (typeof google === 'undefined' || !google.accounts || !google.accounts.oauth2) {
    console.log('Google Identity Services SDK not loaded yet. Retrying in 1s...')
    setTimeout(initGoogleClient, 1000)
    return
  }

  try {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile',
      callback: async (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          showToast('Google Authorization failed: ' + tokenResponse.error, 'error')
          return
        }
        oauthToken = tokenResponse.access_token
        localStorage.setItem('trivault_google_token', oauthToken)
        localStorage.setItem('trivault_google_token_expiry', (Date.now() + tokenResponse.expires_in * 1000).toString())
        
        try {
          await fetchUserProfile()
          showConnectedState()
          showView('view-keys')
          showToast('Successfully connected to Google Drive!', 'success')
        } catch (e) {
          showToast('Failed to fetch user profile.', 'error')
        }
      }
    })

    const storedToken = localStorage.getItem('trivault_google_token')
    const expiry = parseInt(localStorage.getItem('trivault_google_token_expiry') || '0', 10)
    if (storedToken && expiry > Date.now()) {
      oauthToken = storedToken
      fetchUserProfile().then(() => {
        showConnectedState()
        showView('view-keys')
      }).catch(() => {
        disconnectGoogle()
      })
    }
  } catch (e) {
    console.error('Error initializing GIS Client:', e)
    showToast('Failed to initialize Google client. Check your Client ID.', 'error')
  }
}

async function fetchUserProfile() {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { 'Authorization': `Bearer ${oauthToken}` }
  })
  if (!res.ok) throw new Error('Failed to fetch user profile')
  userProfile = await res.json()
}

function showConnectedState() {
  if (userProfile) {
    // Setup View Badge
    const setupAvatar = document.getElementById('setup-avatar')
    const setupEmail = document.getElementById('setup-email')
    if (setupEmail) setupEmail.textContent = userProfile.email || ''
    if (userProfile.picture && setupAvatar) {
      setupAvatar.src = userProfile.picture
      setupAvatar.style.display = 'block'
    } else if (setupAvatar) {
      setupAvatar.style.display = 'none'
    }

    // Dashboard View Badge
    if (googleUserEmail) googleUserEmail.textContent = userProfile.email || ''
    if (userProfile.picture && googleUserAvatar) {
      googleUserAvatar.src = userProfile.picture
      googleUserAvatar.style.display = 'block'
    } else if (googleUserAvatar) {
      googleUserAvatar.style.display = 'none'
    }
  }
  
  const lastSync = localStorage.getItem('trivault_last_sync')
  if (googleSyncStatus) {
    googleSyncStatus.textContent = lastSync ? `Last synced: ${lastSync}` : 'Last synced: Never'
  }
}

function disconnectGoogle() {
  oauthToken = ''
  userProfile = null
  localStorage.removeItem('trivault_google_token')
  localStorage.removeItem('trivault_google_token_expiry')
  
  if (code1Input) code1Input.value = ''
  if (code2Input) code2Input.value = ''
  if (code3Input) code3Input.value = ''
  
  if (notepad) notepad.value = ''
  if (kvTbody) kvTbody.innerHTML = ''
  
  if (revealPanel) revealPanel.style.display = 'none'
  const savedCheckbox = document.getElementById('check-keys-saved')
  if (savedCheckbox) savedCheckbox.checked = false
  const useGenKeysBtn = document.getElementById('btn-use-generated-keys')
  if (useGenKeysBtn) useGenKeysBtn.disabled = true
  
  if (googleUserAvatar) {
    googleUserAvatar.style.display = 'none'
    googleUserAvatar.src = ''
  }
  if (googleUserEmail) googleUserEmail.textContent = ''
  if (googleSyncStatus) googleSyncStatus.textContent = 'Last synced: Never'
  
  showView('view-login')
  showToast('Disconnected from Google Drive', 'info')
}

if (googleConnectBtn) {
  googleConnectBtn.addEventListener('click', () => {
    if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID.startsWith('YOUR_GOOGLE_CLIENT_ID')) {
      showToast('OAuth Client ID is not configured. Developer must set GOOGLE_CLIENT_ID in .env.', 'error')
      return
    }
    if (tokenClient) {
      tokenClient.requestAccessToken()
    } else {
      initGoogleClient()
      setTimeout(() => {
        if (tokenClient) tokenClient.requestAccessToken()
        else showToast('Google Client not ready yet.', 'error')
      }, 500)
    }
  })
}

if (googleDisconnectBtn) {
  googleDisconnectBtn.addEventListener('click', disconnectGoogle)
}

async function findDriveFile() {
  const url = 'https://www.googleapis.com/drive/v3/files?q=' + 
              encodeURIComponent("name = 'trivault_data.json' and trashed = false") + 
              '&spaces=drive&fields=' + encodeURIComponent('files(id, name)');
  const res = await fetch(url, {
    headers: { 'Authorization': `Bearer ${oauthToken}` }
  })
  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('UNAUTHORIZED')
    }
    throw new Error('Failed to search Google Drive')
  }
  const data = await res.json()
  return data.files && data.files.length > 0 ? data.files[0].id : null
}

async function ensureAuthorized(actionFn) {
  const expiry = parseInt(localStorage.getItem('trivault_google_token_expiry') || '0', 10)
  if (!oauthToken || expiry < Date.now()) {
    showToast('Google session expired or not connected. Reconnecting...', 'info')
    if (tokenClient) {
      tokenClient.requestAccessToken()
    } else {
      initGoogleClient()
      setTimeout(() => {
        if (tokenClient) tokenClient.requestAccessToken()
      }, 500)
    }
    return false
  }
  try {
    return await actionFn()
  } catch (e) {
    if (e.message === 'UNAUTHORIZED') {
      showToast('Session expired. Reconnecting...', 'info')
      if (tokenClient) tokenClient.requestAccessToken()
    } else if (e.message !== 'DECRYPTION_FAILED') {
      showToast(e.message, 'error')
    }
    return false
  }
}

async function saveToDrive() {
  const codes = getCodes()
  const plaintext = serializeData()
  const payload = await encryptWeb(plaintext, codes)
  
  googleSaveBtn.disabled = true
  googleSaveBtn.textContent = 'Saving...'
  
  try {
    const fileId = await findDriveFile()
    let response
    if (fileId) {
      const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`
      response = await fetch(url, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Content-Type': 'application/json'
        },
        body: payload
      })
    } else {
      const metadata = {
        name: 'trivault_data.json',
        mimeType: 'application/json'
      }
      const boundary = 'trivault_multipart_boundary'
      const delimiter = `\r\n--${boundary}\r\n`
      const closeDelimiter = `\r\n--${boundary}--`

      const body = 
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        payload +
        closeDelimiter

      const url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart'
      response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${oauthToken}`,
          'Content-Type': `multipart/related; boundary=${boundary}`
        },
        body: body
      })
    }

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      throw new Error('Failed to save file to Google Drive')
    }

    localStorage.setItem('trivault_note', payload)
    
    const timeStr = new Date().toLocaleString()
    localStorage.setItem('trivault_last_sync', timeStr)
    googleSyncStatus.textContent = `Last synced: ${timeStr}`
    
    showToast('Vault successfully saved to Google Drive!', 'success')
  } finally {
    googleSaveBtn.disabled = false
    googleSaveBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.2 15v3.8a2 2 0 0 1-2 2H4.8a2 2 0 0 1-2-2V15M17 10l-5 5-5-5M12 15V3"/>
      </svg>
      Save to Drive
    `
  }
}

async function loadFromDrive() {
  const codes = getCodes()
  
  googleLoadBtn.disabled = true
  googleLoadBtn.textContent = 'Loading...'
  
  try {
    const fileId = await findDriveFile()
    if (!fileId) {
      showToast('No TriVault backup file found in Google Drive.', 'error')
      return true
    }
    
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${oauthToken}` }
    })
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('UNAUTHORIZED')
      }
      throw new Error('Failed to fetch backup file from Google Drive')
    }
    
    const payload = await response.text()
    const text = await decryptWeb(payload, codes)
    const result = deserializeData(text)
    
    if (result.type === 'unified') {
      showToast('Vault loaded from Google Drive & decrypted!', 'success')
    } else if (result.type === 'kv') {
      switchMode('kv')
      showToast('Vault loaded from Google Drive & decrypted!', 'success')
    } else {
      switchMode('text')
      showToast('Notepad loaded from Google Drive & decrypted!', 'success')
    }
    
    localStorage.setItem('trivault_note', payload)
    return true
  } catch (e) {
    if (e.message !== 'UNAUTHORIZED') {
      showToast('Decryption failed. Please check your keys.', 'error')
      throw new Error('DECRYPTION_FAILED')
    } else {
      throw e
    }
  } finally {
    googleLoadBtn.disabled = false
    googleLoadBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21.2 15v3.8a2 2 0 0 1-2 2H4.8a2 2 0 0 1-2-2V15M7 10l5-5 5 5M12 3v12"/>
      </svg>
      Load from Drive
    `
  }
}

if (googleSaveBtn) {
  googleSaveBtn.addEventListener('click', () => ensureAuthorized(saveToDrive))
}

if (googleLoadBtn) {
  googleLoadBtn.addEventListener('click', () => ensureAuthorized(loadFromDrive))
}


// --- View Switcher and Navigation ---
function showView(viewId) {
  document.getElementById('view-login').style.display = 'none'
  document.getElementById('view-keys').style.display = 'none'
  document.getElementById('view-dashboard').style.display = 'none'
  
  const target = document.getElementById(viewId)
  if (target) {
    target.style.display = 'flex'
  }
}

// Setup View Tab Toggles
const tabExisting = document.getElementById('tab-existing-keys')
const tabNew = document.getElementById('tab-new-keys')
const flowExisting = document.getElementById('flow-existing')
const flowNew = document.getElementById('flow-new')

if (tabExisting && tabNew && flowExisting && flowNew) {
  tabExisting.addEventListener('click', () => {
    tabExisting.classList.add('active')
    tabNew.classList.remove('active')
    flowExisting.style.display = 'flex'
    flowNew.style.display = 'none'
  })
  tabNew.addEventListener('click', () => {
    tabNew.classList.add('active')
    tabExisting.classList.remove('active')
    flowExisting.style.display = 'none'
    flowNew.style.display = 'flex'
  })
}

// Checkbox to Enable/Disable generated key submission
const checkKeysSaved = document.getElementById('check-keys-saved')
const btnUseGeneratedKeys = document.getElementById('btn-use-generated-keys')
if (checkKeysSaved && btnUseGeneratedKeys) {
  checkKeysSaved.addEventListener('change', (e) => {
    btnUseGeneratedKeys.disabled = !e.target.checked
  })
}

// Keys Submit Handlers
let autoSubmitTimeout = null

async function submitKeys() {
  if (autoSubmitTimeout) {
    clearTimeout(autoSubmitTimeout)
    autoSubmitTimeout = null
  }
  
  try {
    getCodes() // Checks that all keys are provided
    
    // If existing user, verify and load first before showing the dashboard
    if (tabExisting && tabExisting.classList.contains('active')) {
      const btnSubmit = document.getElementById('btn-submit-keys')
      let originalText = 'Access Vault'
      if (btnSubmit) {
        originalText = btnSubmit.textContent
        btnSubmit.disabled = true
        btnSubmit.textContent = 'Verifying & Loading...'
      }
      try {
        const loaded = await ensureAuthorized(loadFromDrive)
        if (!loaded) {
          return // Keep on key entry view
        }
      } finally {
        if (btnSubmit) {
          btnSubmit.disabled = false
          btnSubmit.textContent = originalText
        }
      }
    }
    
    showView('view-dashboard')
    showToast('Vault credentials configured!', 'success')
    
    // If new user, load from drive (usually will be empty or not found, but we won't block)
    if (tabNew && tabNew.classList.contains('active')) {
      await ensureAuthorized(loadFromDrive)
    }
  } catch (e) {
    showToast(e.message, 'error')
  }
}

if (btnUseGeneratedKeys) {
  btnUseGeneratedKeys.addEventListener('click', submitKeys)
}
const btnSubmitKeys = document.getElementById('btn-submit-keys')
if (btnSubmitKeys) {
  btnSubmitKeys.addEventListener('click', submitKeys)
}

function checkAndAutoSubmitKeys() {
  if (autoSubmitTimeout) {
    clearTimeout(autoSubmitTimeout)
  }
  
  const viewKeys = document.getElementById('view-keys')
  if (!viewKeys || viewKeys.style.display === 'none') return
  
  if (tabExisting && !tabExisting.classList.contains('active')) return
  
  const c1 = code1Input.value.trim()
  const c2 = code2Input.value.trim()
  const c3 = code3Input.value.trim()
  
  if (c1.length >= 8 && c2.length >= 8 && c3.length >= 8) {
    autoSubmitTimeout = setTimeout(() => {
      submitKeys()
    }, 500)
  }
}

function handleKeydown(e) {
  if (e.key === 'Enter') {
    if (autoSubmitTimeout) {
      clearTimeout(autoSubmitTimeout)
    }
    submitKeys()
  }
}

if (code1Input) {
  code1Input.addEventListener('input', checkAndAutoSubmitKeys)
  code1Input.addEventListener('keydown', handleKeydown)
}
if (code2Input) {
  code2Input.addEventListener('input', checkAndAutoSubmitKeys)
  code2Input.addEventListener('keydown', handleKeydown)
}
if (code3Input) {
  code3Input.addEventListener('input', checkAndAutoSubmitKeys)
  code3Input.addEventListener('keydown', handleKeydown)
}

// Lock Dashboard Session
const btnLock = document.getElementById('btn-lock')
if (btnLock) {
  btnLock.addEventListener('click', () => {
    if (code1Input) code1Input.value = ''
    if (code2Input) code2Input.value = ''
    if (code3Input) code3Input.value = ''
    
    if (notepad) notepad.value = ''
    if (kvTbody) kvTbody.innerHTML = ''
    
    if (checkKeysSaved) checkKeysSaved.checked = false
    if (btnUseGeneratedKeys) btnUseGeneratedKeys.disabled = true
    if (revealPanel) revealPanel.style.display = 'none'
    
    showView('view-keys')
    showToast('Vault locked.', 'info')
  })
}

// Disconnect/Logout Dashboard Session
const btnDisconnect = document.getElementById('btn-disconnect')
if (btnDisconnect) {
  btnDisconnect.addEventListener('click', disconnectGoogle)
}

// Ensure initial mode state and at least one row for kv
switchMode('text')

// Set initial view state to login
showView('view-login')

// Initialize Google Client on load after environment configuration is loaded
loadEnvConfig().then(() => {
  initGoogleClient()
})
