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

const CrayGeneratorSection  = require('lib/cray-generator-section')
const CrayGenerator         = require('lib/cray-generator')
const yeoman                = require('yeoman-environment')
const { TestAdapter }       = require('yeoman-test/lib/adapter')

describe('cray-generator-section', () => {

  const env     = yeoman.createEnv([], { 'skip-install': true }, new TestAdapter())
  const args    = []
  const options = {
    resolved: '/tmp/cray-generator-test',
    namespace: 'cray-generator:tests',
    env: env,
    'skip-install': true
  }

  it('ensure constructor operates as expected', () => {
    const section = new CrayGeneratorSection(new CrayGenerator(args, options), 'name-of-section')
    expect(section).toBeInstanceOf(CrayGeneratorSection)
    expect(section.name).toEqual('name-of-section')
    expect(section.generator).toBeInstanceOf(CrayGenerator)
  })

  it('ensure that a section has appropriate returns for all methods in case of the section being disabled', () => {
    const mockGenerator = {
      isSectionEnabled: () => {
        // force any section name disabled
        return false
      }
    }
    const section = new CrayGeneratorSection(mockGenerator, 'name-of-section')
    expect(section.initializing()).toBeInstanceOf(Promise)
    expect(section.prompts()).toEqual([])
    expect(section.configuring()).toBeInstanceOf(Promise)
    expect(section.default()).toBeInstanceOf(Promise)
    expect(section.writing()).toBeInstanceOf(Promise)
    expect(section.conflicts()).toBeInstanceOf(Promise)
    expect(section.install()).toBeInstanceOf(Promise)
    expect(section.end()).toBeInstanceOf(Promise)
  })

})
