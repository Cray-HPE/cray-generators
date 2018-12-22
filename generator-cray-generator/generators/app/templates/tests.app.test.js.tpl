const path    = require('path')
const assert  = require('yeoman-assert')
const helpers = require('yeoman-test')

describe('<%= generatorName %>:app', () => {

  const createGenerator = (prompts = {}) => {
    return helpers
      .run(path.resolve(__dirname, '..', 'generators', 'app'))
      .withPrompts(prompts)
  }

  it('placeholder', () => {
    return createGenerator().then(() => {
      assert(true)
    })
  })

})
