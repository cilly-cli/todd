import { CliCommand } from 'cilly'
import { readFileSync } from 'fs'
import { getMissingPropertyPath } from '../../../utils'
import { PackerOptions } from '../packer'

interface MacOsPackerOptions extends PackerOptions {
  identifier: string
  signature: string
}

const loadRc = (path: string): MacOsPackerOptions => {
  const rc = JSON.parse(readFileSync(path).toString()) as { macos: MacOsPackerOptions }
  const missingProperty = getMissingPropertyPath(rc, {
    'macos': {
      'identifier': null,
      'signature': null
    }
  })

  if (missingProperty) {
    throw new Error(`The property "${missingProperty}" is missing from ${path}.`)
  }

  return rc.macos
}

export const macos = new CliCommand('macos', { inheritOpts: true })
  .withDescription('Package an executable as a macOS installer')
  .withOptions(
    {
      name: ['-s', '--signature'], description: 'The signature to use for signing this package', args: [
        { name: 'sig', required: true }
      ]
    },
    {
      name: ['-i', '--identifier'], description: 'The identifier for this package, e.g. com.todd.cli', args: [
        { name: 'id', required: true }
      ]
    }
  )
  .withHandler((args, opts: MacOsPackerOptions) => {
    opts = { ...opts, ...loadRc(opts.runConfig) }
    console.log(opts)
  })