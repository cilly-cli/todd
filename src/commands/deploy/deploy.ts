import { CliCommand } from 'cilly'
import { Global } from '../../global'
import { yellow } from '../../presentation'
import { brew } from './brew/brew'
import { github } from './github/github'

export interface DeployOptions {
  verbose: boolean
  dryRun: boolean
  runConfig: string
  outDir: string
}

export const deploy = new CliCommand('deploy')
  .withDescription('Deploy your program to Homebrew or Snap, or create a GitHub release with your program')
  .withOptions(
    { name: ['-vb', '--verbose'], description: 'Print verbosely', onParse: () => { Global.verbose = true } },
    { name: ['-dr', '--dry-run'], description: `Run as a dry run ${yellow('(nothing will be changed)')}`, onParse: () => { Global.dryRun = true } },
  )
  .withSubCommands(brew, github)
  .withHandler(() => {
    deploy.help()
  })
