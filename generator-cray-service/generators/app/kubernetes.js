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
        when: (response) => {
          return !response.isDaemon
        },
        type: 'confirm',
        name: 'isStateful',
        message: 'Does your service require any of the following: (1) stable, unique network identifiers (2) stable, persistent storage ' +
                 '(3) ordered, graceful deployment and scaling (4) order, automated rolling updates (if you\'re unsure, just answer No)?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'requiresEtcdCluster',
        message: 'Does your service need its own etcd cluster?',
        default: false,
      },
      {
        type: 'confirm',
        name: 'requiresSqlCluster',
        message: 'Does your service need its own highly-available SQL cluster?',
        default: false,
      },
    ]
  }

  writing () {
    this.generator.responses.kubernetesType = 'Deployment'
    if (this.generator.responses.isDaemon) {
      this.generator.responses.kubernetesType = 'DaemonSet'
    } else if (this.generator.responses.isStateful) {
      this.generator.responses.kubernetesType = 'StatefulSet'
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
