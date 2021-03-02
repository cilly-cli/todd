import chalk from 'chalk'
import { Global } from './global'

const colors = {
  info: '#6EC1E4',
  success: '#26C485',
  warn: '#F7B538',
  error: '#D8315B',
  muted: '#8A8A8A',
}

export const info = (msg: string): string => {
  return chalk.hex(colors.info).bold(msg)
}

export const success = (msg: string): string => {
  return chalk.hex(colors.success).bold(msg)
}

export const warn = (msg: string): string => {
  return chalk.hex(colors.warn).bold(msg)
}

export const error = (msg: string): string => {
  return chalk.hex(colors.error).bold(msg)
}

export const muted = (msg: string): string => {
  return chalk.dim(msg)
}

export const underlined = (msg: string): string => {
  return chalk.underline(msg)
}

export const cyan = chalk.hex(colors.info)
export const green = chalk.hex(colors.success)
export const yellow = chalk.hex(colors.warn)
export const red = chalk.hex(colors.error)

export const icons = {
  check: process.platform == 'win32' ? '√' : '✔',
  cross: process.platform == 'win32' ? '×' : '✖',
  enter: process.platform == 'win32' ? 'ENTER' : '⎆'
}

export const say = (msg: string, mode: 'info' | 'success' | 'warning' | 'error' = 'info', print = true): string => {
  const color = mode == 'info' ? info
    : mode == 'error' ? error
      : mode == 'success' ? success : warn

  msg = `${color('Todd:')} ${msg}`

  if (print) {
    console.log(msg)
  }

  return msg
}

export const verbose = (msg: any): void => {
  if (Global.verbose) {
    console.log(msg)
  }
}