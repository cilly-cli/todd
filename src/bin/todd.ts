import { todd } from '..'

todd.process(process.argv)
  .catch(e => {
    console.log('Something went wrong...', e)
  })