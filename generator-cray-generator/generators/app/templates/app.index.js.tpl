const CrayGenerator = require('lib/cray-generator')

module.exports = class extends CrayGenerator {
  
  prompting() {
    this.log(
      this.yosay(`Welcome to the\n\n${this.chalk.cyan(' <%= generatorName %> ')} \n\nYou ` +
                 '<%= generatorDescription %>', { maxLength: this.yosayWidth })
    )

    const prompts = []

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

}
