const CrayGenerator = require('lib/cray-generator')

/**
 * Generator for a Cray service/API, with support for generating new services or updating existing ones with standard Cray resources.
 * <br/><br/>
 * See the source linked below and the <a href="https://yeoman.io/authoring/index.html">Yeoman generator authoring docs</a> for more info.
 * @type CrayGenerator
 * @name cray-service:app
 */
module.exports = class extends CrayGenerator {

  initializing () {
    this.branch = 'feature/cray-service-generator-updates'
  }

  prompting () {
    this.notify(
      `This is the ${this.chalk.cyan('Cray Service Generator')}. You can use this generator ` +
      'to start a brand new service or bring your existing service up-to-date with Cray standard resources. ' +
      'You\'ll want to have a repo created with an existing default branch, and that\'s really the only ' +
      'requirement here.'
    )
    const prompts = [
      {
        type: 'input',
        name: 'repoUrl',
        message: 'What\'s the *https* (not ssh) URL to the service BitBucket repo?',
      }
    ]
    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  configuring () {
    return this.gitConfigure().then(() => {
      this.props.serviceName  = this.props.repoUrl.replace(/\.git$/, '').split('/').slice(-1)[0]
      this.props.repoPath     = `/repos/${this.props.serviceName}`
      this.log.debug(`Checking if ${this.props.repoPath} already exists`)
      if (this.fse.existsSync(this.props.repoPath)) {
        this.log.debug(`Deleting ${this.props.repoPath}`)
        this.fse.removeSync(this.props.repoPath)
      }
    }).then(() => {
      return this.exec('git', [ 'clone', this.props.repoUrl, this.props.repoPath ])
    }).then(() => {
      return this.exec('git', [ 'checkout', '-b', this.branch ], { cwd: this.props.repoPath })
    }).then(() => {
      this.composeWith(require.resolve('../service'), { appProps: this.props })
      this.composeWith(require.resolve('../kubernetes'), { appProps: this.props })
    }).catch(this.handleError)
  }

  install () {
    return this.exec('git', ['add', '.'], { cwd: this.props.repoPath }).then(() => {
      return this.exec('git', ['commit', '-m', 'cray-service generator updates'], { cwd: this.props.repoPath })
    }).then(() => {
      return this.exec('git', ['push', '-f', 'origin', this.branch], { cwd: this.props.repoPath })
    }).then(() => {
      this.notify(`A branch, ${this.branch}, has been pushed to ${this.props.repoUrl}. Use the link above ` +
                  'to open a pull request on your repo for the changes made by this generator.')
    }).catch((error) => {
      if (error.stdout.match(/nothing\sto\scommit/g)) {
        this.log(
          this.notify(
            'Looks like no changes were needed on your project, nothing to commit or push, have a nice day'
          )
        )
        process.exit(0)
      } else {
        this.handleError(error)
      }
    })
  }

  end () {
    return this.exec('git', ['credential-cache', 'exit'])
  }

}