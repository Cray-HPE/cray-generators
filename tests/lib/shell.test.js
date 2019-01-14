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

})