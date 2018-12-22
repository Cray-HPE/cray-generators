const Generator = require('yeoman-generator')
const path      = require('path')
const Shell     = require('./shell')

/**
 * @classdesc The base Cray Yeoman generator
 * <br/><br/>
 * <strong>A few notes on class method definitions:</strong> The 
 * <a href="https://yeoman.io/authoring/running-context.html">Yeoman run context</a> restricts what methods you 
 * can define directly in a Generator class. The methods defined here with leading underscores are available to Generator 
 * classes inheriting from this one without the underscore, e.g. <code>CrayGenerator.notify</code> can be called directly rather 
 * than having to use <code>CrayGenerator._notify</code>. These aliases are set at class construction time because of the 
 * Yeoman-specific restrictions.
 * <br/><br/>
 * In addition to the instance properties listed below, refer to the 
 * <a href="https://yeoman.github.io/generator/Generator.html">Yeoman Generator docs</a> for additional properties.
 * 
 * @property {string} projectRoot the root file path of this project
 * @property {object} fse fs-extra module
 * @property {object} chalk chalk module
 * @property {object} yosay yosay module
 * @property {Shell} shell local shell object
 * @property {Function} notify proxy to _notify
 * @property {Function} exec proxy to shell.exec
 * @property {Function} handleError proxy to _handleError
 * 
 */
class CrayGenerator extends Generator {
  
  /**
   * Constructor
   * @param {array} args Yeoman generator args
   * @param {object} opts Yeoman generator opts
   */
  constructor (args, opts) {
    super(args, opts)
    this.fse      = require('fs-extra')
    this.chalk    = require('chalk')
    this.yosay    = require('yosay')
    this.shell    = new Shell({ logger: this.log })

    this.projectRoot  = path.resolve(__dirname, '..')
    this.option('destinationRoot', {
      type: String,
      default: this.projectRoot,
    })
    this.option('yosayWidth', {
      type: Number,
      default: 100
    })

    this.destinationRoot(this.options.destinationRoot)

    this.notify       = this._notify
    this.exec         = this.shell.exec
    this.handleError  = this._handleError.bind(this)
    this.log.debug    = this._debug.bind(this)
  }

  /**
   * A generic user notification method making use of the built-in Yeoman generator log and yosay
   * @param {string} msg a notification
   */
  _notify (msg) {
    this.log(this.yosay(msg, { maxLength: this.options.yosayWidth }))
  }

  /**
   * Wrapper for debugging to the built-in log if Yeoman is configured with debugging enabled
   * @param {string} msg a debug message
   */
  _debug (msg) {
    if (this.config.get('debug')) {
      this.log(this.chalk.yellow(`DEBUG: ${msg}`))
    }
  }

  /**
   * General handler for error cases during generator runs
   * @param {string|object} error an error object or string 
   */
  _handleError (error) {
    this.log.error(error.stderr || error.stdout || error)
    process.exit(error.code || 1)
  }

}

module.exports = CrayGenerator