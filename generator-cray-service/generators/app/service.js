const CrayGeneratorSection  = require('lib/cray-generator-section')
const find                  = require('find')
const fs                    = require('fs')
const path                  = require('path')

/**
 * Handling of service/API development prompts and resources specifically
 * @type CrayGeneratorSection
 * @name cray-service:app[service]
 */
module.exports = class extends CrayGeneratorSection {

  constructor (generator, name) {
    super(generator, name)
    this.swaggerTypes = {
      python3:  'python-flask',
      go:       'go-server',
      cpp:      'pistache-server',
    }
  }

  prompts () {
    return [
      {
        type: 'list',
        name: 'language',
        message: 'What is the primary language for your service?',
        choices: [
          {
            name: 'Python 3',
            value: 'python3'
          },
          {
            name: 'Go',
            value: 'go'
          },
          {
            name: 'C++',
            value: 'cpp'
          },
        ],
      },
    ]
  }

  configuring () {
    this.generator.props.swagger = {
      specFilePath: 'schema/swagger.yaml',
      runCodegen: true,
      writeSpecFile: false,
    }
    let specFileExists  = false
    let replaceSpecFile = false
    const foundSwaggerFiles = find.fileSync(/swagger\.(yaml|yml|json)/, this.generator.props.repoPath)
    if (foundSwaggerFiles instanceof Array && foundSwaggerFiles.length > 0) {
      specFileExists                            = true
      const repoPathPattern                     = new RegExp(this.generator.props.repoPath.replace(/\//, '\\/') + '\\/')
      this.generator.props.swagger.specFilePath = foundSwaggerFiles[0].replace(repoPathPattern, '')
    }
    let prompts   = []
    let prompter  = () => {
      return Promise.resolve()
    }
    if (specFileExists === true) {
      prompts.push({
        type: 'list',
        name: 'existingSwaggerFile',
        message: `We found a swagger file at ${this.generator.props.swagger.specFilePath}, would ` +
                  'you like to keep this file or replace it with one from this generator?',
        choices: [
          {
            name: 'Keep mine',
            value: 'mine',
          },
          {
            name: 'Replace it',
            value: 'replace',
          }
        ],
        default: 'mine',
      })
    }
    if (this.generator.fse.existsSync(`${this.generator.props.repoPath}/swagger_server`)) {
      prompts.push({
        type: 'confirm',
        name: 'runSwaggerCodegen',
        message: 'the swagger_server directory already exists in the root of your project, would you ' +
                  'like to re-run swagger codegen for your project?',
        default: false,
      })
    }
    if (prompts.length > 0) {
      prompter = this.generator.prompt.bind(this.generator)
    }
    return prompter(prompts).then((responses) => {
      if (responses && responses.existingSwaggerFile == 'replace') {
        fs.unlinkSync(`${this.generator.props.repoPath}/${this.generator.props.swagger.specFilePath}`)
        replaceSpecFile                           = true
        this.generator.props.swagger.specFilePath = this.generator.props.swagger.specFilePath.match(/\.json$/) ?
          'schema/swagger.json' : 'schema/swagger.yaml'
      }
      if (replaceSpecFile === true || specFileExists === false) {
        this.generator.props.swagger.writeSpecFile = true
      }
      if (responses && responses.runSwaggerCodegen === false) {
        this.generator.props.swagger.runCodegen = false
      }
    })
  }

  writing () {
    if (this.generator.props.swagger.writeSpecFile) {
      this.generator._writeTemplate(this.generator.props.swagger.specFilePath)
      this.generator._writeFiles(() => {})
    }
    this.generator._writeTemplate('Jenkinsfile')
    this.generator._writeTemplate('.version')
    this.generator._writeTemplate('runBuildPrep.sh')
    this.generator._writeTemplate('runCoverage.sh')
    this.generator._writeTemplate('runLint.sh')
    this.generator._writeTemplate('runPostBuild.sh')
    this.generator._writeTemplate('runUnitTest.sh')
    if (this.generator.props.swagger.runCodegen) {
      return this.generator.shell.exec('docker', ['exec', 'craypc-generators-swagger-codegen-cli',
        'java', '-jar', '/opt/swagger-codegen-cli/swagger-codegen-cli.jar',
        'generate', '-i', `${this.generator.props.repoPath}/${this.generator.props.swagger.specFilePath}`, '-l',
        this.swaggerTypes[this.generator.responses.language], '-o', `${this.generator.props.repoPath}/`
      ])
    } else {
      return Promise.resolve()
    }
  }

  conflicts () {
    if (fs.existsSync(path.resolve(__dirname, 'templates', `Dockerfile-${this.generator.responses.language}.tpl`))) {
      if (fs.existsSync(this.generator.destinationPath('Dockerfile'))) {
        fs.unlinkSync(this.generator.destinationPath('Dockerfile'))
      }
      this.generator._writeTemplate(`Dockerfile-${this.generator.responses.language}`, this.generator.destinationPath('Dockerfile'))
    }
    if (fs.existsSync(this.generator.destinationPath('.travis.yml'))) {
      fs.unlinkSync(this.generator.destinationPath('.travis.yml'))
    }
  }

}
