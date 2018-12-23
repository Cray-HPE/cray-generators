const Shell = require('./shell')

/**
 * @classdesc Local git operations
 */
class Git {

  /**
   * Constructor
   */
  constructor (options = {}) {
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
    return this.shell.exec('git', ['remote', 'show', remoteName], { cwd: localClonePath }).then((result) => {
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
    return this.shell.exec('git', ['clone', this.getAuthenticatedUrl(repoUrl), toPath]).then(() => {
      if (branch !== null) {
        const args = ['checkout']
        if (newBranch) args.push('-b')
        args.push(branch)
        return this.shell.exec('git', args, { cwd: toPath })
      }
    })
  }

  /**
   * Adds, commits, and pushes changes in a single operation
   * @param {string} localClonePath the local path to a repo clone
   * @param {string} commitMessage the commit message to apply
   * @param {boolean} force whether or not to run a <code>git push -f</code>
   * @returns {Promise} Promise result is the shell result of the push
   */
  commitAndPush (localClonePath, commitMessage, force = false) {
    return this.shell.exec('git', ['add', '.'], { cwd: localClonePath }).then(() => {
      return this.shell.exec('git', ['commit', '-m', commitMessage], { cwd: localClonePath })
    }).then(() => {
      return this.shell.exec('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: localClonePath })
    }).then((result) => {
      const currentBranch = result.stdout.trim()
      let pushArgs = ['push']
      if (force) pushArgs.push('-f')
      pushArgs.push('origin')
      pushArgs.push(currentBranch)
      return this.shell.exec('git', pushArgs, { cwd: localClonePath })
    })
  }

}

module.exports = Git