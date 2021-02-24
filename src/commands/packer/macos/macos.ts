import { CliCommand } from 'cilly'

export const macos = new CliCommand('macos', { inheritOpts: true })
  .withDescription('Package an executable as a macOS installer')
  .withHandler(() => {
    console.log('Building macOS installer...')
  })
