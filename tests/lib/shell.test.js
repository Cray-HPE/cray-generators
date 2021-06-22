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

const Shell = require('lib/shell')

describe('shell', () => {

  const shell = new Shell()

  it('expect exec to return a promise', () => {
    expect(shell.exec('true')).toBeInstanceOf(Promise)
  })

  it('expect exec to successfully complete', () => {
    expect.assertions(2)
    return shell.exec('echo', ['one']).then((result) => {
      expect(result.code).toEqual(0)
      expect(result.stdout.trim()).toEqual('one')
    })
  })

  it('expect exec to handle failure case appropriately', () => {
    expect.assertions(2)
    const directory = '/asdfasdfasdf'
    return shell.exec('ls', [directory]).catch((error) => {
      expect(error.code).toEqual(1)
      expect(error.stderr).toMatch(/No such file or directory/)
    })
  })

  it('expect exec to warn if we try to pass in a stdio type other than "pipe"', () => {
    expect.assertions(1)
    const loggerStub = jest.spyOn(shell.logger, 'debug').mockImplementation(() => {})
    return shell.exec('true', [], { stdio: 'inherit' }).then(() => {
      expect(loggerStub).toHaveBeenCalledWith(expect.stringMatching(/Warning:/))
      loggerStub.mockRestore()
    })
  })

  it('expect masking works as expected', () => {
    expect.assertions(1)
    return shell.exec('echo', ['BLAH'], { stdio: 'inherit', mask: ['BLAH'] }).then((result) => {
      expect(result.stdout.trim()).toEqual('******')
    })
  })

  it('expect masking works in stderr as well', () => {
    expect.assertions(1)
    return shell.exec('find', ['NOTHING_THAT_EXISTS'], { stdio: 'inherit', mask: ['NOTHING_THAT_EXISTS'] }).catch((result) => {
      expect(result.stderr.trim()).toEqual('find: ******: No such file or directory')
    })
  })

})
