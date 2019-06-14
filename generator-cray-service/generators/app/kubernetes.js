const CrayGeneratorSection = require('lib/cray-generator-section')
const yaml = require('yaml')

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
        name: 'hasUi',
        message: 'Does your service have a UI?',
        default: false,
      },
      {
        when: (response) => {
          return !response.hasUi
        },
        type: 'confirm',
        name: 'requiresExternalAccess',
        message: 'Does your service need to be accesible from outside of a Cray Kubernetes cluster?',
        default: false,
      },
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
        message: 'Do you need a StatefulSet? If you aren\'t sure, then you don\'t.',
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
    this.generator.responses.requiresExternalAccess = this.generator.responses.requiresExternalAccess || false
    this.generator.responses.kubernetesType = 'Deployment'
    if (this.generator.responses.isDaemon) {
      this.generator.responses.kubernetesType = 'DaemonSet'
    } else if (this.generator.responses.isStateful) {
      this.generator.responses.kubernetesType = 'StatefulSet'
    }
    this.generator.props.kubernetesTypeLower = this.generator.responses.kubernetesType.toLowerCase()
    this.generator._writeTemplate(
      'kubernetes/githooks/pre-commit',
      this.generator.destinationPath('.githooks/pre-commit')
    )
    this.generator._writeTemplate(
      'kubernetes/README-root.md',
      this.generator.destinationPath('kubernetes/README.md')
    )
    this.generator._writeTemplate(
      'kubernetes/Chart.yaml',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/Chart.yaml`),
      {
        existsCallback: (existingFile) => {
          let existingMetaString = this.generator.fse.readFileSync(existingFile, 'utf8')
          const existingMeta = yaml.parse(existingMetaString)
          const existingVersion = existingMeta.version
          existingMetaString = existingMetaString.replace(/^version:.*/g, `version: ${existingVersion}`)
          this.generator.fse.writeFileSync(existingFile, `${existingMetaString}`)
        }
      }
    )
    this.generator._writeTemplate(
      'kubernetes/values.yaml',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/values.yaml`),
      {
        existsCallback: (existingFile, variables) => {
          const valuesTemplateFile = this.generator.fse.readFileSync(this.generator.templatePath('kubernetes/values.yaml.tpl'), 'utf8')
          const headerComments = valuesTemplateFile.toString().split('\n\n')[0]
          const existingValues = yaml.parse(this.generator.fse.readFileSync(existingFile, 'utf8'))
          existingValues['cray-service'].type = variables.kubernetesType
          if (variables.requiresExternalAccess || variables.hasUi) {
            if (!existingValues['cray-service'].ingress) {
              existingValues['cray-service'].ingress = {}
            }
            existingValues['cray-service'].ingress.enabled = true
            if (variables.hasUi) {
              existingValues['cray-service'].ingress.ui = true
            }
          } else {
            if (existingValues['cray-service'].ingress) {
              delete existingValues['cray-service'].ingress
            }
          }
          if (variables.requiresEtcdCluster) {
            if (!existingValues['cray-service'].etcdCluster) {
              existingValues['cray-service'].etcdCluster = {}
            }
            existingValues['cray-service'].etcdCluster.enabled = true
          } else {
            if (existingValues['cray-service'].etcdCluster) {
              delete existingValues['cray-service'].etcdCluster
            }
          }
          if (variables.requiresSqlCluster) {
            if (!existingValues['cray-service'].sqlCluster) {
              existingValues['cray-service'].sqlCluster = {}
            }
            existingValues['cray-service'].sqlCluster.enabled = true
          } else {
            if (existingValues['cray-service'].sqlCluster) {
              delete existingValues['cray-service'].sqlCluster
            }
          }
          const getNewProbe = (probe) => {
            if (probe) {
              if (probe.enabled) {
                let newProbe = {
                  initialDelaySeconds: probe.initialDelaySeconds || 5,
                  periodSeconds: probe.periodSeconds || 3,
                }
                if (probe.type && probe.type == 'tcp') {
                  newProbe.tcpSocket = {
                    port: variables.servicePort,
                  }
                } else {
                  newProbe.httpGet = {
                    port: variables.servicePort,
                    path: probe.path || `${variables.serviceBasePath}/versions`,
                  }
                }
                return newProbe
              }
              return false
            }
            return null
          }
          const replaceProbes = (containers) => {
            if (containers && (containers instanceof Array)) {
              for (let i = 0; i < containers.length; i++) {
                let newProbe = null
                newProbe = getNewProbe(containers[i].livenessProbe)
                if (newProbe === false) {
                  delete containers[i].livenessProbe
                } else if (newProbe !== null) {
                  containers[i].livenessProbe = newProbe
                }
                newProbe = getNewProbe(containers[i].readinessProbe)
                if (newProbe === false) {
                  delete containers[i].readinessProbe
                } else if (newProbe !== null) {
                  containers[i].readinessProbe = newProbe
                }
              }
            }
          }
          const replacePorts = (containers) => {
            if (containers && (containers instanceof Array)) {
              for (let i = 0; i < containers.length; i++) {
                if (containers[i].ports && (containers[i].ports instanceof Array)) {
                  for (let ii = 0; ii < containers[i].ports.length; ii++) {
                    if (containers[i].ports[ii].port) {
                      containers[i].ports[ii].containerPort = containers[i].ports[ii].port
                      containers[i].ports[ii].protocol = 'TCP'
                      delete containers[i].ports[ii].port
                    }
                  }
                }
              }
            }
          }
          replacePorts(existingValues['cray-service'].containers)
          replacePorts(existingValues['cray-service'].initContainers)
          replaceProbes(existingValues['cray-service'].containers)
          replaceProbes(existingValues['cray-service'].initContainers)
          let valuesString = yaml.stringify(existingValues)
          valuesString = valuesString.replace(/\sport:.*/g, ` port: ${variables.servicePort}`)
          valuesString = valuesString.replace(/\scontainerPort:.*/g, ` containerPort: ${variables.servicePort}`)
          this.generator.fse.writeFileSync(existingFile, `${headerComments}\n\n${valuesString}\n`)
          return false
        },
      }
    )
    this.generator._writeTemplate(
      'kubernetes/requirements.yaml',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/requirements.yaml`)
    )
    this.generator._writeTemplate(
      'kubernetes/README.md',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/README.md`)
    )
    this.generator._writeTemplate(
      'kubernetes/.gitignore',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/.gitignore`)
    )
    this.generator._writeTemplate(
      'kubernetes/templates/_helpers.tpl',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/templates/_helpers.tpl`)
    )
    this.generator._writeTemplate(
      'kubernetes/templates/NOTES.txt',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/templates/NOTES.txt`)
    )
  }

}
