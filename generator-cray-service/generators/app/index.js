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
    this.option('force-push', {
      type: String,
      default: 'no',
      description: 'whether or not to run the git push as a forced git push',
    })
  }

  initializing () {
    this.git            = null
    this.branch         = 'feature/cray-service-generator-updates'
    this.rootRepoPath   = '/opt/cray-generators/.tmp'
    this.sections       = {
      service:    new ServiceSection(this, 'service'),
      kubernetes: new KubernetesSection(this, 'kubernetes'),
      cli:        new CliSection(this, 'cli'),
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
        validate: (inputValue) => {
          if (!inputValue.match(/^https:\/\/stash.us.cray.com/)) {
            return 'Your repository should be in the https form like https://stash.us.cray.com/...'
          }
          return true
        },
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
      {
        type: 'confirm',
        name: 'hasWebFrontend',
        message: 'Will your service expose a web frontend?',
        default: false,
      },
      {
        when: (response) => {
          return !response.hasWebFrontend
        },
        type: 'confirm',
        name: 'requiresExternalAccess',
        message: 'Will your service need to be accesible from outside of a Cray?',
        default: false,
      },
      {
        type: 'input',
        name: 'servicePort',
        message: 'On what port will your service listen for requests?',
        default: '8080',
      },
    ]
    prompts = prompts.concat(this.sections.service.prompts())
    prompts = prompts.concat(this.sections.kubernetes.prompts())
    prompts = prompts.concat(this.sections.cli.prompts())

    return this.prompt(prompts).then(responses => {
      responses.serviceBasePath     = '/apis/v1'
      responses.servicePathsPrefix  = ''
      if (responses.hasWebFrontend) {
        // with a web frontend, external access is assumed
        responses.requiresExternalAccess  = true
        responses.servicePathsPrefix      = responses.serviceBasePath
        responses.serviceBasePath         = '/'
      }
      this.responses = responses
    })
  }

  configuring () {
    this.props.serviceName  = this._getServiceName(this.responses.repoUrl)
    this.props.repoPath     = this._getRepoPath(this.responses.repoUrl)
    if (this.fse.existsSync(this.props.repoPath)) {
      this.fse.removeSync(this.props.repoPath)
    }
    this.git = new Git({ logger: this.log })
    return this.git.configure(
      this.responses.repoUsername,
      this.responses.repoPassword,
      this.responses.repoUsername,
      `${this.responses.repoUsername}@cray.com`
    ).then(() => {
      return this.git.clone(this.responses.repoUrl, this.props.repoPath, this.branch)
    }).then(() => {
      this.destinationRoot(this.props.repoPath)
      return this.sections.service.configuring()
    }).then(() => {
      return this.sections.cli.configuring()
    }).catch(this.handleError)
  }

  writing () {
    return this.sections.service.writing().then(() => {
      this.sections.kubernetes.writing()
      this.sections.cli.writing()
    })
  }

  conflicts () {
    return this.sections.service.conflicts()
  }

  install () {
    if (falsey(this.options.push)) {
      this.notify('Not committing/pushing changes because the push option was set to off')
    } else {
      const commitMessage = 'cray-service generator updates'
      const forcePush     = !falsey(this.options['force-push'])
      return this.git.commitAndPush(this.props.repoPath, commitMessage, { force: forcePush, openPullRequest: true }).then((result) => {
        this._processGitCommitAndPushResult(result, this.responses.repoUrl, this.branch)
        return this.sections.cli.install()
      }).catch(this.handleError)
    }
  }

  end () {
    this.fse.removeSync(this.props.repoPath)
    this.sections.cli.end()
    this.notify('One final note, after creating a new service or updating an existing one, please refer to ' +
                'the generator-cray-service/README.md for further guidance on Cray standards and other ' +
                'resources for working on your service.')
  }

  /**
   * Common way to process the results of the git.commitAndPush method
   *
   * @param {*} result the result of a git.commitAndPush call
   * @param {string} repoUrl the repo URL relevant to the call
   * @param {string} branchName the branch name relevant to the call
   */
  _processGitCommitAndPushResult (result, repoUrl, branchName) {
    if (result == this.git.NO_CHANGES) {
      this._notify(`The repo ${repoUrl}, branch ${branchName} did not require any changes`)
    } else if (result == this.git.BRANCH_CREATED) {
      this._notify(`Branch ${branchName} was created in ${repoUrl}`)
    } else {
      this._notify(`A pull request was opened automatically for ${branchName} in ${repoUrl}`)
    }
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

}
