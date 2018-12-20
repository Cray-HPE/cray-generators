const CrayGenerator = require('lib/cray-generator')
const fs            = require('fs-extra')
const rimraf        = require('rimraf')

module.exports = class extends CrayGenerator {

  initializing() {
    this.branch = 'feature/cray-service-generator'
    this.yosayLength = 80
  }

  prompting() {

    this.log(
      this.yosay(`Welcome to the\n\n${this.chalk.cyan('Cray Service Generator')}\n\nYou can use this generator ` +
            `to start a brand new service or bring your existing service up-to-date with Cray standard resources. ` +
            `You'll want to have a repo created with an existing default branch, and that's really the only requirement here.`, { maxLength: this.yosayLength })
    )

    const prompts = [
      {
        type: 'input',
        name: 'repoUrl',
        message: "What's the https URL to your project BitBucket repo?",
      },
      {
        type: 'list',
        name: 'language',
        message: 'What is the primary language for your service?',
        choices: [
          {
            name: 'Python 3',
            value: 'python3'            
          }, 
          {
            name: 'Golang',
            value: 'golang'
          },
          {
            name: 'C++',
            value: 'c++'
          },
          {
              name: 'Python 2 (Obsolete)',
              value: 'python2'
          }, 
          {
            name: 'Node.js',
            value: 'nodejs'
          }
        ]
      }
    ]

    return this.prompt(prompts).then(props => {
      this.props = props
    })
  }

  configuring() {
    this.spawnCommandSync('git', ['config', '--global', 'user.email', '"casm-cloud@cray.com"'])
    this.spawnCommandSync('git', ['config', '--global', 'user.name', '"Cray Generators"'])
  }
 
  writing() {
    this.props.serviceName = this.props.repoUrl.replace(/\.git$/, '').split('/').slice(-1)[0]
    this.props.repoPath    = `/cray-generators/repos/${this.props.serviceName}`
    this.log(`Cloning repo at ${this.props.repoUrl} to ${this.props.repoPath}`)
    if (fs.existsSync(`${this.props.repoPath}`)) {
      fs.removeSync(`${this.props.repoPath}`)
    }
    this.spawnCommandSync('git', ['config', '--global', 'credential.helper', 'cache --timeout 3600'])
    this.spawnCommandSync('git', ['clone', this.props.repoUrl, `${this.props.repoPath}`])
    this.spawnCommandSync('git', ['checkout', '-b', this.branch], { cwd: this.props.repoPath })
    this.fs.copy(
      this.templatePath('Jenkinsfile.tpl'),
      `${this.props.repoPath}/Jenkinsfile`
    )
    
    // this.fs.copy(
    //   this.templatePath('runBuildPrep.sh.tpl'),
    //   this.destinationPath(this.props.projectName + '/runBuildPrep.sh')
    // );
    // this.fs.copy(
    //   this.templatePath('runCoverage.sh.tpl'),
    //   this.destinationPath(this.props.projectName + '/runCoverage.sh')
    // );
    // this.fs.copy(
    //   this.templatePath('runLint.sh.tpl'),
    //   this.destinationPath(this.props.projectName + '/runLint.sh')
    // );
    // this.fs.copy(
    //   this.templatePath('runPostBuild.sh.tpl'),
    //   this.destinationPath(this.props.projectName + '/runPostBuild.sh')
    // );
    // this.fs.copy(
    //   this.templatePath('runUnitTest.sh.tpl'),
    //   this.destinationPath(this.props.projectName + '/runUnitTest.sh')
    // );
    // this.fs.copy(
    //   this.templatePath('version.tpl'),
    //   this.destinationPath(this.props.projectName + '/.version')
    // );

  }

  install() {
    this.spawnCommandSync('git', ['add', '.'], { cwd: this.props.repoPath })
    this.spawnCommandSync('git', ['commit', '-m', '"cray-service generator updates"'], { cwd: this.props.repoPath })
    this.spawnCommandSync('git', ['push', '-f', 'origin', this.branch], { cwd: this.props.repoPath })
    this.log(
      this.yosay(`A branch, ${this.branch}, has been pushed to ${this.props.repoUrl}. Use the link above to open a pull request ` +
                 `on your repo for the changes made by this generator.`, { maxLength: this.yosayLength })
    )
    this.spawnCommandSync('git', ['credential-cache', 'exit'])
  }

}
