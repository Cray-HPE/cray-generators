const CrayGeneratorSection  = require('lib/cray-generator-section')
const falsey                = require('falsey')

/**
 * Handling of CLI integration
 * @type CrayGeneratorSection
 * @name cray-service:app[cli]
 */
module.exports = class extends CrayGeneratorSection {

  constructor (generator, name) {
    super(generator, name)
    this.repoUrl  = 'https://stash.us.cray.com/scm/cloud/craycli.git'
    this.repoPath = null
    this.branch   = null
  }

  prompts () {
    return [
      {
        type: 'confirm',
        name: 'enableCLI',
        message: 'Do you want to integrate with the Cray CLI Framework?',
        default: false,
      },
    ]
  }

  configuring () {
    this.repoPath = `${this.generator.rootRepoPath}/craycli`
    this.branch   = `feature/${this.generator.props.serviceName}-cli-integration`
    if (this.generator.fse.existsSync(this.repoPath)) {
      this.generator.fse.removeSync(this.repoPath)
    }
    return this.generator.git.clone(this.repoUrl, this.repoPath, this.branch)
  }

  writing () {
    const moduleName = this.generator.props.serviceName.replace(/^cray-/, '')
    this.generator._writeTemplate('cli/__init__.py', `${this.repoPath}/cray/modules/${moduleName}/__init__.py`)
    this.generator._writeTemplate('cli/cli.py', `${this.repoPath}/cray/modules/${moduleName}/cli.py`)
  }

  install () {
    const commitMessage = `cray-service generator updates for ${this.generator.props.serviceName}`
    const forcePush     = !falsey(this.generator.options['force-push'])
    return this.generator.git.commitAndPush(this.repoPath, commitMessage, forcePush).then((result) => {
      if (result !== false) {
        this.generator._notifyBranchPushed(this.branch, this.repoUrl)
      } else {
        this.generator._notifyRepoUnchanged(this.branch, this.repoUrl)
      }
    })
  }

}