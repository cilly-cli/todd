import { CliCommand } from 'cilly'
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
    { name: ['-v', '--verbose'], description: 'Print verbosely' },
    { name: ['-d', '--dry-run'], description: 'Run as a dry run (nothing will be changed)' },
    {
      name: ['-rc', '--run-config'], description: 'Path to the toddrc.json file', defaultValue: 'toddrc.json', args: [
        { name: 'path', required: true }
      ]
    }
  )
  .withSubCommands(brew, github)
  .withHandler(() => {
    deploy.help()
  })
