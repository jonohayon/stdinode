/* global test, describe, expect */
const { MockStdin } = require('./fixtures')
const BetterStdin = require('../lib')

// Ugh global variables :(
const stringified = JSON.stringify({ a: 'b' })
const streams = {
  regularText: new MockStdin(['some', 'content', 'for', 'stdin']),
  jsonOneLine: new MockStdin([stringified]),
  jsonMultiLine: new MockStdin(stringified.split('\n')),
  numbers: new MockStdin(['1', '2', '3', '4', '5'])
}

describe('Library', () => {
  describe('Without tranformer function', () => {
    test('should return the content it received without a transformer', () => {
      const stdin = new BetterStdin(streams.regularText)
      return expect(stdin.start()).resolves.toEqual(['some', 'content', 'for', 'stdin'])
    })
  })

  describe('JSON parsing', () => {
    test('should parse one line json correctly', () => {
      const stdin = new BetterStdin(streams.jsonOneLine)
      return expect(stdin.json().start()).resolves.toEqual([{ a: 'b' }])
    })

    test('should parse multiline json correctly', () => {
      const stdin = new BetterStdin(streams.jsonMultiLine)
      return expect(stdin.json().start()).resolves.toEqual([{ a: 'b' }])
    })
  })

  describe('Custom transformer function', () => {
    test('should transform the stdin stream correctly', () => {
      const stdin = new BetterStdin(streams.numbers)
      stdin.transform = chunk => Number(chunk)
      return expect(stdin.start()).resolves.toEqual([1, 2, 3, 4, 5])
    })
  })

  describe('Map function', () => {
    test('should map the stream\'s content correctly', () => {
      const stdin = new BetterStdin(streams.numbers)
      return stdin.forEach(console.log).start()
    })
  })
})
