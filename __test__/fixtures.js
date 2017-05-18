/**
 * fixtures.js
 * Test helpers file
 */

/**
 * A mock stdin class
 */
class MockStdin {
  constructor (data = []) {
    this._index = 0
    this._data = data
    this._hasNext = () => this._index < this._data.length

    // EventEmitter implementation
    this.__handlers = {}
  }

  setData (data = []) {
    this._data = data
  }

  setEncoding (encoding = 'utf8') {
    setTimeout(() => {
      this.emit('readable')
    }, 0)
  }

  read () {
    if (this._hasNext()) {
      setTimeout(() => this.emit('readable'), 0)
      return this._data[this._index++]
    } else {
      setTimeout(() => this.emit('end'), 0)
      return null
    }
  }

  on (event, cb) {
    if (this.__handlers[event]) {
      this.__handlers[event] = [cb, ...this.__handlers[event]]
    } else {
      this.__handlers[event] = [cb]
    }
  }

  emit (event) {
    this.__handlers[event].forEach(k => k())
  }
}

module.exports = {
  MockStdin
}
