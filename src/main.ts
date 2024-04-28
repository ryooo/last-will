import * as core from '@actions/core'
import { TeamAccessLogsResponse, WebClient } from '@slack/web-api'

import { getConfig } from './config'
import { Condition, getLastWill } from './last-will'
import { teamAccessLogs } from './slack'

/**
 * last-will.json.encを復号し、teamAccessLogsと突合の上、必要に応じてメッセージを送信する
 */
export async function run(): Promise<void> {
  try {
    const config = getConfig()
    const lastWill = getLastWill()
    console.log(`${lastWill.messages.length} messages found.`)

    const teamAccessLogsResponse = await teamAccessLogs(config.slackUserToken)

    const client = new WebClient(config.slackBotToken)
    for (const lastWillMessage of lastWill.messages) {
      if (!shouldExecute(lastWillMessage.condition, teamAccessLogsResponse)) {
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
const shouldExecute = (
  condition: Condition,
  teamAccessLogsResponse: TeamAccessLogsResponse
): boolean => {
  let silentDays: number
  switch (condition.type) {
    case 'date':
      return dateFormat(new Date()) === condition.date

    case 'account':
      if (!teamAccessLogsResponse.ok) {
        console.error(
          `teamAccessLogs has error. ${teamAccessLogsResponse.error}`
        )
      }
      silentDays = getSilentDaysByUserName(
        teamAccessLogsResponse,
        condition.account.userName
      )
      return condition.account.days === silentDays

    case 'dateAndAccount':
      if (dateFormat(new Date()) !== condition.date) {
        return false
      }
      if (!teamAccessLogsResponse.ok) {
        console.error(
          `teamAccessLogs has error. ${teamAccessLogsResponse.error}`
        )
      }
      silentDays = getSilentDaysByUserName(
        teamAccessLogsResponse,
        condition.account.userName
      )
      return condition.account.days <= silentDays
  }
}

/**
 * 任意のユーザーアカウントの未ログイン日数を取得
 *
 * @param response
 * @param userName
 */
const getSilentDaysByUserName = (
  response: TeamAccessLogsResponse,
  userName: string
): number => {
  let days = Number.MAX_SAFE_INTEGER
  for (const login of response.logins ?? []) {
    if (userName === login.username && login.date_last) {
      days = Math.min(
        days,
        Math.floor(
          (new Date().getTime() - new Date(login.date_last * 1000).getTime()) /
            86400000
        )
      )
    }
  }
  return days
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
