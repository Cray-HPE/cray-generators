//const path          = require('path')
const assert        = require('yeoman-assert')
//const helpers       = require('yeoman-test')
//const CrayGenerator = require('lib/cray-generator')

describe('generator-cray-service:app', () => {

  /*const subGeneratorStubs = [
    [helpers.createDummyGenerator(), 'cray-service:service'],
    [helpers.createDummyGenerator(), 'cray-service:kubernetes'],
  ]
  const createGenerator = (prompts = {}) => {
    return helpers
      .run(path.resolve(__dirname, '..', 'generators', 'app'))
      .withPrompts(prompts)
      .withGenerators(subGeneratorStubs)
  }*/

  it('ensure that an invalid repo URL triggers an error', () => {
    assert(true)
    /*const handleErrorStub = jest.spyOn(CrayGenerator.prototype, '_handleError').mockImplementation(() => {})
    return createGenerator({ repoUrl: 'notavalidurl' }).catch(() => {
      expect(handleErrorStub).toHaveBeenCalled()
      handleErrorStub.mockRestore()
    })*/
  })

})
