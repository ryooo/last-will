import * as fs from 'fs'

import { getConfig } from './config'
import { decrypt, encrypt } from './crypt'

export type LastWill = {
  messages: LastWillMessage[]
}

export type LastWillMessage = {
  condition: Condition
  message: string
}

export type Condition =
  | ConditionDate
  | ConditionAccount
  | ConditionDateAndAccount

export type ConditionDate = {
  type: 'date'
  date: string
}

export type ConditionAccount = {
  type: 'account'
  account: {
    silentDays: number
    userName: string
  }
}

export type ConditionDateAndAccount = {
  type: 'dateAndAccount'
  date: string
  account: {
    minSilentDays: number
    userName: string
  }
}

export const getLastWill = (): LastWill => {
  const config = getConfig()
  const base64 = fs.readFileSync('last-will.json.enc', 'utf-8')
  const json = decrypt(base64, config.cryptPass, config.cryptSalt)
  const lastWill = JSON.parse(json)
  return lastWill
}
