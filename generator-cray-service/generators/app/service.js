const CrayGeneratorSection = require('lib/cray-generator-section')

/**
 * Handling of service/API development prompts and resources specifically
 * @type CrayGeneratorSection
 * @name cray-service:app[service]
 */
module.exports = class extends CrayGeneratorSection {

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
        ],
      },
      {
        type: 'confirm',
        name: 'isApi',
        message: 'Will your service expose a RESTful API?',
        default: true,
      },
    ]
  }

  writing () {
    this.generator._writeTemplate('Jenkinsfile')
    this.generator._writeTemplate('.version')
    this.generator._writeTemplate('runBuildPrep.sh')
    this.generator._writeTemplate('runCoverage.sh')
    this.generator._writeTemplate('runLint.sh')
    this.generator._writeTemplate('runPostBuild.sh')
    this.generator._writeTemplate('runUnitTest.sh')
    let promise = Promise.resolve
    if (this.props.isApi) {
      this.generator._writeTemplate('schema/swagger.yaml')
      if (this.generator.fse.existsSync(`${this.generator.props.repoPath}/swagger_server`)) {
        promise = this.generator.prompt([{
          type: 'confirm',
          name: 'runSwaggerCodegen',
          message: 'the swagger_server directory already exists in your project, would you like to re-run swagger codegen for your project?'
        }])
      }
    }
    return promise().then((response) => {
      if (response && response.runSwaggerCodegen) {
        // run it
      }
      this.generator._writeTemplate(`Dockerfile-${this.props.language}`, this.generator.destinationPath('Dockerfile'))
    })
  }

}