import * as core from '@actions/core'
import * as main from '../src/main'
import * as fs from 'fs'

const runMock = jest.spyOn(main, 'run')

// Other utilities
const timeRegex = /^\d{2}:\d{2}:\d{2}/

let getInputMock: jest.SpiedFunction<typeof core.getInput>
let setFailedMock: jest.SpiedFunction<typeof core.setFailed>
let setOutputMock: jest.SpiedFunction<typeof core.setOutput>

describe('action', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    getInputMock = jest.spyOn(core, 'getInput').mockImplementation()
    setFailedMock = jest.spyOn(core, 'setFailed').mockImplementation()
    setOutputMock = jest.spyOn(core, 'setOutput').mockImplementation()
  })

  it('success', async () => {
    fs.writeFileSync('last-login.json', JSON.stringify({}))
    await main.run()
    expect(runMock).toHaveReturned()

    expect(setOutputMock).toHaveBeenNthCalledWith(1, 'result', true)
  })
})
