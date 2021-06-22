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

const Request = require('lib/request')

describe('request', () => {

  let request = null

  beforeEach(() => {
    request = new Request()
  })

  it('ensure that the request method works to a live remote endpoint, callback forced to say request worked', () => {
    expect.assertions(1)
    const requestOptions  = {
      uri: 'https://httpbin.org',
      method: 'GET',
    }
    expect.assertions(1)
    return request.request(requestOptions, () => {
      return true
    }).then((result) => {
      expect(result.response.statusCode).toEqual(200)
    })
  })

  it('ensure that the request method fails to a non-existent endpoint, callback forced to say request failed', () => {
    expect.assertions(1)
    const requestOptions  = {
      uri: 'http://10.0.0.0.0.0.0.101',
      method: 'GET',
    }
    expect.assertions(1)
    return request.request(requestOptions, () => {
      return 'FAILURE'
    }).catch((error) => {
      expect(error).toMatch(/FAILURE/)
    })
  })

})
