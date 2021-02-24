import { CliCommand } from 'cilly'
import { config } from './config'

export const todd = new CliCommand('todd')
  .withDescription('Create an installer for your program!')
  .withVersion(config.package.version)
  .withHandler(() => {
    todd.help()
  })

