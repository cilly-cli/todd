import { CliCommand } from 'cilly'

export const windows = new CliCommand('windows', { inheritOpts: true })
  .withDescription('Package an executable as a Windows installer')
  .withHandler(() => {
    console.log('Building Windows installer...')
  })
