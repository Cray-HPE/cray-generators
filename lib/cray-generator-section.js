/**
 * @classdesc Base Generator section, for sub-dividing up generators into individual 
 * sections that can be included or excluded from any generator run
 */
class CrayGeneratorSection {

  /**
   * 
   * @param {CrayGenerator} generator the generator
   * @param {boolean} enabled whether or not this section should be enabled, a 
   *                          section is in charge of reacting to whether or not its enabled
   */
  constructor (generator, enabled) {
    this.generator = generator
    this.enabled   = enabled
  }

}

module.exports = CrayGeneratorSection