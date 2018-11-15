'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(
      yosay(`Welcome to the kryptonian ${chalk.red('generator-cray-docker-generator')} generator!`)
    );

    const prompts = [
      {
        type: 'input',
        name: 'projectName',
        message: 'Your Project Name',
        default: this.args[0]
      },
      {
        type: 'input',
        name: 'projectDescription',
        message: 'Your Project Description'
      },
      {
          type: 'list',
          name: 'projectType',
          message: 'What is the main language for your project?',
          choices: [{
              name: 'Python3',
              value: 'python3'            
            }, {
              name: 'Golang',
              value: 'golang'
            }, {
                name: 'Python2 (Obsolete)',
                value: 'python2'
            }, {
              name: 'Node.js',
              value: 'nodejs'
            }]
        }, {
        type: 'confirm',
        name: 'isKubernetesService',
        message: 'Would you like to create yaml for kubernetes?',
        default: true
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    this.fs.copy(
      this.templatePath('DockerfilePython3.tpl'),
      this.destinationPath(this.props.projectName + '/Dockerfile')
    );
    this.fs.copy(
      this.templatePath('Jenkinsfile.tpl'),
      this.destinationPath(this.props.projectName + '/Jenkinsfile')
    );
    this.fs.copy(
      this.templatePath('runBuildPrep.sh.tpl'),
      this.destinationPath(this.props.projectName + '/runBuildPrep.sh')
    );
    this.fs.copy(
      this.templatePath('runCoverage.sh.tpl'),
      this.destinationPath(this.props.projectName + '/runCoverage.sh')
    );
    this.fs.copy(
      this.templatePath('runLint.sh.tpl'),
      this.destinationPath(this.props.projectName + '/runLint.sh')
    );
    this.fs.copy(
      this.templatePath('runPostBuild.sh.tpl'),
      this.destinationPath(this.props.projectName + '/runPostBuild.sh')
    );
    this.fs.copy(
      this.templatePath('runUnitTest.sh.tpl'),
      this.destinationPath(this.props.projectName + '/runUnitTest.sh')
    );
    this.fs.copy(
      this.templatePath('version.tpl'),
      this.destinationPath(this.props.projectName + '/.version')
    );

  }

  install() {
    this.installDependencies();
  }
};
