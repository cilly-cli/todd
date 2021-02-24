import { CliCommand } from 'cilly'

export const linux = new CliCommand('linux', { inheritOpts: true })
  .withDescription('Package an executable as a Linux installer')
  .withHandler(() => {
    console.log('Building linux package...')
  })
