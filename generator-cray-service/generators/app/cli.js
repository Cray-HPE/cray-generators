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
    this.repoUrl            = 'https://stash.us.cray.com/scm/cloud/craycli.git'
    this.forkedRepoUrl      = null
    this.repoPath           = null
    this.branch             = null
    this.forkCloneFailures  = 0
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

  /**
   * Clones the user forked craycli repo, forks and then clones if a fork doesn't already exist
   *
   * @returns {Promise} the clone result
   */
  _cloneForkedRepo () {
    return this.generator.git.clone(this.forkedRepoUrl, this.repoPath, this.branch).catch((error) => {
      this.forkCloneFailures++
      if (this.forkCloneFailures > 1) {
        throw error
      } else {
        return this.generator.git.fork(this.repoUrl, `~${this.generator.responses.repoUsername}`).then(() => {
          return this._cloneForkedRepo()
        })
      }
    })
  }

  configuring () {
    if (this.generator.responses.cliEnabled) {
      this.repoPath       = `${this.generator.rootRepoPath}/craycli`
      this.branch         = `feature/${this.generator.props.serviceName}-cli-integration`
      this.forkedRepoUrl  = `https://stash.us.cray.com/scm/~${this.generator.responses.repoUsername}/craycli.git`
      if (this.generator.fse.existsSync(this.repoPath)) {
        this.generator.fse.removeSync(this.repoPath)
      }
      return this._cloneForkedRepo()
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
      return this.generator.git.commitAndPush(
        this.repoPath,
        commitMessage,
        {
          force: forcePush,
          openPullRequest: true,
          pullRequestDestination: this.repoUrl,
        }
      ).then((result) => {
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
