import { todd } from '..'

todd.process(process.argv)
  .catch(e => {
    if (process.env.NODE_ENV === 'development') {
      console.log(e)
    } else {
      console.log(`${e.name}: ${e.message}`)
    }
  })
