import * as fs from 'fs'

import { getConfig } from '../config'
import { decrypt } from '../crypt'

const decryptLastWill = (): void => {
  const config = getConfig()
  const base64 = fs.readFileSync('last-will.json.enc', 'utf-8')
  fs.writeFileSync(
    'last-will.json',
    decrypt(base64, config.cryptPass, config.cryptSalt)
  )
}

decryptLastWill()
