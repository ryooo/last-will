import * as fs from 'fs'

import { getConfig } from '../config'
import { encrypt } from '../crypt'

const encryptLastWill = (): void => {
  const config = getConfig()
  const json = fs.readFileSync('last-will.json', 'utf-8')
  fs.writeFileSync(
    'last-will.json.enc',
    encrypt(json, config.cryptPass, config.cryptSalt)
  )
}

encryptLastWill()
