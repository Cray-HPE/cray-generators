const CrayGeneratorSection  = require('lib/cray-generator-section')
const CrayGenerator         = require('lib/cray-generator')
const yeoman                = require('yeoman-environment')
const { TestAdapter }       = require('yeoman-test/lib/adapter')

describe('cray-generator-section', () => {

  const env     = yeoman.createEnv([], { 'skip-install': true }, new TestAdapter())
  const args    = []
  const options = {
    resolved: '/tmp/cray-generator-test',
    namespace: 'cray-generator:tests',
    env: env,
    'skip-install': true
  }

  it('ensure constructor operates as expected', () => {
    const section = new CrayGeneratorSection(new CrayGenerator(args, options), 'name-of-section')
    expect(section).toBeInstanceOf(CrayGeneratorSection)
    expect(section.name).toEqual('name-of-section')
    expect(section.generator).toBeInstanceOf(CrayGenerator)
  })

  it('ensure that a section has appropriate returns for all methods in case of the section being disabled', () => {
    const mockGenerator = {
      isSectionEnabled: () => {
        // force any section name disabled
        return false
      }
    }
    const section = new CrayGeneratorSection(mockGenerator, 'name-of-section')
    expect(section.initializing()).toBeInstanceOf(Promise)
    expect(section.prompts()).toEqual([])
    expect(section.configuring()).toBeInstanceOf(Promise)
    expect(section.default()).toBeInstanceOf(Promise)
    expect(section.writing()).toBeInstanceOf(Promise)
    expect(section.conflicts()).toBeInstanceOf(Promise)
    expect(section.install()).toBeInstanceOf(Promise)
    expect(section.end()).toBeInstanceOf(Promise)
  })

})