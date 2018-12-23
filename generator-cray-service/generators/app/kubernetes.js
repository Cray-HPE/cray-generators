const CrayGeneratorSection = require('lib/cray-generator-section')

/**
 * Handling of kubernetes/infrastructure prompts and resources specifically
 * @type CrayGeneratorSection
 * @name cray-service:app[kubernetes]
 */
module.exports = class extends CrayGeneratorSection {

  prompts () {
    if (!this.enabled) return []
    return [
      {
        type: 'confirm',
        name: 'daemonSet',
        message: 'Is your service a daemon, or in other words, does it need to run on every node of a Cray?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'persistentData',
        message: 'Does your service rely on persistent data?',
        default: false,
      }
    ]
  }

  default () {
    if (!this.enabled) return
    this.generator.log('kubernetes default')
  }

}