import * as process from 'process'

import * as core from '@actions/core'
import * as dotenv from 'dotenv'

export interface Config {
  slackBotToken: string
  slackUserToken: string
  slackChannelName: string
  cryptPass: string
  cryptSalt: string
}

export const getConfig = (): Config => {
  dotenv.config()
  const slackBotToken =
    process.env.SLACK_BOT_TOKEN ?? core.getInput('slack-bot-token')
  const slackUserToken =
    process.env.SLACK_USER_TOKEN ?? core.getInput('slack-user-token')
  const slackChannelName =
    process.env.SLACK_CHANNEL_NAME ?? core.getInput('slack-channel-name')
  const cryptPass = process.env.CRYPT_PASS ?? core.getInput('crypt-pass')
  const cryptSalt = process.env.CRYPT_SALT ?? core.getInput('crypt-salt')

  return {
    slackBotToken,
    slackUserToken,
    slackChannelName,
    cryptPass,
    cryptSalt
  }
}
