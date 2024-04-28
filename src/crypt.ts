import * as crypto from 'crypto'

export const encrypt = (
  plain: string,
  password: string,
  salt: string
): string => {
  const secretKey = crypto.scryptSync(password, salt, 32)
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv('aes-256-ctr', secretKey, iv)
  const encrypted = Buffer.concat([
    cipher.update(plain, 'utf8'),
    cipher.final()
  ])

  return Buffer.concat([iv, encrypted]).toString('base64')
}

export const decrypt = (
  encryptedStr: string,
  password: string,
  salt: string
): string => {
  const encrypted = Buffer.from(encryptedStr, 'base64')
  const secretKey = crypto.scryptSync(password, salt, 32)
  const iv = encrypted.subarray(0, 16)
  const value = encrypted.subarray(16)

  const decipher = crypto.createDecipheriv('aes-256-ctr', secretKey, iv)
  const decrypted = Buffer.concat([decipher.update(value), decipher.final()])

  return decrypted.toString('utf8')
}
