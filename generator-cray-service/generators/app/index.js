const CrayGenerator     = require('lib/cray-generator')
const Git               = require('lib/git')
const ServiceSection    = require('./service')
const KubernetesSection = require('./kubernetes')

/**
 * Generator for a Cray service/API, with support for generating new services or updating existing ones with standard Cray resources.
 * <br/><br/>
 * See the source linked below and the <a href="https://yeoman.io/authoring/index.html">Yeoman generator authoring docs</a> for more info.
 * @type CrayGenerator
 * @name cray-service:app
 */
module.exports = class extends CrayGenerator {

  initializing () {
    this.git            = null
    this.branch         = 'feature/cray-service-generator-updates'
    this.gitConfigName  = 'Cray Generators'
    this.gitConfigEmail = 'casm-cloud@cray.com'
    this.rootRepoPath   = '/tmp'
    this.sections       = {
      service: new ServiceSection(this, this.isSectionEnabled('service')),
      kubernetes: new KubernetesSection(this, this.isSectionEnabled('kubernetes')),
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
      }
    ]
    prompts = prompts.concat(this.sections.service.prompts())
    prompts = prompts.concat(this.sections.kubernetes.prompts())

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  configuring () {
    this.props.serviceName  = this.props.repoUrl.replace(/\.git$/, '').split('/').slice(-1)[0]
    this.props.repoPath     = `${this.rootRepoPath}/${this.props.serviceName}`
    if (this.fse.existsSync(this.props.repoPath)) {
      this.fse.removeSync(this.props.repoPath)
    }
    this.git = new Git({ logger: this.log })
    return this.git.configure(this.props.repoUsername, this.props.repoPassword, this.gitConfigName, this.gitConfigEmail).then(() => {
      return this.git.clone(this.props.repoUrl, this.props.repoPath, this.branch)
    }).then(() => {
      this.destinationRoot(this.props.repoPath)
    }).catch(this.handleError)
  }

  default () {
    this.sections.service.default()
    this.sections.kubernetes.default()
  }

  install () {
    return this.git.commitAndPush(this.props.repoPath, 'cray-service generator updates').then(() => {
      this.notify(`Branch ${this.branch} has been pushed to ${this.props.repoUrl}. Use the link above ` +
                  'to open a pull request on your repo for the changes made by this generator.')  
    }).catch(this.handleError)
  }

  end () {
    this.fse.removeSync(this.props.repoPath)
  }

}