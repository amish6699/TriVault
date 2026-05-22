// Browser-side crypto using Web Crypto API
const enc = new TextEncoder()
const dec = new TextDecoder()

function bufToBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
}

function base64ToBuf(b64) {
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  return arr.buffer
}

async function _deriveKey(codesBuf, salt, iterations = 250000) {
  const baseKey = await crypto.subtle.importKey('raw', codesBuf, { name: 'PBKDF2' }, false, ['deriveKey'])
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function _normalizeCodes(codes) {
  return enc.encode(codes.join('|'))
}

export async function encrypt(plaintext, codes) {
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const codesBuf = _normalizeCodes(codes)
  const key = await _deriveKey(codesBuf, salt.buffer)
  const pt = enc.encode(plaintext)
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, pt)
  return JSON.stringify({ salt: bufToBase64(salt), iv: bufToBase64(iv), ciphertext: bufToBase64(ct) })
}

export async function decrypt(payloadString, codes) {
  let payload
  try { payload = JSON.parse(payloadString) } catch (e) { throw new Error('Invalid payload') }
  const salt = new Uint8Array(base64ToBuf(payload.salt))
  const iv = new Uint8Array(base64ToBuf(payload.iv))
  const ct = base64ToBuf(payload.ciphertext)
  const codesBuf = _normalizeCodes(codes)
  const key = await _deriveKey(codesBuf, salt.buffer)
  try {
    const ptBuf = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: iv }, key, ct)
    return dec.decode(ptBuf)
  } catch (e) {
    throw new Error('Decryption failed')
  }
}

export default { encrypt, decrypt }
