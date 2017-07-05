/**
 * index.js
 * This file holds the actual stdinode CLI + exports the BetterStdin instance.
 */

const vm = require('vm')
const fs = require('fs')
const path = require('path')
const BetterStdin = require('./lib')

const loadFile = filename => {
  return new Promise((resolve, reject) => {
    if (filename[0] === '~') {
      filename = filename.replace('~', process.env.HOME)
    }
    fs.readFile(path.resolve(filename), (err, data) => {
      if (err) return reject(err)
      return resolve(data.toString())
    })
  })
}

// No need for an external library for these options
const argv = process.argv.splice(2)
const cliActions = () => {
  const opt = argv[0]
  if (opt === '-e' || opt === '--eval') {
    const code = argv[1]
    return evalStdinode(code).then(result => {
      console.log(result)
    }).catch(e => { throw e })
  } else if (opt === '-h' || opt === '--help') {
    const { version } = require('./package.json')
    // I don't really like the whole backticks thingy
    console.log([
      `stdinode version ${version}`,
      '',
      'Usage:',
      ' $ stdinode [option] <filename|script>',
      '',
      'Options:',
      ' -e, --eval: set the stdinode CLI to eval mode and eval the given script',
      ' -h, --help: show this help information'
    ].join('\n'))
  } else {
    const filename = argv[0]
    return loadFile(filename).then(file => {
      return evalStdinode(file)
    }).then(result => {
      console.log(result)
    }).catch(e => { throw e })
  }
}

// A function that evaluates code from the terminal in a new context
const evalStdinode = code => {
  return vm.runInNewContext(`;(() => {
    const stdin = new BetterStdin(stream)
    ${code}
    ;return stdin.start() // Always make sure you got dem semicolons!
  })`, { BetterStdin, stream: process.stdin })()
}

cliActions()
