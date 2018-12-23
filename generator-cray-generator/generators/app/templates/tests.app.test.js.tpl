const path    = require('path')
const assert  = require('yeoman-assert')
const helpers = require('yeoman-test')
const fs      = require('fs-extra)

describe('<%= generatorName %>:app', () => {

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

  it('placeholder', () => {
    return createGenerator().then(() => {
      assert(true)
    })
  })

})
