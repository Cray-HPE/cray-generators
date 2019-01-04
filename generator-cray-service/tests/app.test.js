const path          = require('path')
//const assert        = require('yeoman-assert')
const helpers       = require('yeoman-test')
const CrayGenerator = require('lib/cray-generator')
const Shell         = require('lib/shell')
const fs            = require('fs-extra')

describe('generator-cray-service:app', () => {

  const destinationRoot = path.resolve(__dirname, '.output')
  let shellExecStub     = null

  beforeEach(() => {
    shellExecStub = jest.spyOn(Shell.prototype, 'exec').mockImplementation(() => {
      return Promise.resolve({
        code: 0,
        stdout: '',
        stderr: '',
      })
    })
  })
  afterEach(() => {
    shellExecStub.mockRestore()
    fs.removeSync(destinationRoot)
  })

  const createGenerator = (prompts = {}) => {
    return helpers
      .run(path.resolve(__dirname, '..', 'generators', 'app'))
      .withOptions({
        destinationRoot: destinationRoot,
      })
      .withPrompts(prompts)
  }

  const getDefaultPrompts = () => {
    return {
      repoUrl: 'none',
      repoUsername: 'none',
      repoPassword: 'none',
      language: 'python3',
      isApi: 'y',
      isDaemon: 'n',
      hasPersitentData: 'n',
      cliEnabled: 'n',
    }
  }

  it('ensure that an invalid repo URL triggers an error', () => {
    const prompts = getDefaultPrompts()
    const handleErrorStub = jest.spyOn(CrayGenerator.prototype, '_handleError').mockImplementation(() => {})
    return createGenerator(prompts).catch(() => {
      expect(handleErrorStub).toHaveBeenCalled()
      handleErrorStub.mockRestore()
    })
  })

})
