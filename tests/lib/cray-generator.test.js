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

  it('ensure constructor operates as expected', () => {
    expect(new CrayGenerator(args, options)).toBeInstanceOf(CrayGenerator)
  })

  it('ensure custom destinationRoot works as expected', () => {
    const altRoot   = '/tmp' 
    const altOptions = Object.assign(options, { destinationRoot: altRoot })
    const generator = new CrayGenerator(args, altOptions)
    expect(generator.destinationRoot()).toEqual(altRoot)
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

  it('expect _debug to bypass logging if configuration has debugging disabled', () => {
    const generator   = new CrayGenerator(args, options)
    const logStub     = jest.spyOn(generator, 'log').mockImplementation(() => {})
    const configStub  = jest.spyOn(generator.config, 'get').mockImplementation((key) => {
      if (key === 'debug') return false
    })
    generator._debug('some debugging message')
    expect(configStub).toHaveBeenCalledWith('debug')
    expect(logStub).not.toHaveBeenCalled()
    logStub.mockRestore()
    configStub.mockRestore()
  })

  it('expect _notify to work successfully', () => {
    const generator   = new CrayGenerator(args, options)
    const yosayStub = jest.spyOn(generator, 'yosay').mockImplementation(() => {})
    generator._notify('notification')
    expect(yosayStub).toHaveBeenCalledWith('notification', expect.anything())
  })

})
