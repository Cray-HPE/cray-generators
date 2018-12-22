const CrayGenerator = require('lib/cray-generator')

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
