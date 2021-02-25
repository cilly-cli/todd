import { CliCommand } from 'cilly'
import { config } from '../config'
import { deploy } from './deploy/deploy'
import { packer } from './packer/packer'

export const todd = new CliCommand('todd')
  .withDescription('Get your program to your users easily')
  .withVersion(config.package.version)
  .withSubCommands(packer, deploy)
  .withHandler(() => {
    todd.help()
  })
