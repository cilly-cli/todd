import { Global } from './global'
import { yellow } from './presentation'
import shelljs from 'shelljs'

const run = (command: string): shelljs.ShellString | null => {
  if (Global.verbose) {
    console.log(`${yellow.bold('Shell:')} ${command}`)
  }

  if (Global.dryRun) return null

  return shelljs.exec(command)
}

export const shell = {
  run
}
