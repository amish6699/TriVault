const codesInput = document.getElementById('codes')
const notepad = document.getElementById('notepad')
const saveNoteBtn = document.getElementById('save-note')
const loadNoteBtn = document.getElementById('load-note')

const pKey = document.getElementById('p-key')
const pValue = document.getElementById('p-value')
const addPBtn = document.getElementById('add-p')
const pwList = document.getElementById('pw-list')
const savePwBtn = document.getElementById('save-pw')
const loadPwBtn = document.getElementById('load-pw')

let passwords = {}

function getCodes() {
  const raw = codesInput.value || ''
  const parts = raw.split(',').map(s => s.trim()).filter(Boolean)
  if (parts.length !== 3) throw new Error('Enter exactly 3 codes separated by commas')
  return parts
}

addPBtn.addEventListener('click', () => {
  const k = pKey.value.trim()
  const v = pValue.value.trim()
  if (!k || !v) return
  passwords[k] = v
  renderPw()
  pKey.value = ''
  pValue.value = ''
})

function renderPw() {
  pwList.innerHTML = ''
  Object.keys(passwords).forEach(k => {
    const li = document.createElement('li')
    const btn = document.createElement('button')
    btn.textContent = 'Copy'
    btn.addEventListener('click', () => navigator.clipboard.writeText(passwords[k]))
    li.textContent = `${k}: `
    li.appendChild(btn)
    pwList.appendChild(li)
  })
}

saveNoteBtn.addEventListener('click', async () => {
  try {
    const codes = getCodes()
    const payload = await window.api.encrypt(notepad.value, codes)
    await window.api.saveLocal('trivault_note.json', payload)
    alert('Saved encrypted note locally')
  } catch (e) { alert(e.message) }
})

loadNoteBtn.addEventListener('click', async () => {
  try {
    const codes = getCodes()
    const payload = await window.api.loadLocal('trivault_note.json')
    if (!payload) { alert('No local note found'); return }
    const text = await window.api.decrypt(payload, codes)
    notepad.value = text
  } catch (e) { alert('Decrypt failed: ' + e.message) }
})

savePwBtn.addEventListener('click', async () => {
  try {
    const codes = getCodes()
    const payload = await window.api.encrypt(JSON.stringify(passwords), codes)
    await window.api.saveLocal('trivault_pw.json', payload)
    alert('Saved encrypted passwords locally')
  } catch (e) { alert(e.message) }
})

loadPwBtn.addEventListener('click', async () => {
  try {
    const codes = getCodes()
    const payload = await window.api.loadLocal('trivault_pw.json')
    if (!payload) { alert('No local passwords found'); return }
    const text = await window.api.decrypt(payload, codes)
    passwords = JSON.parse(text)
    renderPw()
  } catch (e) { alert('Decrypt failed: ' + e.message) }
})
