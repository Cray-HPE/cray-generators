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

const { spawn } = require('child_process')
const Helpers   = require('./helpers')

/**
 * @classdesc For interacting with the local shell, running commands, etc.
 */
class Shell {

  /**
   * Constructor
   * @param {object} [options={}] general options, mostly just child_process.spawn options
   */
  constructor (options = {}) {
    this.helpers  = new Helpers()
    this.logger   = options.logger || console
  }

  /**
   * General local shell command execution
   * @param {string} command the base executable/command, e.g. <code>echo</code>
   * @param {array} [args=[]] list of command line arguments
   * @param {object} [options={}] child_process.spawn options
   * @param {boolean} [options.silent=false] whether or not to silence output of the command
   * @param {Array} [options.mask=[]] an array of sensitive text to mask in any output
   * @returns {Promise} Promise result is { code: [0-9]+, stdout: {string}, stderr: {string} }
   */
  exec (command, args = [], options = {}) {
    const mask    = (options.mask instanceof Array) ? options.mask : []
    const silent  = options.silent === true ? true : false
    if (options.mask !== undefined) delete options.mask
    if (options.silent !== undefined) delete options.silent
    return new Promise((resolve, reject) => {
      if (options.stdio && options.stdio !== 'pipe') {
        this.logger.debug(
          `Warning: the Shell.exec spawn supports only stdio of "pipe", you have attempted to use ${options.stdio}, ` +
          'stdio will be forced to type "pipe"'
        )
      }
      options.stdio     = 'pipe'
      const ps          = spawn(command, args, options)
      let fullCommand   = `${command} ${this.helpers.stringifyArgsArray(args)}`.trim()
      mask.forEach((item) => {
        fullCommand = this.helpers.maskText(fullCommand, item)
      })
      this.logger.debug(
        `Running: \`${fullCommand}\` with options ${JSON.stringify(options)}`
      )
      let stdout  = ''
      let stderr  = ''
      ps.stdout.on('data', (data) => {
        mask.forEach((item) => {
          data = this.helpers.maskText(data.toString('utf8'), item)
        })
        if (silent !== true) process.stdout.write(data)
        stdout += data
      })
      ps.stderr.on('data', (data) => {
        mask.forEach((item) => {
          data = this.helpers.maskText(data.toString('utf8'), item)
        })
        if (silent !== true) process.stderr.write(data)
        stderr += data
      })
      ps.on('close', (code) => {
        const result = { code, stdout, stderr }
        if (code !== 0) {
          return reject(result)
        } else {
          return resolve(result)
        }
      })
    })
  }

}

module.exports = Shell
