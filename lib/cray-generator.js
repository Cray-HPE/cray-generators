const Generator = require('yeoman-generator')

class CrayGenerator extends Generator {
  
  constructor (args, opts) {
    super(args, opts)
    this.fsExtra  = require('fs-extra')
    this.chalk    = require('chalk')
    this.yosay    = require('yosay')
  }

}

module.exports = CrayGenerator