const Helpers = require('lib/helpers')

describe('helpers', () => {

  const helpers = new Helpers()

  it('expect stringifyArgsArray to return expected string based on array input', () => {
    expect(helpers.stringifyArgsArray(['one', 'two', 'three and four'])).toEqual('one two "three and four"')
  })

  it('expect stringifyArgsArray to handle non-string array items gracefully and appropriately', () => {
    expect(helpers.stringifyArgsArray([1, undefined, null, 'one', 'two'])).toEqual('1 one two')
  })

})