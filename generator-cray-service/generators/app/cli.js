const CrayGeneratorSection  = require('lib/cray-generator-section')
const falsey                = require('falsey')
const path                  = require('path');

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
    this.props = {}
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
          return response.cliEnabled;
        },
        type: 'input',
        name: 'cliName',
        message: 'What is your CLI called. This should be a short name and descriptive name. Examples include: `uas` and `pals`. This translates to the following within the CLI: `cray {your cli name} {a CLI command}` for example: `cray config list`:',
        default: (response) => {
          return this.generator._getServiceName(response.repoUrl)
        },
        transformer: (input, answer) => {
          return `${input.replace(/\s+/g, '-')}`
        }
      },
       {
        when: (response) => {
          return response.cliEnabled;
        },
        type: 'input',
        name: 'cliSpecFile',
        message: 'What is the path to your OpenAPI Spec File (Swagger)?',
        transformer: (input, answer) => {
          let repoPath = this.generator._getRepoPath(answer.repoUrl)
          return `.${repoPath.replace(this.generator.rootRepoPath, '')}/${input}`
        },
        filter: (input, answer) => {
          let repoPath = this.generator._getRepoPath(answer.repoUrl)
          return path.join(repoPath, input)
        }
      },
    ]
  }

  configuring () {
    this.props = this.generator.props
    if (this.props.cliEnabled) {
      this.repoPath = `${this.generator.rootRepoPath}/craycli`
      this.branch   = `feature/${this.props.serviceName}-cli-integration`
      if (this.generator.fse.existsSync(this.repoPath)) {
        this.generator.fse.removeSync(this.repoPath)
      }
      return this.generator.git.clone(this.repoUrl, this.repoPath, this.branch)
    }
  }

  writing () {
    if (this.props.cliEnabled) {
      const moduleName = this.props.cliName.replace(/^cray-/, '')
      const specFileName = path.basename(this.props.cliSpecFile)
      if (this.generator.fse.existsSync(this.props.cliSpecFile)) {
        this.generator.fs.copy(this.props.cliSpecFile, `${this.repoPath}/cray/modules/${moduleName}/${this.specFileName}`)
      } else {
        throw `Spec file not found! ${this.props.cliSpecFile}`
      }
      this.generator._writeTemplate('cli/__init__.py', `${this.repoPath}/cray/modules/${moduleName}/__init__.py`)
      this.generator._writeTemplate('cli/cli.py', `${this.repoPath}/cray/modules/${moduleName}/cli.py`)
    }
  }

  install () {
    if (this.props.cliEnabled) {
      const commitMessage = `cray-service generator updates for ${this.props.serviceName}`
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

}
