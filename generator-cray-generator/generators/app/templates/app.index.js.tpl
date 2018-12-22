const CrayGenerator = require('lib/cray-generator')

/**
 * @module <%= generatorDescription %>
 * <br/><br/>
 * See the source linked below and the <a href="https://yeoman.io/authoring/index.html">Yeoman generator authoring docs</a> for more info.
 */
module.exports = class extends CrayGenerator {
  
  prompting () {
    this.notify(`Welcome to the\n\n${this.chalk.cyan(' <%= generatorName %> ')}\n\n` +
                '<%= generatorDescription %>')

    const prompts = []

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

}