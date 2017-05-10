const s = JSON.stringify({ a: 'b' }, null, 2)
let i = 0

const tm = str => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // console.log(s.split('\n')[i++])
      console.log(JSON.stringify({ a: 'b', b: Math.round(Math.random() * 100) }))
      return resolve()
    }, 50)
  })
}

tm()
  .then(() => tm())
  .then(() => tm())
