const CrayGeneratorSection = require('lib/cray-generator-section')

/**
 * Handling of kubernetes/infrastructure prompts and resources specifically
 * @type CrayGeneratorSection
 * @name cray-service:app[kubernetes]
 */
module.exports = class extends CrayGeneratorSection {

  prompts () {
    return [
      {
        type: 'confirm',
        name: 'isDaemon',
        message: 'Is your service a daemon, or in other words, does it need to run on every node of a Cray?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'hasPersistentData',
        message: 'Does your service rely on persistent data?',
        default: false,
      }
    ]
  }

  writing () {
    this.generator.props.kubernetesType = 'Deployment'
    if (this.generator.props.isDaemon) {
      this.generator.props.kubernetesType = 'DaemonSet'
    } else if (this.generator.props.hasPersistentData) {
      this.generator.props.kubernetesType = 'StatefulSet'
    }
    this.generator._writeTemplate('kubernetes/Chart.yaml')
    this.generator._writeTemplate('kubernetes/values.yaml')
    this.generator._writeTemplate('kubernetes/requirements.yaml')
    this.generator._writeTemplate('kubernetes/README.md')
    this.generator._writeTemplate('kubernetes/.gitignore')
    this.generator._writeTemplate('kubernetes/templates/_helpers.tpl')
    this.generator._writeTemplate('kubernetes/templates/NOTES.txt')
  }

}