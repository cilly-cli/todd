import { CliCommand } from 'cilly'
import { config } from '../config'
import { packer } from './packer/packer'

export const todd = new CliCommand('todd')
  .withDescription('Create an installer for your program!')
  .withVersion(config.package.version)
  .withSubCommands(packer)
  .withHandler(() => {
    todd.help()
  })

