const CrayGenerator     = require('lib/cray-generator')
const Git               = require('lib/git')
const ServiceSection    = require('./service')
const KubernetesSection = require('./kubernetes')
const CliSection        = require('./cli')
const falsey            = require('falsey')

/**
 * Generator for a Cray service/API, with support for generating new services or updating existing ones with standard Cray resources.
 * <br/><br/>
 * See the source linked below and the <a href="https://yeoman.io/authoring/index.html">Yeoman generator authoring docs</a> for more info.
 * @type CrayGenerator
 * @name cray-service:app
 */
module.exports = class extends CrayGenerator {

  constructor (args, opts) {
    super(args, opts)
    this.option('push', {
      type: String,
      default: 'yes',
      description: 'whether or not to push changes to the repo',
    })
    this.option('overwrite', {
      type: String,
      default: 'yes',
      description: 'whether or not to overwrite existing files in the repo',
    })
    this.option('force-push', {
      type: String,
      default: 'no',
      description: 'whether or not to run the git push as a forced git push',
    })
  }

  initializing () {
    this.git            = null
    this.branch         = 'feature/cray-service-generator-updates'
    this.gitConfigName  = 'Cray Generators'
    this.gitConfigEmail = 'casm-cloud@cray.com'
    this.rootRepoPath   = '/tmp'
    this.sections       = {
      service: new ServiceSection(this, 'service'),
      kubernetes: new KubernetesSection(this, 'kubernetes'),
      cli: new CliSection(this, 'cli'),
    }
  }

  prompting () {
    this.notify(
      `This is the ${this.chalk.cyan('Cray Service Generator')}. You can use this generator ` +
      'to start a brand new service or bring your existing service up-to-date with Cray standard resources. ' +
      'You\'ll want to have a repo created with an existing default branch, and that\'s really the only ' +
      'requirement here.'
    )
    let prompts = [
      {
        type: 'input',
        name: 'repoUrl',
        message: 'What\'s the *https* (not ssh) URL to the service BitBucket/Stash repo?',
      },
      {
        type: 'input',
        name: 'repoUsername',
        message: 'How about your username for accessing the repo?',
      },
      {
        type: 'password',
        name: 'repoPassword',
        message: 'And your password? (no credentials persist after this run)',
      },
    ]
    prompts = prompts.concat(this.sections.service.prompts())
    prompts = prompts.concat(this.sections.kubernetes.prompts())
    prompts = prompts.concat(this.sections.cli.prompts())

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  configuring () {
    this.props.serviceName  = this._getServiceName(this.props.repoUrl)
    this.props.repoPath     = this._getRepoPath(this.props.repoUrl)
    if (this.fse.existsSync(this.props.repoPath)) {
      this.fse.removeSync(this.props.repoPath)
    }
    this.git = new Git({ logger: this.log })
    return this.git.configure(this.props.repoUsername, this.props.repoPassword, this.gitConfigName, this.gitConfigEmail).then(() => {
      return this.git.clone(this.props.repoUrl, this.props.repoPath, this.branch)
    }).then(() => {
      this.destinationRoot(this.props.repoPath)
    }).then(() => {
      return this.sections.cli.configuring()
    }).catch(this.handleError)
  }

  writing () {
    this.sections.service.writing()
    this.sections.kubernetes.writing()
    this.sections.cli.writing()
  }

  _notifyBranchPushed (branchName, repoUrl) {
    this.notify(`Branch ${branchName} has been pushed to ${repoUrl}. Use the link above ` +
                'to open a pull request on your repo for the changes made by this generator.')
  }

  _notifyRepoUnchanged (baseBranchName, repoUrl) {
    this.notify(`Branch ${baseBranchName} on ${repoUrl} did not require changes`)
  }

  /**
   * Parses the git repo URL and returns the service name
   * @param {string} repoUrl the URL for the git repo being used.
   * @returns {string}
   */
  _getServiceName (repoUrl) {
    return repoUrl.replace(/\.git$/, '').split('/').slice(-1)[0]
  }

  /**
   * Parses the git repo URL and returns the service name
   * @param {string} repoUrl the URL for the git repo being used.
   * @returns {string}
   */
  _getRepoPath (repoUrl) {
    return `${this.rootRepoPath}/${this._getServiceName(repoUrl)}`
  }

  install () {
    if (falsey(this.options.push)) {
      this.notify('Not committing/pushing changes because the push option was set to off')
    } else {
      const commitMessage = 'cray-service generator updates'
      const forcePush     = !falsey(this.options['force-push'])
      return this.git.commitAndPush(this.props.repoPath, commitMessage, forcePush).then((result) => {
        if (result !== false) {
          this._notifyBranchPushed(this.branch, this.props.repoUrl)
        } else {
          this._notifyRepoUnchanged(this.branch, this.props.repoUrl)
        }
        return this.sections.cli.install()
      }).catch(this.handleError)
    }
  }

  end () {
    this.fse.removeSync(this.props.repoPath)
    this.notify('One final note, after creating a new service or updating an existing one, please refer to ' +
                'the generator-cray-service/README.md for further guidance on Cray standards and other ' +
                'resources for working on your service.')
  }

}
