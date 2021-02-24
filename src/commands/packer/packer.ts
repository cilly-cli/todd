import { CliCommand } from 'cilly'
import { linux } from './linux/linux'
import { macos } from './macos/macos'
import { windows } from './windows/windows'

export const packer = new CliCommand('packer')
  .withDescription('Package an executable into an installer')
  .withOptions(
    { name: ['-v', '--verbose'], description: 'Print verbosely' },
    { name: ['-d', '--dry-run'], description: 'Run as a dry run (nothing will be changed)' }
  )
  .withSubCommands(macos, windows, linux)
  .withHandler(() => {
    packer.help()
  })
