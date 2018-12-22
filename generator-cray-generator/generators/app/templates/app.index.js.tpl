const CrayGenerator = require('lib/cray-generator')

/**
 * <%= generatorDescription %>
 * <br/></br/>
 * See the source linked below and the <a href="https://yeoman.io/authoring/index.html">Yeoman generator authoring docs</a> for more info. 
 * @type CrayGenerator
 * @name <%= generatorCrayName %>:app
 */
module.exports = class extends CrayGenerator {
  
  prompting () {
    this.notify(`Welcome to the\n\n${this.chalk.cyan(' <%= generatorCrayName %> ')}\n\n` +
                '<%= generatorDescription %>')

    const prompts = []

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

}