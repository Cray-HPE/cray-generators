const Shell   = require('./shell')
const request = require('request')

/**
 * @classdesc Local git operations
 */
class Git {

  /**
   * Constructor
   */
  constructor (options = {}) {
    this.NO_CHANGES     = 'NO_CHANGES'
    this.BRANCH_CREATED = 'BRANCH_CREATED'

    this.logger     = options.logger || console
    this.shell      = new Shell({ logger: this.logger })
    this.username   = null
    this.password   = null
  }

  /**
   * Configure local git and set class-wide values
   * @param {string} username the auth username
   * @param {string} password the auth password
   * @param {string} [name] the git config user.name
   * @param {string} [email] the git config user.email
   * @returns {Promise} the shell result of the final shell config command
   */
  configure (username, password, name, email) {
    this.username = username
    this.password = password
    return this.shell.exec('git', ['config', '--global', 'user.name', name]).then(() => {
      return this.shell.exec('git', ['config', '--global', 'user.email', email])
    })
  }

  /**
   * Will translate a normal URL into an http-authenticated URL, e.g. https://username:password@[the url]
   * @param {string} url the regular url, repo url
   * @returns {string} the url with username and password injected
   */
  getAuthenticatedUrl (url) {
    return url.replace(/http(s)?:\/\//, `http$1://${this.username}:${this.password}@`)
  }

  /**
   * Gets the default branch according to a remote
   * @param {string} localClonePath the local path to a repo clone
   * @param {string} [remoteName=origin] the remote name
   * @returns {Promise} Promise result is the branch name
   */
  getRemoteDefaultBranch (localClonePath, remoteName = 'origin') {
    return this.shell.exec('git', ['remote', 'show', remoteName], { cwd: localClonePath, silent: true }).then((result) => {
      let branch = null
      result.stdout.split('\n').forEach((line) => {
        if (line.match(/(\s+)?HEAD branch:/)) {
          branch = line.split(':')[1].trim()
        }
      })
      return branch
    })
  }

  /**
   * Gets the URL of the remote "origin" from a local clone
   *
   * @param {string} localClonePath the local path to a repo clone
   * @retursn {Promise} Promise result is the trimmed stdout of the 'git remote get-url origin' command
   */
  getRemoteOriginUrl (localClonePath) {
    return this.shell.exec('git', ['remote', 'get-url', 'origin'], { cwd: localClonePath, silent: true }).then((result) => {
      return result.stdout.trim()
    })
  }

  /**
   * Run a general diff b/w two branches
   * @param {string} localClonePath the local path to a repo clone
   * @param {string} branch1 the name of the first branch to diff
   * @param {string} branch2 the name of the second branch to diff
   * @returns {Promise} Promise result is the trimmed stdout of the git diff
   */
  diffBranches (localClonePath, branch1, branch2) {
    return this.shell.exec('git', ['diff', branch1, branch2], { cwd: localClonePath }).then((result) => {
      return result.stdout.trim()
    })
  }

  /**
   * Clone a remote repo to a local location and optionally check out a branch that isn't the default one
   * @param {string} repoUrl https URL of the repo
   * @param {string} toPath path to the local clone location
   * @param {string} [branch=null] name branch to checkout after cloning
   * @param {boolean} [newBranch=true] whether or not the branch to check out is new
   * @returns {Promise} Promise result is the shell result
   */
  clone (repoUrl, toPath, branch = null, newBranch = true) {
    return this.shell.exec('git', ['clone', this.getAuthenticatedUrl(repoUrl), toPath], { mask: [ this.password ]}).then(() => {
      if (branch !== null) {
        const args = ['checkout']
        if (newBranch) args.push('-b')
        args.push(branch)
        return this.shell.exec('git', args, { cwd: toPath })
      }
    })
  }

  /**
   * Adds, commits, and pushes changes in a single operation, does nothing if no changes need be
   * committed/pushed based on the state of the local clone
   * @param {string} localClonePath the local path to a repo clone
   * @param {string} commitMessage the commit message to apply
   * @param {Object} [options={}] commit and push options
   * @param {boolean} [options.force=false] whether or not to run a <code>git push -f</code>
   * @param {boolean} [options.openPullRequest=false] whether or not to automatically open a pull request (only triggered if pushed branch is different than the default)
   * @returns {Promise} Promise result is the shell result of the push
   */
  commitAndPush (localClonePath, commitMessage, options = {}) {
    let remoteOriginUrl = null
    let branchToPush    = null
    options = Object.assign({
      force: false,
      openPullRequest: false
    }, options)
    return this.shell.exec('git', ['status', '-s'], { cwd: localClonePath }).then((result) => {
      return result.stdout.trim() == '' ? this.NO_CHANGES : this.shell.exec('git', ['add', '.'], { cwd: localClonePath })
    }).then((result) => {
      return result == this.NO_CHANGES ? result : this.shell.exec('git', ['commit', '-m', commitMessage], { cwd: localClonePath })
    }).then((result) => {
      return result == this.NO_CHANGES ? result : this.shell.exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: localClonePath })
    }).then((result) => {
      if (result == this.NO_CHANGES) return result
      branchToPush  = result.stdout.trim()
      let pushArgs  = ['push']
      if (options.force) pushArgs.push('-f')
      pushArgs.push('origin')
      pushArgs.push(branchToPush)
      return this.shell.exec('git', pushArgs, { cwd: localClonePath, mask: [ this.password ] })
    }).then((result) => {
      if (result == this.NO_CHANGES) return result
      if (options.openPullRequest) {
        return this.getRemoteOriginUrl(localClonePath)
      }
      return this.BRANCH_CREATED
    }).then((result) => {
      if (result == this.NO_CHANGES || result == this.BRANCH_CREATED) return result
      remoteOriginUrl = result
      return this.getRemoteDefaultBranch(localClonePath)
    }).then((result) => {
      if (result == this.NO_CHANGES || result == this.BRANCH_CREATED) return result
      return this.openPullRequest(remoteOriginUrl, branchToPush, result)
    })
  }

  /**
   * Opens a pull request against a repos default branch
   *
   * @param {string} repoUrl URL of the repo, can either be an ssh (git remote get-url) or the https
   * @param {string} branchName branch name for which to initiate a pull request
   * @param {string} [defaultBranch=develop] the default branch of the repo, the ultimate destination for the pull request changes
   * @returns {Promise} the request result/response
   */
  openPullRequest (repoUrl, branchName, defaultBranch = 'develop') {
    return new Promise ((resolve, reject) => {
      let projectName = null
      let repoName    = null
      let urlRegex    = null
      if (repoUrl.match(/^https:/)) {
        urlRegex    = new RegExp('^https:\\/\\/.*\\/scm\\/')
        projectName = repoUrl.replace(urlRegex, '').split('/')[0]
        repoName    = repoUrl.replace(urlRegex, '').split('/').slice(-1)[0].replace(/\.git$/, '')
      } else if (repoUrl.match(/^ssh:/)) {
        urlRegex    = new RegExp('ssh:\\/\\/.*\\/')
        projectName = repoUrl.replace(urlRegex, '').split('/')[0]
        repoName    = repoUrl.replace(urlRegex, '').split('/')[1]
      } else {
        throw new Error(`Invalid repoUrl passed to the git.openPullRequest method: ${repoUrl}`)
      }
      const uri     = `https://stash.us.cray.com/rest/api/1.0/projects/${projectName}/repos/${repoName}/pull-requests`
      const options = {
        uri: uri,
        method: 'POST',
        json: true,
        body: {
          title: `Cray Generators ${branchName}`,
          description: 'Pull request automatically submitted by cray generators',
          fromRef: {
            id: `refs/heads/${branchName}`,
            repository: {
              slug: repoName,
              name: null,
              project: {
                key: projectName,
              },
            },
          },
          toRef: {
            id: `refs/heads/${defaultBranch}`,
            repository: {
              slug: repoName,
              name: null,
              project: {
                key: projectName,
              },
            },
          },
        },
        auth: {
          user: this.username,
          password: this.password,
        },
      }
      request(options, (error, response, body) => {
        if (error) return reject(error)
        if (response && response.statusCode != 201) {
          return reject(`Received response code ${response.statusCode} from ${uri} attempting to open a pull request, body: ${JSON.stringify(body)}`)
        }
        return resolve({ response, body })
      })
    })
  }

}

module.exports = Git