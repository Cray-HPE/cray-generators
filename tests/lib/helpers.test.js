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

const Helpers = require('lib/helpers')

describe('helpers', () => {

  const helpers = new Helpers()

  it('expect stringifyArgsArray to return expected string based on array input', () => {
    expect(helpers.stringifyArgsArray(['one', 'two', 'three and four'])).toEqual('one two "three and four"')
  })

  it('expect stringifyArgsArray to handle non-string array items gracefully and appropriately', () => {
    expect(helpers.stringifyArgsArray([1, undefined, null, 'one', 'two'])).toEqual('1 one two')
  })

  it('expect mask text to return masked text appropriately', () => {
    expect(helpers.maskText('one two three password user', 'password')).toEqual('one two three ****** user')
  })

  it('expect mask to handle regex special characters correctly', () => {
    const specialCharactersText = '^$*+?.()|{}[]'
    expect(helpers.maskText(`one two three ${specialCharactersText} user`, specialCharactersText)).toEqual('one two three ****** user')
  })

})
