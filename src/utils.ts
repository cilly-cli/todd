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