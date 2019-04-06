const Generator = require('yeoman-generator')
const Shell     = require('./shell')
const tmp       = require('tmp')

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
 * @property {object} fse fs-extra module
 * @property {object} chalk chalk module
 * @property {object} yosay yosay module
 * @property {Shell} shell local shell object
 * @property {Function} notify proxy to _notify
 * @property {Function} exec proxy to shell.exec
 * @property {Function} handleError proxy to _handleError
 * @property {Function} isSectionEnabled proxy to _isSectionEnabled
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
    this.fse        = require('fs-extra')
    this.chalk      = require('chalk')
    this.yosay      = require('yosay')
    this.shell      = new Shell({ logger: this.log })
    this.props      = {}
    this.responses  = {}

    this.option('destinationRoot', {
      type: String,
      default: '',
      description: 'An override for the root directory where files will be written',
    })
    this.option('yosayWidth', {
      type: Number,
      default: 100,
      description: 'The console width of the yosay box',
    })
    this.option('sections', {
      type: String,
      default: '',
      description: 'If a generator supports it, use this option to limit what "sections" ' +
                   'of a generator run/execute, comma-separated list',
    })
    this.option('debug')

    if (this.options.destinationRoot != '') {
      this.destinationRoot(this.options.destinationRoot)
    } else {
      const tmpDir = tmp.dirSync()
      this.destinationRoot(tmpDir.name)
    }

    this.notify           = this._notify
    this.handleError      = this._handleError.bind(this)
    this.log.debug        = this._debug.bind(this)
    this.isSectionEnabled = this._isSectionEnabled
  }

  /**
   * Determines whether the set "sections" option instructs a particular section to run/execute
   * @param {string} section the name of the section to check whether or not it should be executed
   * @returns {boolean}
   */
  _isSectionEnabled (section) {
    return (this.options.sections.trim() === '' ||
            this.options.sections.replace(/\s/g, '').split(',').indexOf(section) >= 0)
  }

  /**
   * A generic user notification method making use of the built-in Yeoman generator log and yosay
   * @param {string} msg a notification
   */
  _notify (msg) {
    this.log(this.yosay(msg, { maxLength: this.options.yosayWidth }))
  }

  /**
   * Wrapper for debugging to the built-in log if the standard env var DEBUG=yeoman:generator, debugging will be enabled
   * @param {string} msg a debug message
   */
  _debug (msg) {
    if (process.env.DEBUG === 'yeoman:generator' || this.options.debug) {
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

  /**
   * Variables can be stored in multiple internal objects. This method merges these objects
   * together in an expected order for precedence to create a single object for variable values
   * @returns {Object} key, value object for variables
   */
  _getVariables () {
    return Object.assign(this.props, this.responses)
  }

  /**
   * Generally useful writer of templates that that includes asking what to do if destination file already exists
   * @param {string} baseFilePath the base file name/path, should be the destination path from root
   * @param {string} [destinationPath=null] a specific destination path, if null uses the default generator destination path
   * @param {Object} [options={}] template writing options
   * @param {boolean} [options.templatePath=null] alternative path to the template to use
   * @param {boolean} [options.variables=null] alternative set of variables to use when rendering the template
   * @param {Object} [options.existsCallback=null] in the case of the file already existing in the repo, a callback for more complex processing
   */
  _writeTemplate (baseFilePath, destinationPath = null, options = {}) {
    if (destinationPath === null) {
      destinationPath = this.destinationPath(baseFilePath)
    }
    let proceed = true
    if (this.fse.existsSync(destinationPath) && options.existsCallback) {
      proceed = options.existsCallback(destinationPath, (options.variables || this._getVariables()))
    }
    if (proceed) {
      this.fs.copyTpl(
        this.templatePath(`${(options.templatePath || baseFilePath)}.tpl`),
        destinationPath,
        (options.variables || this._getVariables())
      )
    }
  }

}

module.exports = CrayGenerator
