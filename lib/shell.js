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
   * @returns {Promise} Promise result is { code: [0-9]+, stdout: {string}, stderr: {string} }
   */
  exec (command, args = [], options = {}) {
    return new Promise((resolve, reject) => {
      if (options.stdio && options.stdio !== 'pipe') {
        this.logger.debug(
          `Warning: the Shell.exec spawn supports only stdio of "pipe", you have attempted to use ${options.stdio}, ` +
          'stdio will be forced to type "pipe"'
        )
      }
      options.stdio       = 'pipe'
      const ps            = spawn(command, args, options)
      const fullCommand   = `${command} ${this.helpers.stringifyArgsArray(args)}`.trim().replace(/(:\/\/)(.*:).*(@)/g, '$1$2********$3')
      this.logger.debug( 
        `Running: \`${fullCommand}\` with options ${JSON.stringify(options)}`
      )
      let stdout  = ''
      let stderr  = ''
      ps.stdout.on('data', (data) => {
        process.stdout.write(data)
        stdout += data 
      })
      ps.stderr.on('data', (data) => { 
        process.stdout.write(data)
        stderr += data 
      })
      ps.on('close', (code) => {
        const result = { code: code, stdout: stdout, stderr }
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