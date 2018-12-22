const Generator = require('yeoman-generator')
const path      = require('path')

class CrayGenerator extends Generator {
  
  constructor (args, opts) {
    super(args, opts)
    this.fsExtra      = require('fs-extra')
    this.chalk        = require('chalk')
    this.yosay        = require('yosay')
    this.yosayWidth   = 80

    this.projectRoot  = path.resolve(__dirname, '..')
    this.option('destinationRoot', {
      type: String,
      default: this.projectRoot,
    })

    this.destinationRoot(this.options.destinationRoot)

    this.gitConfigure = this._gitConfigure
    this.exec         = this._exec
    this.handleError  = this._handleError.bind(this)
    this.log.debug    = this._debug.bind(this)
  }

  _debug (msg) {
    if (this.config.get('debug')) {
      this.log(this.chalk.yellow(`DEBUG: ${msg}`))
    }
  }

  _stringifyArgs (args) {
    let result = ''
    args.forEach((arg) => {
      if (arg.match(/\s/g)) {
        result += ` "${arg}"`
      } else {
        result += ` ${arg}`
      }
    })
    return result.trim()
  }

  _exec (command, args = [], options = {}) {
    return new Promise ((resolve, reject) => {
      options.stdio = 'pipe'
      const ps      = this.spawnCommand(command, args, options)
      this.log.debug(`Running: \`${command} ${this._stringifyArgs(args)}\` with options ${JSON.stringify(options)}`)
      let stdout  = ''
      let stderr  = ''
      ps.stdout.on('data', (data) => { stdout += data })
      ps.stderr.on('data', (data) => { stderr += data })
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

  _handleError (error) {
    this.log.error(error.stderr || error.stdout || error)
    process.exit(error.code || 1)
  }

  _gitConfigure (name = 'Cray Generators', email = 'casm-cloud@cray.com') {
    return this.exec('git', ['config', '--global', 'user.name', name]).then(() => {
      return this.exec('git', ['config', '--global', 'user.email', email])
    }).then(() => {
      return this.exec('git', [ 'config', '--global', 'credential.helper', 'cache --timeout 3600' ])
    })
  }

}

module.exports = CrayGenerator