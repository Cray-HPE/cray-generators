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

/**
 * @classdesc Base Generator section, for sub-dividing up generators into individual
 * sections that can be included or excluded from any generator run
 */
class CrayGeneratorSection {

  /**
   *
   * @param {CrayGenerator} generator the generator
   * @param {string} name the name of this generator section
   */
  constructor (generator, name) {
    this.name       = name
    this.generator  = generator
    this._init()
  }

  _initializing () { return new Promise((resolve) => { return resolve() }) }
  _prompts () { return [] }
  _configuring () { return new Promise((resolve) => { return resolve() }) }
  _default () { return new Promise((resolve) => { return resolve() }) }
  _writing () { return new Promise((resolve) => { return resolve() }) }
  _conflicts () { return new Promise((resolve) => { return resolve() }) }
  _install () { return new Promise((resolve) => { return resolve() }) }
  _end () { return new Promise((resolve) => { return resolve() }) }

  /**
   * Initialization which is called by the constructor and ensures that methods are set
   * appropriately according to whether or not this section should be enabled
   */
  _init () {
    if (!this.generator.isSectionEnabled(this.name)) {
      this.initializing = this._initializing
      this.prompts      = this._prompts
      this.configuring  = this._configuring
      this.default      = this._default
      this.writing      = this._writing
      this.conflicts    = this._conflicts
      this.install      = this._install
      this.end          = this._end
    }
  }

}

module.exports = CrayGeneratorSection
