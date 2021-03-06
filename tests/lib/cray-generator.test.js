/*
 * MIT License
 *
 * (C) Copyright [2021] Hewlett Packard Enterprise Development LP
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

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

  it('ensure _isSectionEnabled always returns true for the default null option setting', () => {
    const generator = new CrayGenerator(args, options)
    expect(generator._isSectionEnabled('whatever')).toEqual(true)
    expect(generator._isSectionEnabled('')).toEqual(true)
  })

  it('ensure _isSectionEnabled returns appropriately for a explictly set sections', () => {
    const altOptions = Object.assign(options, { sections: 'one, two' })
    const generator = new CrayGenerator(args, altOptions)
    expect(generator._isSectionEnabled('one')).toEqual(true)
    expect(generator._isSectionEnabled('two')).toEqual(true)
    expect(generator._isSectionEnabled('three')).toEqual(false)
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
    const oldEnv      = Object.assign({}, process.env)
    process.env.DEBUG = 'yeoman:generator'
    generator._debug('some debugging message')
    expect(logStub).toHaveBeenCalledWith(expect.stringMatching(/DEBUG: some debugging message/))
    logStub.mockRestore()
    process.env = oldEnv
  })

  it('expect _debug to bypass logging if debugging is disabled', () => {
    const generator   = new CrayGenerator(args, options)
    const logStub     = jest.spyOn(generator, 'log').mockImplementation(() => {})
    const oldEnv      = Object.assign({}, process.env)
    delete process.env.DEBUG
    generator._debug('some debugging message')
    expect(logStub).not.toHaveBeenCalled()
    logStub.mockRestore()
    process.env = oldEnv
  })

  it('expect _notify to work successfully', () => {
    const generator   = new CrayGenerator(args, options)
    const yosayStub = jest.spyOn(generator, 'yosay').mockImplementation(() => {})
    generator._notify('notification')
    expect(yosayStub).toHaveBeenCalledWith('notification', expect.anything())
  })

  it('expect _getVariables to work as expected', () => {
    const generators = new CrayGenerator(args, options)
    generators.props = {
      one: 1
    },
    generators.responses = {
      two: 2
    }
    expect(generators._getVariables()).toEqual({
      one: 1,
      two: 2,
    })
  })

  it('expect _writeTemplate to work as expected', () => {
    const generators = new CrayGenerator(args, options)
    const copyTplStub = jest.spyOn(generators.fs, 'copyTpl').mockImplementation(() => {})
    generators._writeTemplate('template')
    expect(copyTplStub).toHaveBeenCalledWith('/tmp/templates/template.tpl', '/tmp/template', {})
  })

  it('expect _writeTemplate to work as expected with an existing file and existsCallback provided and told not to proceed with copy', () => {
    const generators = new CrayGenerator(args, options)
    generators.fse.existsSync = () => {
      return true
    }
    const copyTplStub = jest.spyOn(generators.fs, 'copyTpl').mockImplementation(() => {})
    const existsCallback = () => { return false }
    generators._writeTemplate('template', 'dest-path', { existsCallback })
    expect(copyTplStub).not.toHaveBeenCalled()
  })

})
