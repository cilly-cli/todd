// @ts-ignore
import { MultiSelect, Select, Confirm, Input, Password } from 'enquirer'
import { existsSync } from 'fs'
import { icons, muted, say, success, warn } from './presentation'

export type Choice<T> = {
  name: string
  value: T
  disabled?: boolean | string
}

const addSelectHelp = (message: string): string =>
  `${say(message)}${muted('(Use arrow keys, confirm')} ${muted(`with ${success(icons.enter)})`)}\n`

const addCheckboxHelp = (message: string): string =>
  `${say(message)}${muted('(Use arrow keys, check')} ${success(icons.check)} ${muted('items with SPACE, confirm')} ${muted(`with ${success(icons.enter)})`)}\n`


const select = async <T>(message: string, choices: string[] | Choice<T>[]): Promise<T> => {
  const prompt = new Select({
    name: 'x',
    message: addSelectHelp(message),
    choices: choices,

    result(names: string[]): T[] {
      return this.map(names)
    },
  })

  const selected = Object.values(await prompt.run())[0] as T
  console.log()

  return selected
}

const checkbox = async <T>(
  message: string,
  choices: string[] | Choice<T>[],
  min = 0,
  validate?: (...[value, state, item, index]: any[]) => boolean | string
): Promise<T[]> => {
  const minMaxValidator = (value): string | boolean =>
    value.length < min ? warn(`Please select at least ${min} item(s).`) : true

  const multiSelectPrompt = new MultiSelect({
    name: 'x',
    message: addCheckboxHelp(message),
    choices: choices,
    validate: validate ?? minMaxValidator,
    result(names: string[]): T[] {
      return this.map(names)
    },
  })
  const selectedValues = Object.values(await multiSelectPrompt.run())

  console.log()
  return selectedValues as T[]
}

const confirm = async (message: string, initial?: boolean): Promise<boolean> => {
  const prompt = new Confirm({
    name: 'x',
    message: say(message, 'info', false),
    initial: initial,
  })
  const answer = await prompt.run()

  return answer
}

const input = async (
  message: string,
  initial?: string,
  validate?: (...[value, state, item, index]: any[]) => boolean | string | Promise<boolean | string>
): Promise<string> => {
  const prompt = new Input({
    name: 'x',
    message: say(message, 'info', false),
    initial: initial,
    validate: validate,
  })

  const result = await prompt.run()
  return result
}

const password = async (
  message: string,
  validate?: (...[value, state, item, index]: any[]) => boolean | string | Promise<boolean | string>
): Promise<string> => {
  const prompt = new Password({
    name: 'x',
    message: say(message, 'info', false),
    validate: validate
  })

  const result = await prompt.run()
  return result
}

const path = async (
  message: string,
  initial?: string
): Promise<string> => {
  const prompt = new Input({
    name: 'x',
    message: say(message, 'info', false),
    initial: initial,
    validate: (value): any => {
      if (!existsSync(value)) {
        return 'Path does not exist'
      } else {
        return true
      }
    }
  })

  const result = await prompt.run()
  return result
}

export const prompts = {
  select,
  checkbox,
  password,
  confirm,
  input,
  path
}