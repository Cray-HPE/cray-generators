/**
 * @classdesc General helpers around generators development
 */
class Helpers {

  /**
   * Turns an array of arguments into a usable command line string
   * @param {array} args an array of arguments
   * @returns {string} the stringified args
   */
  stringifyArgsArray (args) {
    let result = ''
    args.forEach((arg) => {
      if (arg && arg.toString) arg = arg.toString()
      if (typeof arg !== 'string') return
      if (arg.match(/\s/g)) {
        result += ` "${arg}"`
      } else {
        result += ` ${arg}`
      }
    })
    return result.trim()
  }

  /**
   * Replaces sensitive text in a string with a masked value
   *
   * @param {string} inString
   * @param {string} toMask
   * @returns masked string
   */
  maskText (inString, toMask) {
    toMask = toMask.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return inString.replace(new RegExp(toMask, 'g'), '******')
  }

}

module.exports = Helpers