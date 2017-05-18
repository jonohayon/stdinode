/**
 * lib.js
 * This file holds the global library that's injected into stinode scripts
 */

class BetterStdin {
  constructor (stdin = process.stdin) {
    this.stdin = stdin
    this.values = [] // This array holds the input's transformed values
    this.endValue = null // This variable hold the final value after everything has been transformed
  }

  /**
   * This method starts listening to the stdin stream and transforms its values
   */
  start () {
    this.stdin.setEncoding('utf8')

    this.stdin.on('readable', () => {
      const chunk = this.stdin.read()
      if (chunk) {
        const transformed = this.transform(chunk.trimRight())
        const filter = !!transformed
        if (filter) this.values = [...this.values, transformed]
      }
    })

    return new Promise((resolve, reject) => {
      this.stdin.on('end', () => {
        this.endValue = this.end(this.values)
        return resolve(this.endValue)
      })
    })
  }

  /**
   * This is the default value transformer.
   * A value transformer receives a string chunk and returns a transformed string.
   */
  transform (chunk) {
    return chunk
  }

  /**
   * This is the default end of stream hook.
   * It receives an array of transformed strings and returns nothing.
   */
  end (values) {
    return values
  }

  /**
   * A chainable `map` method, same as Array#map.
   * An alias to setting the transform function to a given one
   */
  map (editor = () => {}) {
    const { transform } = this
    this.transform = chunk => {
      const transformed = transform(chunk)
      return !transformed ? transformed : editor(transformed)
    }
    return this
  }

  /**
   * A chainable `forEach` method, same as Array#forEach.
   * Runs a given function in the transform hook and does nothing with its results
   */
  forEach (cb = () => {}) {
    const { transform } = this
    this.transform = chunk => {
      const transformed = transform(chunk)
      cb(transformed)
      return transformed
    }
    return this
  }

  /**
   * A chainable `filter` method, same as Array#filter.
   * Runs a function that returns a boolean and uses that boolean to filter the stream
   */
  filter (editor = () => {}) {
    const { transform } = this
    this.transform = chunk => {
      const transformed = transform(chunk)
      const filter = editor(transformed)
      return filter ? transformed : null
    }
    return this
  }

  /**
   * A chainable JSON parser for the stdin stream.
   */
  json (options = { returnOne: false }) {
    this.transform = chunk => {
      try {
        return JSON.parse(chunk)
      } catch (err) {
        return chunk
      }
    }

    this.end = values => {
      const types = values.map(v => typeof v).filter(v => v !== 'object')
      if (types.length > 0) {
        try {

          return JSON.parse(values.join('\n'))
        } catch (err) {}
      }
      return values.length === 1 && options.returnOne ? values[0] : values
    }

    return this
  }
}

module.exports = BetterStdin
