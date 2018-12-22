const CrayGenerator = require('lib/cray-generator')
const path          = require('path')

module.exports = class extends CrayGenerator {
  
  prompting() {
    this.log(
      this.yosay(`Welcome to the\n\n${this.chalk.cyan(' Cray generator, um...generator ')} \n\nYou ` +
                 'can use this generator to start creating your own generator.', { maxLength: this.yosayWidth })
    )

    const prompts = [
      {
        type: 'input',
        name: 'generatorName',
        message: 'What is the name of this new generator?',
      },
      {
        type: 'input',
        name: 'generatorDescription',
        message: 'And how about a description for this generator?'
      },
      {
        type: 'input',
        name: 'contributorName',
        message: 'Your full name?'
      },
      {
        type: 'input',
        name: 'contributorEmail',
        message: 'Your Cray email?'
      },
    ]

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  configuring() {
    this.props.generatorName = `generator-cray-${this.props.generatorName.replace(/^(generator-)?(cray-)?/, '')}`
  }

  writing() {
    const pkg         = this.fs.readJSON(path.resolve(this.projectRoot, 'generator-cray-generator', 'package.json'))
    pkg.name          = this.props.generatorName
    pkg.description   = this.props.generatorDescription
    pkg.version       = '0.0.1'
    pkg.homepage      = pkg.homepage.replace(/\/([^/]*)$/, `/${this.props.generatorName}`)
    pkg.contributors  = [
      { name: this.props.contributorName, email: this.props.contributorEmail }
    ]

    this.fs.writeJSON(this.destinationPath(`${this.props.generatorName}/package.json`), pkg)

    this.fs.copyTpl(
      this.templatePath('app.index.js.tpl'), 
      this.destinationPath(`${this.props.generatorName}/generators/app/index.js`),
      this.props
    )
    this.fs.copyTpl(
      this.templatePath('README.md.tpl'), 
      this.destinationPath(`${this.props.generatorName}/README.md`),
      this.props
    )

    this.fs.copy(
      path.resolve(__dirname, '..', '..', 'tests', '.gitignore'),
      this.destinationPath(`${this.props.generatorName}/tests/.gitignore`)
    )
    this.fs.copyTpl(
      this.templatePath('tests.app.test.js.tpl'),
      this.destinationPath(`${this.props.generatorName}/tests/app.test.js`),
      this.props
    )
    
  }

  end() {
    this.log(
      this.yosay(`Your generator has been initialized at /${this.props.generatorName}. ` +
                 'Please see the README in that directory for further help on building out a generator',
                 { maxLength: this.yosayWidth })
    )
  }

}
