const CrayGeneratorSection = require('lib/cray-generator-section')

/**
 * Dealing with bringing the requirements/base service chart version up-to-date
 * @type CrayGeneratorSection
 * @name cray-service:app[base-chart-version]
 */
module.exports = class extends CrayGeneratorSection {

  writing () {
    this.generator._writeTemplate(
      'kubernetes/requirements.yaml',
      this.generator.destinationPath(`kubernetes/${this.generator.props.chartName}/requirements.yaml`)
    )
  }

}
