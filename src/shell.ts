import { Global } from './global'
import { verbose, yellow } from './presentation'
import shelljs from 'shelljs'

const run = (command: string): shelljs.ShellString | null => {
  const msg = (Global.dryRun ? '[DRY RUN] ' : '') + `${yellow.bold('Shell:')} ${command}`
  verbose(msg)

  if (Global.dryRun) return null

  return shelljs.exec(command)
}

export const shell = {
  run
}
