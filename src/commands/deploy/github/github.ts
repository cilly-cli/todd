import { CliCommand } from 'cilly'
import { DeployOptions } from '../deploy'

export type DeployGitHubOptions = DeployOptions

export const github = new CliCommand('github', { inheritOpts: true })
  .withDescription('Create a GitHub release with your program as an asset')
  .withHandler((args, opts: DeployOptions) => {
    github.help()
  })
