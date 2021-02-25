import { Global } from './global'
import { yellow } from './presentation'
import shell from 'shelljs'

const run = (command: string): void => {
  if (Global.verbose) {
    console.log(`${yellow.bold('Shell:')} ${command}`)
  }

  if (Global.dryRun) return

  shell.exec(command)
}

export const Shell = {
  run
}