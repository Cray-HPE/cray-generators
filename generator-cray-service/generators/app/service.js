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

  default () {
    this.generator.fs.copyTpl(
      this.generator.templatePath('Jenkinsfile.tpl'),
      this.generator.destinationPath('Jenkinsfile'),
      this.generator.props
    )
  }

}