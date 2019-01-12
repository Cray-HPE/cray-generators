const CrayGeneratorSection  = require('lib/cray-generator-section')
const falsey                = require('falsey')
const path                  = require('path')
const fs                    = require('fs')

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
        name: 'cliEnabled',
        message: 'Do you want to integrate with the Cray CLI Framework?',
        default: false,
      },
      {
        when: (response) => {
          return response.cliEnabled
        },
        type: 'input',
        name: 'cliName',
        message: 'What is your CLI called. This should be a short name and descriptive name. Examples include: `uas` and `pals`. This translates to the following within the CLI: `cray {your cli name} {a CLI command}` for example: `cray config list`:',
        default: (response) => {
          return this.generator._getServiceName(response.repoUrl)
        },
        transformer: (input) => {
          return `${input.replace(/\s+/g, '-')}`
        },
        filter: (input) => {
          return `${input.replace(/\s+/g, '-').replace(/^cray-/, '')}`
        }
      },
    ]
  }

  configuring () {
    if (this.generator.responses.cliEnabled) {
      this.repoPath = `${this.generator.rootRepoPath}/craycli`
      this.branch   = `feature/${this.generator.props.serviceName}-cli-integration`
      if (this.generator.fse.existsSync(this.repoPath)) {
        this.generator.fse.removeSync(this.repoPath)
      }
      return this.generator.git.clone(this.repoUrl, this.repoPath, this.branch)
    }
  }

  writing () {
    if (this.generator.responses.cliEnabled) {
      const moduleName = this.generator.responses.cliName
      const specFileName = path.basename(this.generator.props.swagger.specFilePath)
      this.generator.fs.copy(
        `${this.generator.props.repoPath}/${this.generator.props.swagger.specFilePath}`,
        `${this.repoPath}/cray/modules/${moduleName}/${specFileName}`
      )
      this.generator._writeTemplate('cli/__init__.py', `${this.repoPath}/cray/modules/${moduleName}/__init__.py`)
      this.generator._writeTemplate('cli/remote.json', `${this.repoPath}/cray/modules/${moduleName}/remote.json`)
      this.generator._writeTemplate('cli/cli.py', `${this.repoPath}/cray/modules/${moduleName}/cli.py`)
    }
  }

  install () {
    if (this.generator.responses.cliEnabled) {
      const commitMessage = `cray-service generator updates for ${this.generator.props.serviceName}`
      const forcePush     = !falsey(this.generator.options['force-push'])
      return this.generator.git.commitAndPush(this.repoPath, commitMessage, { force: forcePush, openPullRequest: true }).then((result) => {
        this.generator._processGitCommitAndPushResult(result, this.repoUrl, this.branch)
      })
    }
  }

  end () {
    if (this.generator.responses.cliEnabled && fs.existsSync(this.repoPath)) {
      this.generator.fse.removeSync(this.repoPath)
    }
  }

}
