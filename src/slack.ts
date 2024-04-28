import { TeamAccessLogsResponse, WebClient } from '@slack/web-api'

export const teamAccessLogs = async (
  userToken: string
): Promise<TeamAccessLogsResponse> => {
  const client = new WebClient(userToken)
  const response = await client.team.accessLogs({})
  return response
}
