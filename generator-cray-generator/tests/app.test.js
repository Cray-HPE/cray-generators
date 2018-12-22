const path    = require('path')
const assert  = require('yeoman-assert')
const helpers = require('yeoman-test')
const fsExtra = require('fs-extra')

describe('generator-cray-generator:app', () => {

  const destinationRoot       = path.resolve(__dirname, '.output')
  const generatorName         = 'test'
  const generatorDescription  = 'A test generator'
  const contributorName       = 'Automated Tests'
  const contributorEmail      = 'tests@cray.com'
  
  const createGenerator = (name = null) => {
    return helpers
      .run(path.resolve(__dirname, '..', 'generators', 'app'))
      .withOptions({
        destinationRoot: destinationRoot,
      })
      .withPrompts({
        generatorName: name || generatorName,
        generatorDescription: generatorDescription,
        contributorName: contributorName,
        contributorEmail: contributorEmail
      })
  }

  afterAll(() => {
    fsExtra.removeSync(destinationRoot)
  })

  it('ensure that all files are created for a common run', () => {
    return createGenerator().then(() => {
      assert.file([
        path.resolve(destinationRoot, `generator-cray-${generatorName}`, 'package.json'),
        path.resolve(destinationRoot, `generator-cray-${generatorName}`, 'README.md'),
        path.resolve(destinationRoot, `generator-cray-${generatorName}`, 'generators', 'app', 'index.js'),
        path.resolve(destinationRoot, `generator-cray-${generatorName}`, 'tests', '.gitignore'),
        path.resolve(destinationRoot, `generator-cray-${generatorName}`, 'tests', 'app.test.js'),
      ])
    })
  })

  it('ensure that generator name "generator-cray-*" creates resources under the correct name', () => {
    const name = 'generator-cray-test'
    return createGenerator(name).then(() => {
      assert.file([
        path.resolve(destinationRoot, name, 'package.json'),
      ])
    })
  })

  it('ensure that generator name "cray-*" creates resources under the correct name', () => {
    const name = 'cray-test'
    return createGenerator(name).then(() => {
      assert.file([
        path.resolve(destinationRoot, `generator-${name}`, 'package.json'),
      ])
    })
  })

  it('ensure that generator name "generator-whatever" creates resources under the correct name', () => {
    const name = 'generator-whatever'
    return createGenerator(name).then(() => {
      assert.file([
        path.resolve(destinationRoot, 'generator-cray-whatever', 'package.json'),
      ])
    })
  })

})
