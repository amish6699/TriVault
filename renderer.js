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
const saveNoteBtn = document.getElementById('save-note')
const loadNoteBtn = document.getElementById('load-note')

const generateCodesBtn = document.getElementById('generate-codes')
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

// Save / Load encrypt logic
saveNoteBtn.addEventListener('click', async () => {
  try {
    const codes = getCodes()
    let plaintext
    if (mode === 'text') plaintext = notepad.value
    else plaintext = JSON.stringify({ type: 'kv', data: readKvData() })
    
    const payload = await encryptWeb(plaintext, codes)
    localStorage.setItem('trivault_note', payload)
    showToast('Saved encrypted note locally!', 'success')
  } catch (e) {
    showToast(e.message, 'error')
  }
})

loadNoteBtn.addEventListener('click', async () => {
  try {
    const codes = getCodes()
    const payload = localStorage.getItem('trivault_note')
    if (!payload) {
      showToast('No local note found in this browser.', 'error')
      return
    }
    const text = await decryptWeb(payload, codes)
    try {
      const parsed = JSON.parse(text)
      if (parsed && parsed.type === 'kv' && parsed.data) {
        populateKv(parsed.data)
        switchMode('kv')
        showToast('Vault loaded and decrypted!', 'success')
        return
      }
    } catch (e) {
      /* not JSON, treat as plain text */
    }
    notepad.value = text
    switchMode('text')
    showToast('Notepad loaded and decrypted!', 'success')
  } catch (e) {
    showToast('Decryption failed. Please check your keys.', 'error')
  }
})

// Auto-generate initial codes on load
generateCodes()

// Ensure initial mode state and at least one row for kv
switchMode('text')
