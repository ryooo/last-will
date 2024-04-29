import * as fs from 'fs'

import { teamAccessLogs } from './slack'

/**
 * { slackUserName: lastLoginDate }
 */
export type LastLogin = { [key: string]: number }

export const getArtifactLastLogin = (): LastLogin => {
  try {
    return {}
    return JSON.parse(fs.readFileSync('last-login.json', 'utf-8'))
  } catch (e) {
    console.error(e)
  }
  return {}
}

export const getAndUpdateLastLogin = async (
  slackUserToken: string
): Promise<LastLogin> => {
  const lastLogin = getArtifactLastLogin()

  const teamAccessLogsResponse = await teamAccessLogs(slackUserToken)
  if (!teamAccessLogsResponse.ok) {
    console.error(`teamAccessLogs has error. ${teamAccessLogsResponse.error}`)
  } else {
    for (const login of teamAccessLogsResponse.logins ?? []) {
      if (login.user_id && login.date_last) {
        lastLogin[login.user_id] = Math.max(
          lastLogin[login.user_id] ?? 0,
          login.date_last
        )
      }
    }
  }

  fs.writeFileSync('last-login.json', JSON.stringify(lastLogin))
  return lastLogin
}
