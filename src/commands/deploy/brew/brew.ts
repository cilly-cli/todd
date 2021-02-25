import { CliCommand } from 'cilly'
import { DeployOptions } from '../deploy'

export type DeployBrewOptions = DeployOptions

export const brew = new CliCommand('brew', { inheritOpts: true })
  .withDescription('Deploy your program to Homebrew')
  .withHandler((args, opts: DeployOptions) => {
    brew.help()
  })
