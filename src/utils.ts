import { OnProcessHook } from 'cilly'

export const getMissingPropertyPath = (object: any, expected: any, propertyPath: string[] = []): string | undefined => {
  for (const [property, child] of Object.entries(expected)) {
    if (!(property in object)) {
      return [...propertyPath, property].join('.')
    }

    if (child) {
      const missing = getMissingPropertyPath(object[property], child, propertyPath.concat(property))
      if (missing) {
        return missing
      }
    }
  }

  return undefined
}

export const promptIfUndefined = (prompt: () => Promise<any>): OnProcessHook => async (value, input, assign): Promise<void> => {
  if (value === undefined) {
    await assign(await prompt())
  }
}