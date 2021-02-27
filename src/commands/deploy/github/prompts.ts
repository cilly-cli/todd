import { prompts } from '../../../prompts'

export const promptVersion = async (): Promise<string> => prompts.input('Please enter the version of the release', 'v1.0.0')
export const promptTitle = async (): Promise<string> => prompts.input('Please enter the title of the release', 'Release-v1.0.0')
export const promptRepository = async (): Promise<string> => prompts.input('Please enter the repository name', 'octocat')
export const promptBranch = async (): Promise<string> => prompts.input('Please enter the branch to release from', 'main')
export const promptAccessToken = async (): Promise<string> => prompts.password('Please enter your GitHub access token (See: https://tinyurl.com/bdvkvu29)')
export const promptDraft = async (): Promise<boolean> => prompts.confirm('Is this a draft release?', true)
export const promptPrerelease = async (): Promise<boolean> => prompts.confirm('Is this a pre-release?', false)
export const promptChangelogPath = async (): Promise<string | undefined> => {
  if (await prompts.confirm('Include a changelog with this release?')) {
    return prompts.path('Please enter the path of the changelog file', 'changelog.md')
  } else {
    return undefined
  }
}
export const promptAssets = async (): Promise<string[]> => {
  const assets: string[] = []
  let msg = 'Include assets with this release?'
  while (await prompts.confirm(msg, true)) {
    assets.push(await prompts.path('Please enter the path of the asset', 'installer.zip'))
    msg = 'Add another asset?'
  }

  return assets
}
