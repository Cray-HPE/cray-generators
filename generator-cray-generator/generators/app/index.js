/*
 * MIT License
 *
 * (C) Copyright [2021] Hewlett Packard Enterprise Development LP
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

const CrayGenerator = require('lib/cray-generator')
const path          = require('path')
const defaultRoot   = path.resolve(__dirname, '..', '..', '..')

/**
 * Generator for generators.
 * <br/></br/>
 * See the source linked below and the <a href="https://yeoman.io/authoring/index.html">Yeoman generator authoring docs</a> for more info.
 * @type CrayGenerator
 * @name cray-generator:app
 */
module.exports = class extends CrayGenerator {

  initializing() {
    if (this.options.destinationRoot == '') {
      this.destinationRoot(defaultRoot)
    }
  }

  prompting () {
    this.notify(`This is the ${this.chalk.cyan('Cray generator, um...generator')}. ` +
                'You can use this generator to start creating your own generator. Phew.')

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

  configuring () {
    this.props.generatorBaseName  = this.props.generatorName.replace(/^(generator-)?(cray-)?/g, '')
    this.props.generatorCrayName  = `cray-${this.props.generatorBaseName}`
    this.props.generatorName      = `generator-${this.props.generatorCrayName}`
  }

  writing () {
    const pkg         = this.fs.readJSON(path.resolve(defaultRoot, 'generator-cray-generator', 'package.json'))
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

  end () {
    this.notify(`Your generator has been initialized at /${this.props.generatorName}. ` +
                'Please see the README in that directory for further help on building out a generator')
  }

}
