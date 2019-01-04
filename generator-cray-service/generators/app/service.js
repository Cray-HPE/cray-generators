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
            name: 'Golang',
            value: 'golang'
          },
          {
            name: 'C++',
            value: 'c++'
          },
          {
            name: 'Python 2 (Obsolete)',
            value: 'python2'
          }, 
          {
            name: 'Node.js',
            value: 'nodejs'
          }
        ]
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
  }

}