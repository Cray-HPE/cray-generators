const Shell = require('./shell')

/**
 * @classdesc Local git operations
 */
class Git {

  /**
   * Constructor
   */
  constructor () {
    this.shell = new Shell()
  }

  /**
   * General local git configuration
   * @param {string} name configured git user.name
   * @param {string} email configured git user.email
   */
  configure (name, email) {
    return this.shell.exec('git', ['config', '--global', 'user.name', name]).then(() => {
      return this.shell.exec('git', ['config', '--global', 'user.email', email])
    }).then(() => {
      return this.shell.exec('git', [ 'config', '--global', 'credential.helper', 'cache --timeout 3600' ])
    })
  }

  /*clone (repoUrl, username, password, toPath) {
    
  }*/

}

module.exports = Git