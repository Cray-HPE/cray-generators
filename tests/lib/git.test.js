const Git = require('lib/git')

describe('git', () => {

  const git = new Git()

  it('ensure configure() runs successfully', () => {
    expect.assertions(1)
    return git.configure().then((result) => {
      expect(result.code).toEqual(0)
    })
  })

})