import { CliCommand } from 'cilly'
import { linux } from './linux/linux'
import { macos } from './macos/macos'
import { windows } from './windows/windows'

export interface PackerOptions {
  verbose: boolean
  dryRun: boolean
  runConfig: string
  outDir: string
}

export const packer = new CliCommand('packer')
  .withDescription('Package an executable into an installer')
  .withOptions(
    { name: ['-v', '--verbose'], description: 'Print verbosely' },
    { name: ['-d', '--dry-run'], description: 'Run as a dry run (nothing will be changed)' },
    {
      name: ['-o', '--out-dir'], description: 'Output directory for the installer', defaultValue: './', args: [
        { name: 'path', required: true }
      ]
    },
    {
      name: ['-rc', '--run-config'], description: 'Path to the toddrc.json file', defaultValue: 'toddrc.json', args: [
        { name: 'path', required: true }
      ]
    }
  )
  .withSubCommands(macos, linux, windows)
  .withHandler(() => {
    packer.help()
  })
