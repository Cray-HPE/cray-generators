/*
 * MIT License
 *
 * (C) Copyright [2021] Hewlett Packard Enterprise Development LP
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR
 * OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

const CrayGenerator     = require('lib/cray-generator')
const Git               = require('lib/git')
const ServiceSection    = require('./service')
const KubernetesSection = require('./kubernetes')
const CliSection        = require('./cli')
const path              = require('path')
const defaultRoot       = path.resolve(__dirname, '..', '..', '.tmp')
const semver            = require('semver')
const Request           = require('lib/request')

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
      type: Boolean,
      default: true,
      description: 'whether or not to push changes to the repo',
    })
    this.option('force', {
      type: Boolean,
      default: false,
      description: 'Generic force flag, for forcing overwriting both local changes and the created branch/PR',
    })
    this.request = new Request()
  }

  initializing () {
    if (this.options.destinationRoot == '') {
      this.destinationRoot(defaultRoot)
    }
    this.git        = new Git({ logger: this.log })
    this.branch     = 'feature/cray-service-generator-updates'
    this.sections   = {
      service:      new ServiceSection(this, 'service'),
      kubernetes:   new KubernetesSection(this, 'kubernetes'),
      cli:          new CliSection(this, 'cli'),
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
        filter: this.git.getRepoHttpsCloneUrl.bind(this.git),
        validate: this.git.validateRepoHttpsCloneUrl.bind(this.git),
        type: 'input',
        name: 'repoUrl',
        message: 'What\'s the clone URL of the BitBucket/Stash repo for your service?',
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
        when: () => {
          return this._isSectionEnabled('service') || this._isSectionEnabled('kubernetes')
        },
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
      this.responses                = responses
    })
  }

  configuring () {
    this.props.serviceName  = this._getServiceName(this.responses.repoUrl)
    this.props.chartName    = this._getChartName(this.responses.repoUrl)
    this.props.repoPath     = this._getRepoPath(this.responses.repoUrl)
    this.props.repoUrlParts = this.git.getRepoUrlParts(this.responses.repoUrl)
    if (this.fse.existsSync(this.props.repoPath)) {
      this.fse.removeSync(this.props.repoPath)
    }
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
    }).then(() => {
      return this._getCurrentChartVersion('cray-service')
    }).then((version) => {
      this.props.baseChartVersion = `~${version}`
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
    if (!this.options.push) {
      this.notify('Not committing/pushing changes because the push option was set to off')
    } else {
      const commitMessage = 'cray-service generator updates'
      return this.git.commitAndPush(
        this.props.repoPath, commitMessage, {
          force: this.options.force,
          openPullRequest: true,
          pullRequestDescription: 'Pull request automatically opened by the Cray service generator. Please note that if ' +
            'your Helm chart has changed, you will need to increment it\'s version in Chart.yaml yourself.'
        }).then((result) => {
        this._processGitCommitAndPushResult(result, this.responses.repoUrl, this.branch)
        return this.sections.cli.install()
      }).catch((error) => {
        const errorText = (error.stderr || error.stdout || error)
        if (errorText.indexOf('rejected') >= 0) {
          this.handleError(
            'The git branch push was rejected, likely because the branch already exists in your repo. ' +
            'You can use the flag --force when running the generator to force push changes made by the generator ' +
            'to the branch.'
          )
        } else {
          this.handleError(error)
        }
      })
    }
  }

  end () {
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
      let notifyMessage = `A pull request was opened automatically for ${branchName} in ${repoUrl}`
      this._notify(notifyMessage)
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
   * Parses the git repo URL and returns the chart name
   * @param {string} repoUrl the URL for the git repo being used.
   * @returns {string}
   */
  _getChartName (repoUrl) {
    return this._getServiceName(repoUrl).replace(/_/g, '-')
  }

  /**
   * Parses the git repo URL and returns the service name
   * @param {string} repoUrl the URL for the git repo being used.
   * @returns {string}
   */
  _getRepoPath (repoUrl) {
    return `${this.destinationRoot()}/${this._getServiceName(repoUrl)}`
  }

  /**
   * Gets the most recent/current chart version from our central helm repo
   *
   * @param {string} chartName the name of the chart
   * @returns {Promise} the resolved version
   */
  _getCurrentChartVersion (chartName) {
    const uri     = `http://helmrepo.dev.cray.com:8080/api/charts/${chartName}`
    const options = {
      uri: uri,
      method: 'GET',
      json: true,
    }
    return this.request.request(options, (error, response) => {
      if (error !== null) return error
      if (response && response.statusCode != 200) {
        return `Received response code ${response.statusCode} from ${uri}`
      }
      return true
    }).then((result) => {
      let version = '0.0.0'
      if (result.body && result.body.length) {
        result.body.forEach((publishedChart) => {
          if (semver.gt(publishedChart.version, version)) {
            version = publishedChart.version
          }
        })
      }
      return version
    })
  }

}
