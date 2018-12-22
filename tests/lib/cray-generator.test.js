const CrayGenerator   = require('lib/cray-generator')
const yeoman          = require('yeoman-environment')
const { TestAdapter } = require('yeoman-test/lib/adapter')

describe('cray-generator', () => {

  const env     = yeoman.createEnv([], { 'skip-install': true }, new TestAdapter())
  const args    = []
  const options = {
    resolved: '/tmp/cray-generator-test',
    namespace: 'cray-generator:tests',
    env: env,
    'skip-install': true
  }

  it('constructor operates as expected', () => {
    expect(new CrayGenerator(args, options)).toBeInstanceOf(CrayGenerator)
  })

  it('alternate destinationRoot works as expected', () => {
    const altRoot   = '/tmp' 
    const altOptions = Object.assign(options, { destinationRoot: altRoot })
    const generator = new CrayGenerator(args, altOptions)
    expect(generator.destinationRoot()).toEqual(altRoot)
  })

  it('expect _stringifyArgs to return expected string based on array input', () => {
    const generator = new CrayGenerator(args, options)
    expect(generator._stringifyArgs(['one', 'two', 'three and four'])).toEqual('one two "three and four"')
  })

  it('expect _exec to return a promise', () => {
    const generator = new CrayGenerator(args, options)
    expect(generator._exec('true')).toBeInstanceOf(Promise)
  })

  it('expect _exec to successfully complete', () => {
    expect.assertions(2)
    const generator = new CrayGenerator(args, options)
    return generator._exec('echo', ['one']).then((result) => {
      expect(result.code).toEqual(0)
      expect(result.stdout.trim()).toEqual('one')
    })
  })

  it('expect _exec to handle failure case appropriately', () => {
    expect.assertions(2)
    const generator = new CrayGenerator(args, options)
    const directory = '/asdfasdfasdf'
    return generator._exec('ls', [directory]).catch((error) => {
      expect(error.code).toEqual(1)
      expect(error.stderr).toMatch(/No such file or directory/)
    })
  })

  it('expect _handleError to log.error and exit', () => {
    const generator = new CrayGenerator(args, options)
    const logStub   = jest.spyOn(generator.log, 'error').mockImplementation(() => {})
    const exitStub  = jest.spyOn(process, 'exit').mockImplementation(() => {})
    generator._handleError('__error')
    expect(logStub).toHaveBeenCalledWith('__error')
    expect(exitStub).toHaveBeenCalledWith(1)
    logStub.mockRestore()
    exitStub.mockRestore()
  })

  it('expect _gitConfigure to run without issue', () => {
    expect.assertions(1)
    const generator = new CrayGenerator(args, options)
    return generator._gitConfigure().then((result) => {
      expect(result.code).toEqual(0)
    })
  })

  it('expect _debug to output correctly to log', () => {
    const generator   = new CrayGenerator(args, options)
    const logStub     = jest.spyOn(generator, 'log').mockImplementation(() => {})
    const configStub  = jest.spyOn(generator.config, 'get').mockImplementation((key) => {
      if (key === 'debug') return true
    })
    generator._debug('some debugging message')
    expect(configStub).toHaveBeenCalledWith('debug')
    expect(logStub).toHaveBeenCalledWith(expect.stringMatching(/DEBUG: some debugging message/))
    logStub.mockRestore()
    configStub.mockRestore()
  })

})
