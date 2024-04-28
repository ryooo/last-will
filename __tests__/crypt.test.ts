import * as core from '@actions/core'
import * as crypt from '../src/crypt'
import * as assert from 'assert'

describe('crypt', () => {
  it('success', async () => {
    const h = {
      messages: [
        {
          account: {
            userName: 'ryo',
            days: 0
          },
          message: 'hogehoge'
        },
        {
          date: '2025-12-01',
          message: 'fugafuga'
        },
        {
          account: {
            userName: 'ryo',
            days: 365
          },
          date: '2025-12-01',
          message: 'fugafuga'
        }
      ]
    }
    const json = JSON.stringify(h)
    const base64 = crypt.encrypt(json, 'pass', 'salt')
    const json2 = crypt.decrypt(base64, 'pass', 'salt')
    const h2 = JSON.parse(json2)
    expect(h2).toStrictEqual(h)
    expect(json2).toStrictEqual(json)
  })
})
