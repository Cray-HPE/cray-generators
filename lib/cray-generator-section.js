/**
 * @classdesc Base Generator section, for sub-dividing up generators into individual
 * sections that can be included or excluded from any generator run
 */
class CrayGeneratorSection {

  /**
   *
   * @param {CrayGenerator} generator the generator
   * @param {string} name the name of this generator section
   */
  constructor (generator, name) {
    this.name       = name
    this.generator  = generator
    this._init()
  }

  _initializing () { return new Promise((resolve) => { return resolve() }) }
  _prompts () { return [] }
  _configuring () { return new Promise((resolve) => { return resolve() }) }
  _default () { return new Promise((resolve) => { return resolve() }) }
  _writing () { return new Promise((resolve) => { return resolve() }); }
  _conflicts () { return new Promise((resolve) => { return resolve() }) }
  _install () { return new Promise((resolve) => { return resolve() }) }
  _end () { return new Promise((resolve) => { return resolve() }) }

  /**
   * Initialization which is called by the constructor and ensures that methods are set
   * appropriately according to whether or not this section should be enabled
   */
  _init () {
    if (!this.generator.isSectionEnabled(this.name)) {
      this.initializing = this._initializing
      this.prompts      = this._prompts
      this.configuring  = this._configuring
      this.default      = this._default
      this.writing      = this._writing
      this.conflicts    = this._conflicts
      this.install      = this._install
      this.end          = this._end
    }
  }

}

module.exports = CrayGeneratorSection