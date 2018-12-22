const CrayGenerator = require('lib/cray-generator')

module.exports = class extends CrayGenerator {

  initializing() {
    this.options.appProps = this.options.appProps || {}
  }

  prompting() {
    this.log(this.yosay(this.chalk.cyan('Cray Service/API Development Resources'), { maxLength: this.yosayWidth }))
    const prompts = [
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
      this.props = Object.assign(this.options.appProps, props)
    })
  }
 
  writing() {
    this.destinationRoot(this.options.repoPath)
    this.fs.copyTpl(
      this.templatePath('Jenkinsfile.tpl'),
      this.destinationPath('Jenkinsfile'),
      this.props
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
}
