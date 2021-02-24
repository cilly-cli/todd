import { CliCommand } from 'cilly'
import { readFileSync } from 'fs'
import { PackerOptions } from '../packer'

interface MacOsPackerOptions extends PackerOptions {
  identifier: string
  signature: string
}

const loadRc = (path: string): MacOsPackerOptions => {
  const rc = JSON.parse(readFileSync(path).toString()) as { macos?: MacOsPackerOptions }
  if (rc.macos === undefined) {
    throw new Error(`${path} is missing its macos property.`)
  } else if (!rc.macos.identifier) {
    throw new Error(`${path} is missing its macos.identifier property.`)
  } else if (!rc.macos.signature) {
    throw new Error(`${path} is missing its macos.signature property`)
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