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
