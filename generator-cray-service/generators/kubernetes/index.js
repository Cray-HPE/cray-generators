const CrayGenerator = require('lib/cray-generator')

/**
 * Kubernetes-specific resource generator for the cray-service generator
 * <br/><br/>
 * See the source linked below and the <a href="https://yeoman.io/authoring/index.html">Yeoman generator authoring docs</a> for more info.
 * @type CrayGenerator
 * @name cray-service:kubernetes
 */
module.exports = class extends CrayGenerator {

  initializing() {
    this.options.appProps = this.options.appProps || {}
  }

  prompting() {
    this.log(this.yosay(this.chalk.cyan('Cray Service Kubernetes Resources Generator'), { maxLength: this.yosayWidth }))
    const prompts = [
      {
        type: 'confirm',
        name: 'persistentData',
        message: 'Does your service rely on persistent data?',
        default: false
      }
    ]

    return this.prompt(prompts).then(props => {
      this.props = Object.assign(this.options.appProps, props)
      this.log(this.props)
    })
  }
 
  writing() {

  }

}
