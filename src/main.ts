import * as core from '@actions/core'
import { WebClient } from '@slack/web-api'

import { getConfig } from './config'
import { getAndUpdateLastLogin, LastLogin } from './last-login'
import { Condition, getLastWill } from './last-will'

/**
 * last-will.json.encを復号し、teamAccessLogsと突合の上、必要に応じてメッセージを送信する
 */
export async function run(): Promise<void> {
  try {
    const config = getConfig()
    const lastWill = getLastWill()
    console.log(`${lastWill.messages.length} messages found.`)

    const lastLogin = await getAndUpdateLastLogin(config.slackUserToken)
    console.log(lastLogin)

    const client = new WebClient(config.slackBotToken)
    for (const lastWillMessage of lastWill.messages) {
      if (!shouldExecute(lastWillMessage.condition, lastLogin)) {
        continue
      }

      const postMessageResponse = await client.chat.postMessage({
        channel: config.slackChannelName,
        text: lastWillMessage.message
      })
      if (!postMessageResponse.ok) {
        console.error(`postMessage has error. ${postMessageResponse.error}`)
      }
    }

    core.setOutput('result', true)
  } catch (error) {
    console.error(error)
    if (error instanceof Error) core.setFailed(error.message)
  }
}

/**
 * LastWillのConditionが反応するかどうかチェックする
 *
 * @param condition
 * @param teamAccessLogsResponse
 */
const shouldExecute = (condition: Condition, lastLogin: LastLogin): boolean => {
  let silentDays: number
  switch (condition.type) {
    case 'date':
      return dateFormat(new Date()) === condition.date

    case 'account':
      silentDays = dateDiff(
        new Date(),
        new Date(lastLogin[condition.account.userName] * 1000)
      )
      return condition.account.silentDays === silentDays

    case 'dateAndAccount':
      if (dateFormat(new Date()) !== condition.date) {
        return false
      }
      silentDays = dateDiff(
        new Date(),
        new Date(lastLogin[condition.account.userName] * 1000)
      )
      return condition.account.minSilentDays <= silentDays
  }
}

/**
 * 日数の差を計算
 *
 * @param date1
 * @param date2
 */
const dateDiff = (date1: Date, date2: Date): number => {
  if (date1.getTime() < date2.getTime()) {
    return Math.floor((date2.getTime() - date1.getTime()) / 86400000)
  }
  return Math.floor((date1.getTime() - date2.getTime()) / 86400000)
}

/**
 * 任意のDateをyyyy-mm-ddにフォーマット
 */
const dateFormat = (date: Date): string => {
  return date
    .toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
    .split('/')
    .join('-')
}
