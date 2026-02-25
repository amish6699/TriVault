const crypto = require('crypto')

function _deriveKey(codesBuffer, salt) {
  // codesBuffer should be a Buffer
  // Use PBKDF2 to derive 32-byte key
  return crypto.pbkdf2Sync(codesBuffer, salt, 250000, 32, 'sha256')
}

function _normalizeCodes(codes) {
  // codes is expected to be an array of three strings
  return Buffer.from(codes.join('|'), 'utf8')
}

function encrypt(plaintext, codes) {
  const salt = crypto.randomBytes(16)
  const iv = crypto.randomBytes(12)
  const codesBuf = _normalizeCodes(codes)
  const key = _deriveKey(codesBuf, salt)

  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const ct = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return JSON.stringify({
    salt: salt.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    ciphertext: ct.toString('base64')
  })
}

function decrypt(payloadString, codes) {
  let payload
  try {
    payload = JSON.parse(payloadString)
  } catch (e) {
    throw new Error('Invalid payload')
  }
  const salt = Buffer.from(payload.salt, 'base64')
  const iv = Buffer.from(payload.iv, 'base64')
  const tag = Buffer.from(payload.tag, 'base64')
  const ct = Buffer.from(payload.ciphertext, 'base64')

  const codesBuf = _normalizeCodes(codes)
  const key = _deriveKey(codesBuf, salt)

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const pt = Buffer.concat([decipher.update(ct), decipher.final()])
  return pt.toString('utf8')
}

module.exports = { encrypt, decrypt }
