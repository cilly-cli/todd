import { OnProcessHook } from 'cilly'
import { http } from '../../../http'
import { say, verbose } from '../../../presentation'
import { prompts } from '../../../prompts'


const GITHUB_REGEX = /(http|https):\/\/github.com\//
const REPOSITORY_REGEX = /([^\/:]+)\/([^\/:]+)/
export const GITHUB_REPO_URL_REGEX = new RegExp(`${GITHUB_REGEX.source}${REPOSITORY_REGEX.source}`)


type PreloadedRepositoryInfo = {
  description: string,
  homepage: string,
  version: string,
  owner: string,
  repo: string
}

let preloadedInfo: PreloadedRepositoryInfo = {
  description: '',
  homepage: '',
  version: '',
  owner: '',
  repo: ''
}

const preloadPackageInfo = async (owner: string, repo: string): Promise<PreloadedRepositoryInfo> => {
  const info = await http.get<{
    description: string,
    homepage: string,
    html_url: string,
    releases_url: string,
  }>(`https://api.github.com/repos/${owner}/${repo}`)

  const latest = await http.get<{ tag_name: string }>(info.releases_url.replace('{/id}', '').concat('/latest'))

  return {
    repo: repo,
    owner: owner,
    description: info.description,
    version: latest.tag_name,
    homepage: info.homepage || `${info.html_url}#readme`,
  }
}

const tarballUrlHook: OnProcessHook = async (value, parsed, assign): Promise<void> => {
  if (!value) {
    value = await prompts.input('Please enter the URL to download the tarball (.tar.gz) of your program')
    await assign(value)
  }

  if (GITHUB_REPO_URL_REGEX.test(value)) {
    const [owner, repo] = value.match(GITHUB_REPO_URL_REGEX).slice(2)
    verbose(say(`GitHub repo ${owner}/${repo} detected, attempting to preload info...`, 'info', false))
    try {
      preloadedInfo = await preloadPackageInfo(owner, repo)
    } catch (err) {
      verbose(say(`Could not pre-fetch repo info from ${value}`, 'error', false))
    }
  }
}

const nameHook: OnProcessHook = async (value, parsed, assign): Promise<void> => {
  if (value) return

  await assign(await prompts.input('Please enter the name of the binary file to install', preloadedInfo.repo))
}

const homebrewUrlHook: OnProcessHook = async (value, parsed, assign): Promise<void> => {
  if (value) return

  const initial = preloadedInfo.repo ? `https://github.com/${preloadedInfo.owner}/homebrew-${preloadedInfo.repo}` : ''
  await assign(await prompts.input('Please enter the URL to your homebrew-* GitHub repository', initial))
}

const accessTokenHook: OnProcessHook = async (value, parsed, assign): Promise<void> => {
  if (value) return
  await assign(await prompts.password('Please enter the access token for the homebrew repository'))
}

const versionHook: OnProcessHook = async (value, parsed, assign): Promise<void> => {
  if (value) return
  await assign(await prompts.input('Please enter the version of the package', preloadedInfo.version))
}

const descriptionHook: OnProcessHook = async (value, parsed, assign): Promise<void> => {
  if (value) return
  await assign(await prompts.input('Please enter the package description', preloadedInfo.description))
}

const homepageHook: OnProcessHook = async (value, parsed, assign): Promise<void> => {
  if (value) return
  await assign(await prompts.input('Please enter the URL for the package homepage', preloadedInfo.homepage))
}

export const brewHooks = {
  tarballUrlHook,
  homebrewUrlHook,
  accessTokenHook,
  versionHook,
  descriptionHook,
  homepageHook,
  nameHook
}